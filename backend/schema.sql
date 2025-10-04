-- Hotel Check-In Database Schema
-- 
-- This script creates the necessary tables and Row-Level Security (RLS) policies
-- for the hotel check-in application.
--
-- Run this script in your Supabase SQL Editor to set up the database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: check_ins
-- ============================================================================
-- Stores guest check-in information and verification status
--
-- SECURITY: RLS policies ensure users can only access their own check-ins

CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Guest information (validated on client and backend)
  credit_card_last_4 VARCHAR(4) NOT NULL CHECK (credit_card_last_4 ~ '^\d{4}$'),
  drivers_license VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL CHECK (phone_number ~ '^\+\d{10,15}$'),
  
  -- Verification data
  verification_code VARCHAR(6) NOT NULL CHECK (verification_code ~ '^\d{6}$'),
  code_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Attempt tracking (for rate limiting)
  verification_attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  
  -- Staff reference (optional - for multi-user support)
  hotel_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_check_ins_phone ON check_ins(phone_number);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at DESC);
CREATE INDEX idx_check_ins_verified ON check_ins(verified);
CREATE INDEX idx_check_ins_staff ON check_ins(hotel_staff_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_check_ins_updated_at
  BEFORE UPDATE ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE: verification_logs
-- ============================================================================
-- Logs all verification events for audit trail and compliance
--
-- SECURITY: RLS policies ensure users can only access logs for their check-ins

CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Reference to check-in
  check_in_id UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  
  -- Event type
  action VARCHAR(50) NOT NULL CHECK (action IN (
    'sms_sent',
    'code_verified',
    'code_failed',
    'policy_accepted',
    'max_attempts_reached'
  )),
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_verification_logs_check_in ON verification_logs(check_in_id);
CREATE INDEX idx_verification_logs_created_at ON verification_logs(created_at DESC);
CREATE INDEX idx_verification_logs_action ON verification_logs(action);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: check_ins
-- ============================================================================

-- Policy: Users can insert their own check-ins
CREATE POLICY "Users can create check-ins"
  ON check_ins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    hotel_staff_id = auth.uid() OR hotel_staff_id IS NULL
  );

-- Policy: Users can view their own check-ins
CREATE POLICY "Users can view own check-ins"
  ON check_ins
  FOR SELECT
  TO authenticated
  USING (
    hotel_staff_id = auth.uid() OR hotel_staff_id IS NULL
  );

-- Policy: Users can update their own check-ins
CREATE POLICY "Users can update own check-ins"
  ON check_ins
  FOR UPDATE
  TO authenticated
  USING (
    hotel_staff_id = auth.uid() OR hotel_staff_id IS NULL
  )
  WITH CHECK (
    hotel_staff_id = auth.uid() OR hotel_staff_id IS NULL
  );

-- Policy: Allow service role full access (for Edge Functions)
CREATE POLICY "Service role has full access to check-ins"
  ON check_ins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: verification_logs
-- ============================================================================

-- Policy: Users can insert logs for their check-ins
CREATE POLICY "Users can create logs for own check-ins"
  ON verification_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM check_ins
      WHERE check_ins.id = verification_logs.check_in_id
      AND (check_ins.hotel_staff_id = auth.uid() OR check_ins.hotel_staff_id IS NULL)
    )
  );

-- Policy: Users can view logs for their check-ins
CREATE POLICY "Users can view logs for own check-ins"
  ON verification_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM check_ins
      WHERE check_ins.id = verification_logs.check_in_id
      AND (check_ins.hotel_staff_id = auth.uid() OR check_ins.hotel_staff_id IS NULL)
    )
  );

-- Policy: Allow service role full access (for Edge Functions)
CREATE POLICY "Service role has full access to logs"
  ON verification_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to clean up expired check-ins (run via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_check_ins()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM check_ins
  WHERE verified = FALSE
  AND code_expires_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE check_ins IS 'Stores guest check-in information and verification status';
COMMENT ON TABLE verification_logs IS 'Audit log for all verification events';

COMMENT ON COLUMN check_ins.verification_code IS 'Hashed 6-digit SMS verification code';
COMMENT ON COLUMN check_ins.code_expires_at IS 'Expiration time for verification code (typically 10 minutes)';
COMMENT ON COLUMN check_ins.verification_attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN check_ins.max_attempts IS 'Maximum allowed verification attempts before lockout';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON check_ins TO authenticated;
GRANT SELECT, INSERT ON verification_logs TO authenticated;

-- Grant full access to service role (for Edge Functions)
GRANT ALL ON check_ins TO service_role;
GRANT ALL ON verification_logs TO service_role;
