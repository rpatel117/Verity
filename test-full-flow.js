const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://rusqnjonwtgzcccyhjze.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.cIcjqiy-o4iMsj-h1URkJhKZr0k2WJpyrWUkdLZxBMM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullFlow() {
  console.log('🚀 Starting full end-to-end test...');
  const browser = await chromium.launch({ headless: false }); // Keep browser open to see what's happening
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login to the app
    console.log('📱 Step 1: Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('🔑 Step 2: Opening login modal...');
    const signInButton = page.locator('button:has-text("Sign In")').first();
    await signInButton.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    console.log('🔐 Step 3: Filling login form...');
    await page.fill('input[type="email"]', 'lilrushi32@gmail.com');
    await page.fill('input[type="password"]', 'Rus!112233');
    
    console.log('🖱️ Step 4: Clicking login button...');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Successfully logged in and redirected to dashboard');

    // Step 5: Fill out check-in form
    console.log('📝 Step 5: Filling check-in form...');
    
    // Guest information
    await page.fill('input[name="guest.fullName"]', 'Cursor Test Guest');
    await page.fill('input[name="guest.phoneE164"]', '+15551234567');
    await page.fill('input[name="guest.dlNumber"]', 'DL123456789');
    await page.selectOption('select[name="guest.dlState"]', 'CA');
    
    // Stay information
    await page.fill('input[name="stay.ccLast4"]', '1234');
    await page.fill('input[name="stay.checkInDate"]', '2024-01-15');
    await page.fill('input[name="stay.checkOutDate"]', '2024-01-17');
    
    // Policy text
    const policyText = 'I confirm I am the authorized cardholder or their agent, consent to this verification process, and understand that this information will be used for identity verification purposes.';
    await page.fill('textarea[name="policyText"]', policyText);
    
    console.log('📤 Step 6: Submitting attestation...');
    await page.click('button[type="submit"]');
    
    // Wait for the attestation to be sent and get the response
    console.log('⏳ Step 7: Waiting for attestation response...');
    await page.waitForTimeout(3000); // Give time for the API call to complete
    
    // Step 8: Get the verification code from Supabase logs
    console.log('🔍 Step 8: Retrieving verification code from database...');
    
    // Query the most recent attestation for our test guest
    const { data: attestations, error: attestationError } = await supabase
      .from('attestations')
      .select('*')
      .eq('guest_full_name', 'Cursor Test Guest')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (attestationError || !attestations || attestations.length === 0) {
      console.error('❌ Failed to retrieve attestation:', attestationError);
      throw new Error('Could not retrieve attestation from database');
    }
    
    const attestation = attestations[0];
    console.log('📊 Retrieved attestation:', {
      id: attestation.id,
      guest_name: attestation.guest_full_name,
      status: attestation.status,
      created_at: attestation.created_at
    });
    
    // Get the verification code from the attestation_events
    const { data: events, error: eventsError } = await supabase
      .from('attestation_events')
      .select('*')
      .eq('attestation_id', attestation.id)
      .eq('event_type', 'sms.sent')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (eventsError || !events || events.length === 0) {
      console.error('❌ Failed to retrieve SMS event:', eventsError);
      throw new Error('Could not retrieve SMS event from database');
    }
    
    const smsEvent = events[0];
    const eventData = smsEvent.event_data;
    const verificationCode = eventData.message.match(/Code: (\d{6})/)?.[1];
    
    if (!verificationCode) {
      console.error('❌ Could not extract verification code from event data:', eventData);
      throw new Error('Could not extract verification code');
    }
    
    console.log('🔢 Step 9: Extracted verification code:', verificationCode);
    
    // Step 10: Input the verification code
    console.log('⌨️ Step 10: Inputting verification code...');
    
    // Look for the code verification component
    const codeInput = page.locator('input[type="text"][maxlength="6"]').first();
    if (await codeInput.isVisible()) {
      await codeInput.fill(verificationCode);
      console.log('✅ Code input filled');
    } else {
      console.log('⚠️ Code input not found, looking for alternative selectors...');
      
      // Try different selectors for the code input
      const alternativeSelectors = [
        'input[placeholder*="code" i]',
        'input[placeholder*="verification" i]',
        'input[placeholder*="6-digit" i]',
        'input[maxlength="6"]',
        'input[type="text"]'
      ];
      
      let codeInputFound = false;
      for (const selector of alternativeSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await element.fill(verificationCode);
          console.log(`✅ Code input found with selector: ${selector}`);
          codeInputFound = true;
          break;
        }
      }
      
      if (!codeInputFound) {
        console.log('❌ Could not find code input field');
        // Take a screenshot to see what's on the page
        await page.screenshot({ path: 'code-input-debug.png' });
        console.log('📸 Screenshot saved as code-input-debug.png');
        throw new Error('Could not find code input field');
      }
    }
    
    // Step 11: Click verify button
    console.log('🔍 Step 11: Looking for verify button...');
    
    const verifyButton = page.locator('button:has-text("Verify")').first();
    if (await verifyButton.isVisible()) {
      console.log('🖱️ Clicking verify button...');
      await verifyButton.click();
      
      // Wait for verification to complete
      console.log('⏳ Step 12: Waiting for verification to complete...');
      await page.waitForTimeout(3000);
      
      // Check if verification was successful
      console.log('🔍 Step 13: Checking verification result...');
      
      // Check for success indicators
      const successIndicators = [
        'text=Successfully verified',
        'text=Verification successful',
        'text=Guest successfully checked in',
        'text=Check-in complete'
      ];
      
      let verificationSuccess = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).isVisible()) {
          console.log('✅ Verification successful!');
          verificationSuccess = true;
          break;
        }
      }
      
      if (!verificationSuccess) {
        console.log('⚠️ Could not find success message, checking database...');
        
        // Check database for verification
        const { data: updatedAttestation, error: updateError } = await supabase
          .from('attestations')
          .select('*')
          .eq('id', attestation.id)
          .single();
        
        if (updateError) {
          console.error('❌ Error checking attestation status:', updateError);
        } else {
          console.log('📊 Attestation status:', {
            id: updatedAttestation.id,
            status: updatedAttestation.status,
            verified_at: updatedAttestation.verified_at
          });
          
          if (updatedAttestation.status === 'verified') {
            console.log('✅ Database shows verification successful!');
            verificationSuccess = true;
          }
        }
      }
      
      if (verificationSuccess) {
        console.log('🎉 Full end-to-end test PASSED!');
        console.log('📋 Test Summary:');
        console.log('  ✅ Login successful');
        console.log('  ✅ Check-in form submitted');
        console.log('  ✅ Attestation created in database');
        console.log('  ✅ Verification code extracted');
        console.log('  ✅ Code verification completed');
        console.log('  ✅ Database updated successfully');
      } else {
        console.log('❌ Verification failed or incomplete');
        await page.screenshot({ path: 'verification-failed.png' });
        console.log('📸 Screenshot saved as verification-failed.png');
      }
      
    } else {
      console.log('❌ Verify button not found');
      await page.screenshot({ path: 'verify-button-debug.png' });
      console.log('📸 Screenshot saved as verify-button-debug.png');
      throw new Error('Could not find verify button');
    }
    
  } catch (error) {
    console.error('🔥 Full flow test failed:', error);
    await page.screenshot({ path: 'test-failure.png' });
    console.log('📸 Screenshot saved as test-failure.png');
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

// Run the test
testFullFlow().catch(console.error);
