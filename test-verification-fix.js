const { chromium } = require('playwright');

async function testVerificationFlow() {
  console.log('🧪 Testing verification flow fixes...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Login
    console.log('🔐 Logging in...');
    const signInButton = page.locator('button:has-text("Sign In")').first();
    await signInButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    await page.fill('input[type="email"]', 'lilrushi32@gmail.com');
    await page.fill('input[type="password"]', 'Rus!112233');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Logged in successfully');
    
    // Navigate to check-in page
    console.log('🧪 Navigating to check-in page...');
    await page.goto('http://localhost:3000/dashboard/check-in');
    await page.waitForLoadState('networkidle');
    
    // Fill out check-in form
    console.log('📝 Filling out check-in form...');
    await page.fill('input[name="fullName"]', 'Test Guest');
    await page.fill('input[name="phoneE164"]', '+1234567890');
    await page.fill('input[name="ccLast4"]', '1234');
    await page.fill('input[name="dlNumber"]', 'DL123456');
    await page.fill('input[name="dlState"]', 'CA');
    
    // Submit form
    console.log('📤 Submitting check-in form...');
    await page.click('button[type="submit"]');
    
    // Wait for form submission and check for duplicate calls
    console.log('⏳ Waiting for form submission...');
    await page.waitForTimeout(3000);
    
    // Check if code verification section appears
    console.log('🔍 Looking for code verification section...');
    const codeVerificationSection = page.locator('text=Code Verification');
    if (await codeVerificationSection.isVisible()) {
      console.log('✅ Code verification section appeared');
      
      // Test with test code 117001
      console.log('🧪 Testing with test code 117001...');
      const otpInputs = page.locator('[data-testid="otp-input"]');
      if (await otpInputs.count() > 0) {
        // Fill in test code
        await page.fill('input[data-testid="otp-input"]', '117001');
        await page.click('button:has-text("Verify Code")');
        
        // Wait for success message
        await page.waitForSelector('text=Guest successfully checked in!', { timeout: 5000 });
        console.log('✅ Test code verification worked');
      }
      
      // Test with incorrect code
      console.log('🧪 Testing with incorrect code...');
      await page.fill('input[data-testid="otp-input"]', '999999');
      await page.click('button:has-text("Verify Code")');
      
      // Wait for error message
      await page.waitForSelector('text=Invalid code', { timeout: 5000 });
      console.log('✅ Error handling worked correctly');
      
    } else {
      console.log('❌ Code verification section did not appear');
    }
    
    console.log('🎉 Verification flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testVerificationFlow().catch(console.error);



