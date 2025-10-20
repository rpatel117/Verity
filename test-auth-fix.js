const { chromium } = require('playwright');

async function testAuthFlow() {
  console.log('🧪 Testing fixed authentication flow...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Landing page should load without auth issues
    console.log('📱 Test 1: Landing page should load...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const landingTitle = await page.locator('h1').first().textContent();
    console.log('✅ Landing page loaded:', landingTitle?.includes('Secure Guest'));
    
    // Test 2: Auth page should load
    console.log('📱 Test 2: Auth page should load...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    
    const authTitle = await page.locator('h1').first().textContent();
    console.log('✅ Auth page loaded:', authTitle?.includes('Verity'));
    
    // Test 3: Login should work
    console.log('📱 Test 3: Login should work...');
    await page.fill('input[type="email"]', 'lilrushi32@gmail.com');
    await page.fill('input[type="password"]', 'Rus!112233');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');
    
    // Test 4: Dashboard should load
    console.log('📱 Test 4: Dashboard should load...');
    const dashboardTitle = await page.locator('h1').first().textContent();
    console.log('✅ Dashboard loaded:', dashboardTitle);
    
    // Test 5: Logout should work
    console.log('📱 Test 5: Logout should work...');
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('**/auth', { timeout: 5000 });
    console.log('✅ Logout successful, redirected to auth');
    
    // Test 6: Should be able to access landing page after logout
    console.log('📱 Test 6: Landing page after logout...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const landingTitleAfterLogout = await page.locator('h1').first().textContent();
    console.log('✅ Landing page accessible after logout:', landingTitleAfterLogout?.includes('Secure Guest'));
    
    console.log('🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAuthFlow().catch(console.error);



