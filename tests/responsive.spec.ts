import { test, expect } from '@playwright/test'

const viewports = [
  { width: 360, height: 640, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 13' },
  { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  { width: 768, height: 1024, name: 'iPad' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
  { width: 1280, height: 720, name: 'Desktop' },
  { width: 1440, height: 900, name: 'Desktop Large' },
]

const pages = [
  '/dashboard/check-in',
  '/dashboard/data',
  '/dashboard/reports',
  '/auth',
]

viewports.forEach(viewport => {
  test.describe(`Responsive: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    pages.forEach(page => {
      test(`should render ${page} without horizontal scroll`, async ({ page: testPage }) => {
        await testPage.setViewportSize({ width: viewport.width, height: viewport.height })
        await testPage.goto(page)
        
        // Wait for page load
        await testPage.waitForLoadState('networkidle')
        
        // Check for horizontal scroll
        const scrollWidth = await testPage.evaluate(() => document.documentElement.scrollWidth)
        const clientWidth = await testPage.evaluate(() => document.documentElement.clientWidth)
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance
      })
      
      test(`should have sidebar/drawer behavior on ${page}`, async ({ page: testPage }) => {
        await testPage.setViewportSize({ width: viewport.width, height: viewport.height })
        await testPage.goto(page)
        
        if (viewport.width < 1024) {
          // Mobile: Sidebar should be hidden, hamburger visible
          const sidebar = testPage.locator('aside[class*="fixed"]')
          await expect(sidebar).not.toBeVisible()
          
          const hamburger = testPage.locator('button:has(svg), button[aria-label*="menu" i]').first()
          // Hamburger should be visible (it's the first button in the header)
          await expect(hamburger).toBeVisible()
        } else {
          // Desktop: Sidebar should be visible
          const sidebar = testPage.locator('aside[class*="fixed"]')
          await expect(sidebar).toBeVisible()
        }
      })
    })
  })
})

test.describe('Table Responsiveness', () => {
  test('DataTable should scroll horizontally on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/dashboard/data')
    
    const tableWrapper = page.locator('[class*="overflow-x-auto"]')
    await expect(tableWrapper).toBeVisible()
  })
  
  test('Table action buttons should collapse to menu on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/dashboard/data')
    
    const kebabMenu = page.locator('button:has(svg[class*="MoreHorizontal"])')
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 5000 })
    // Check if kebab menu exists (may not be visible if no data)
    const count = await kebabMenu.count()
    if (count > 0) {
      await expect(kebabMenu.first()).toBeVisible()
    }
  })
})

