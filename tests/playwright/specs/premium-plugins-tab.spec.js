const { test, expect } = require('@playwright/test');
const { auth, a11y } = require('../../../../../../tests/playwright/helpers');
const marketplace = require('../helpers/marketplace');

test.describe('Plugins Premium Tab', () => {
  test.beforeEach(async ({ page }) => {
    // Setup marketplace API intercepts with delay
    await marketplace.setupMarketplaceIntercepts(page, { delay: 1000 });

    // Login to WordPress
    await auth.loginToWordPress(page);

    // Navigate to premium plugins tab
    await marketplace.navigateToPremiumPluginsTab(page);
  });

  test('Premium tab exist', async ({ page }) => {
    const premiumSection = page.locator('.wrap .nfd-premium-plugins-marketplace');
    await expect(premiumSection).toBeVisible();
    await expect(premiumSection).toContainText('Unlock the full potential of your WordPress website with premium plugins');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for premium plugins to load
    await marketplace.waitForPremiumPluginsLoad(page);
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(1000);
    
    // Run accessibility check on the premium plugins section
    await a11y.checkA11y(page, '.nfd-premium-plugins-marketplace');
  });

  test('Should have products', async ({ page }) => {
    // Wait for API call to complete
    await page.waitForResponse('**/newfold-marketplace/v1/marketplace**');
    
    // Wait for products to load
    await marketplace.waitForPremiumPluginsLoad(page);
    
    const pluginCards = page.locator('#the-list .plugin-card');
    await expect(pluginCards).toBeVisible();
  });

  test('Product should display properly', async ({ page }) => {
    // Wait for API call to complete
    await page.waitForResponse('**/newfold-marketplace/v1/marketplace**');
    
    // Wait for products to load
    await marketplace.waitForPremiumPluginsLoad(page);
    
    const firstCard = marketplace.getPremiumPluginCard(page, 0);
    
    // Verify thumbnail
    const thumbnail = firstCard.locator('.nfd-plugin-card-thumbnail img');
    await thumbnail.scrollIntoViewIfNeeded();
    await expect(thumbnail).toBeVisible();
    await expect(thumbnail).toHaveAttribute('src');
    
    // Verify title
    const title = firstCard.locator('.nfd-plugin-card-title h3');
    const titleText = await title.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText.trim()).not.toBe('');
    
    // Verify description
    const description = firstCard.locator('.nfd-plugin-card-desc p');
    const descText = await description.textContent();
    expect(descText).toBeTruthy();
    expect(descText.trim()).not.toBe('');
    
    // Verify primary action
    const primaryAction = firstCard.locator('.nfd-plugin-card-actions a:first-of-type');
    await primaryAction.scrollIntoViewIfNeeded();
    await expect(primaryAction).toBeVisible();
    await expect(primaryAction).toHaveAttribute('href');
    
    // Verify secondary action
    const secondaryAction = firstCard.locator('.nfd-plugin-card-actions a:last-of-type');
    await secondaryAction.scrollIntoViewIfNeeded();
    await expect(secondaryAction).toBeVisible();
    await expect(secondaryAction).toHaveText('More Details');
    await expect(secondaryAction).toHaveAttribute('href');
  });
});
