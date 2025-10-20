const { chromium } = require('playwright');

async function testSimpleVerification() {
  console.log('🧪 Testing verification flow...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login
    console.log('📝 Logging in...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Sign In');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    await page.fill('input[name="email"]', 'lilrushi32@gmail.com');
    await page.fill('input[name="password"]', 'Rus!112233');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    console.log('✅ Login successful');

    // Go to check-in page
    console.log('📝 Going to check-in page...');
    await page.goto('http://localhost:3000/dashboard/check-in');
    await page.waitForLoadState('networkidle');

    // Fill form quickly
    console.log('📝 Filling form...');
    await page.fill('input[name="guest.fullName"]', 'Test Verification');
    await page.fill('input[name="guest.phoneE164"]', '+15551234567');
    await page.fill('input[name="guest.dlNumber"]', 'DL123456789');
    await page.fill('input[name="guest.dlState"]', 'CA');
    await page.fill('input[name="stay.ccLast4"]', '1234');
    await page.fill('input[name="stay.checkInDate"]', '2025-10-19');
    await page.fill('input[name="stay.checkOutDate"]', '2025-10-21');
    
    // Submit and wait for verification component
    console.log('📝 Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for verification component
    await page.waitForSelector('h3:has-text("Verify Guest Check-in")', { timeout: 10000 });
    console.log('✅ Verification component appeared');

    // Test with the test code 117001
    console.log('📝 Testing with code 117001...');
    await page.fill('input[name="code"]', '117001');
    await page.click('button[type="submit"]');
    
    // Wait for success
    await page.waitForSelector('text=Guest successfully checked in!', { timeout: 5000 });
    console.log('✅ SUCCESS: Test code 117001 worked!');

    // Now test with a real code - let's try 123456
    console.log('📝 Testing with real code 123456...');
    await page.fill('input[name="code"]', '123456');
    await page.click('button[type="submit"]');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(3000);
    
    // Check if there's an error message
    const errorElement = await page.locator('text=/Invalid|Failed|Error/').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('❌ Real code failed:', errorText);
    } else {
      console.log('✅ Real code might have worked!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleVerification().catch(console.error);



