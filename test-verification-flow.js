const { chromium } = require('playwright');

async function testVerificationFlow() {
  console.log('🧪 Starting verification flow test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Sign In button
    await page.click('text=Sign In');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill login form
    await page.fill('input[name="email"]', 'lilrushi32@gmail.com');
    await page.fill('input[name="password"]', 'Rus!112233');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('✅ Login successful');

    // Step 2: Fill check-in form
    console.log('📝 Step 2: Filling check-in form...');
    await page.goto('http://localhost:3000/dashboard/check-in');
    await page.waitForLoadState('networkidle');
    
    // Fill form with test data
    await page.fill('input[name="guest.fullName"]', 'Test Guest Verification');
    await page.fill('input[name="guest.phoneE164"]', '+15551234567');
    await page.fill('input[name="guest.dlNumber"]', 'DL123456789');
    await page.fill('input[name="guest.dlState"]', 'CA');
    await page.fill('input[name="stay.ccLast4"]', '1234');
    
    // Set future dates
    await page.fill('input[name="stay.checkInDate"]', '2025-10-19');
    await page.fill('input[name="stay.checkOutDate"]', '2025-10-21');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Form submitted');

    // Step 3: Wait for verification component and get the code
    console.log('📝 Step 3: Waiting for verification component...');
    await page.waitForSelector('[data-testid="code-verification"]', { timeout: 10000 });
    
    // Get the verification code from the form response (it should be displayed in the UI)
    // Look for any text that contains a 6-digit code
    const codeElement = await page.locator('text=/\\d{6}/').first();
    const displayedCode = await codeElement.textContent();
    console.log('🔍 Found displayed code:', displayedCode);

    // Step 4: Enter the verification code
    console.log('📝 Step 4: Entering verification code...');
    
    // Fill the code input
    await page.fill('input[name="code"]', displayedCode || '123456');
    
    // Submit verification
    await page.click('button[type="submit"]');
    console.log('✅ Verification submitted');

    // Step 5: Check for success
    console.log('📝 Step 5: Checking for success...');
    
    // Wait for either success message or error
    try {
      await page.waitForSelector('text=Guest successfully checked in!', { timeout: 5000 });
      console.log('✅ SUCCESS: Verification completed successfully!');
    } catch (error) {
      console.log('❌ FAILED: No success message found');
      
      // Check for error messages
      const errorText = await page.locator('[data-testid="error-message"]').textContent();
      if (errorText) {
        console.log('❌ Error message:', errorText);
      }
    }

    // Wait a bit to see the result
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testVerificationFlow().catch(console.error);
