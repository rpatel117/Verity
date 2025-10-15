-- Production Schema Migration
-- Revises existing schema to support proper multi-tenancy, attestation lifecycle, and security

-- 1. Create hotels table for proper multi-tenancy
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update profiles table to reference hotels
-- First, add new columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('admin','staff')) DEFAULT 'staff';

-- 3. Create guests table (separate from attestations for better normalization)
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  dl_number TEXT,
  dl_state TEXT,
  cc_last4 TEXT CHECK (char_length(cc_last4)=4),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Revise attestations table with new structure
-- Drop old table and recreate with new schema
DROP TABLE IF EXISTS attestations CASCADE;

CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,                  -- bcrypt hash of 6-digit code
  code_enc TEXT,                            -- optional: short-lived encrypted raw code for guest display
  token TEXT NOT NULL UNIQUE,               -- signed token (JWT)
  sms_sid TEXT,
  sms_status TEXT,                          -- accepted/sent/delivered/failed (Twilio callbacks)
  policy_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verification_method TEXT CHECK (verification_method IN ('code','link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Update attestation_events table with more event types
DROP TABLE IF EXISTS attestation_events CASCADE;

CREATE TABLE attestation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attestation_id UUID NOT NULL REFERENCES attestations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,    -- 'sms.sent','sms.status','page.open','geo.capture','policy.accept','code.submit'
  ip TEXT,
  user_agent TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  accuracy NUMERIC,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Update reports table
DROP TABLE IF EXISTS reports CASCADE;

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  attestation_ids UUID[] NOT NULL,
  storage_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS ix_guests_hotel_date ON guests (hotel_id, check_in_date);
CREATE INDEX IF NOT EXISTS ix_guests_hotel_name ON guests (hotel_id, full_name);
CREATE INDEX IF NOT EXISTS ix_attest_guest_sent ON attestations (guest_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS ix_events_attest_time ON attestation_events (attestation_id, created_at);
CREATE INDEX IF NOT EXISTS ix_reports_hotel_time ON reports (hotel_id, generated_at DESC);

-- 8. Enable RLS on all tables
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Hotels can view own attestations" ON attestations;
DROP POLICY IF EXISTS "Hotels can insert own attestations" ON attestations;
DROP POLICY IF EXISTS "Hotels can view events for own attestations" ON attestation_events;
DROP POLICY IF EXISTS "Hotels can view own reports" ON reports;
DROP POLICY IF EXISTS "Hotels can insert own reports" ON reports;

-- Profiles: user sees self
CREATE POLICY "profiles self" ON profiles FOR SELECT USING (id = auth.uid());

-- Guests: hotel-scoped
CREATE POLICY "guests hotel read" ON guests FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = guests.hotel_id)
);
CREATE POLICY "guests hotel write" ON guests FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = hotel_id)
);

-- Attestations & events: join back to guests -> hotel scope
CREATE POLICY "attest hotel read" ON attestations FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM guests g JOIN profiles p ON p.id=auth.uid()
    WHERE g.id = guest_id AND g.hotel_id = p.hotel_id
  )
);

CREATE POLICY "attest hotel write" ON attestations FOR INSERT WITH CHECK (
  EXISTS(
    SELECT 1 FROM guests g JOIN profiles p ON p.id=auth.uid()
    WHERE g.id = guest_id AND g.hotel_id = p.hotel_id
  )
);

CREATE POLICY "events hotel read" ON attestation_events FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM attestations a JOIN guests g ON g.id=a.guest_id JOIN profiles p ON p.id=auth.uid()
    WHERE attestation_id=a.id AND g.hotel_id=p.hotel_id
  )
);

CREATE POLICY "events hotel write" ON attestation_events FOR INSERT WITH CHECK (
  EXISTS(
    SELECT 1 FROM attestations a JOIN guests g ON g.id=a.guest_id JOIN profiles p ON p.id=auth.uid()
    WHERE attestation_id=a.id AND g.hotel_id=p.hotel_id
  )
);

CREATE POLICY "reports hotel read" ON reports FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id=auth.uid() AND p.hotel_id=reports.hotel_id)
);
CREATE POLICY "reports hotel insert" ON reports FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id=auth.uid() AND p.hotel_id=hotel_id)
);

-- 10. Create RPC functions for data access
CREATE OR REPLACE FUNCTION list_attestations(
  p_hotel_id UUID,
  p_query TEXT DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_page_size INTEGER DEFAULT 50,
  p_cursor TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  guest_id UUID,
  guest_name TEXT,
  guest_phone TEXT,
  cc_last4 TEXT,
  check_in_date DATE,
  check_out_date DATE,
  status TEXT,
  sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  events_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cursor TIMESTAMPTZ;
BEGIN
  -- Check if user has access to this hotel
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.hotel_id = p_hotel_id
  ) THEN
    RAISE EXCEPTION 'Access denied to hotel data';
  END IF;

  v_cursor := COALESCE(p_cursor, NOW());

  RETURN QUERY
  SELECT 
    a.id,
    g.id as guest_id,
    g.full_name as guest_name,
    g.phone_e164 as guest_phone,
    g.cc_last4,
    g.check_in_date,
    g.check_out_date,
    CASE 
      WHEN a.verified_at IS NOT NULL THEN 'verified'
      WHEN a.sent_at < NOW() - INTERVAL '24 hours' THEN 'expired'
      ELSE 'sent'
    END as status,
    a.sent_at,
    a.verified_at,
    COUNT(ae.id) as events_count
  FROM attestations a
  JOIN guests g ON g.id = a.guest_id
  LEFT JOIN attestation_events ae ON ae.attestation_id = a.id
  WHERE g.hotel_id = p_hotel_id
    AND (p_query IS NULL OR (
      g.full_name ILIKE '%' || p_query || '%' OR
      g.phone_e164 ILIKE '%' || p_query || '%' OR
      g.cc_last4 ILIKE '%' || p_query || '%'
    ))
    AND (p_from_date IS NULL OR g.check_in_date >= p_from_date)
    AND (p_to_date IS NULL OR g.check_in_date <= p_to_date)
    AND (p_status IS NULL OR (
      CASE 
        WHEN a.verified_at IS NOT NULL THEN 'verified'
        WHEN a.sent_at < NOW() - INTERVAL '24 hours' THEN 'expired'
        ELSE 'sent'
      END = p_status
    ))
    AND (p_cursor IS NULL OR a.sent_at < p_cursor)
  GROUP BY a.id, g.id, g.full_name, g.phone_e164, g.cc_last4, g.check_in_date, g.check_out_date, a.sent_at, a.verified_at
  ORDER BY a.sent_at DESC
  LIMIT p_page_size;
END;
$$;

-- 11. Create storage bucket for reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verity-reports', 'verity-reports', false)
ON CONFLICT (id) DO NOTHING;

-- 12. Create storage policies for reports
CREATE POLICY "Reports are private" ON storage.objects 
FOR SELECT USING (bucket_id = 'verity-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload reports" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'verity-reports' AND auth.role() = 'authenticated');
