const { chromium } = require('playwright');

async function testAuthFlow() {
  console.log('🚀 Starting authentication flow test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📱 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the landing page (which is correct for unauthenticated users)
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl === 'http://localhost:3000/' || currentUrl === 'http://localhost:3000') {
      console.log('✅ On landing page as expected for unauthenticated user');
      
      // Look for Sign In button and click it
      console.log('🔍 Looking for Sign In button...');
      const signInButton = page.locator('button:has-text("Sign In")').first();
      await signInButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      console.log('✅ Login modal opened');
      
      // Fill in login form
      console.log('🔐 Filling login form...');
      await page.fill('input[type="email"]', 'lilrushi32@gmail.com');
      await page.fill('input[type="password"]', 'Rus!112233');
      
      // Click login button
      console.log('🖱️ Clicking login button...');
      await page.click('button[type="submit"]');
      
      // Wait for navigation to dashboard
      console.log('⏳ Waiting for dashboard...');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      const dashboardUrl = page.url();
      console.log('📍 Dashboard URL:', dashboardUrl);
      
      if (dashboardUrl.includes('/dashboard')) {
        console.log('✅ Successfully navigated to dashboard!');
        
        // Check if dashboard content is visible
        const dashboardContent = await page.locator('h1').first().textContent();
        console.log('📄 Dashboard content:', dashboardContent);
        
        // Test check-in page
        console.log('🧪 Testing check-in page...');
        await page.goto('http://localhost:3000/dashboard/check-in');
        await page.waitForLoadState('networkidle');
        
        const checkInTitle = await page.locator('h1').first().textContent();
        console.log('📄 Check-in page title:', checkInTitle);
        
        if (checkInTitle && checkInTitle.includes('Guest Check-In')) {
          console.log('✅ Check-in page loaded successfully!');
        } else {
          console.log('❌ Check-in page failed to load properly');
        }
        
        console.log('🎉 Authentication flow test PASSED!');
      } else {
        console.log('❌ Failed to navigate to dashboard');
      }
    } else {
      console.log('❌ Not redirected to auth page. Current URL:', currentUrl);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAuthFlow().catch(console.error);
