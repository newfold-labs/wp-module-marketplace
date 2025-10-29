const { test, expect } = require('@playwright/test');
const { auth } = require('../../../../../../tests/playwright/helpers');
const marketplace = require('../helpers/marketplace');

test.describe('Product Page', () => {
  const appClass = '.bluehost'; // Default app class, can be overridden with environment variable
  const pluginId = process.env.PLUGIN_ID || 'bluehost';
  const productId = '549e5e29-735f-4e09-892e-766ca9b59858';

  test.beforeEach(async ({ page }) => {
    // Setup marketplace API intercepts with delay
    await marketplace.setupMarketplaceIntercepts(page, { delay: 250 });

    // Login to WordPress
    await auth.loginToWordPress(page);

    // Navigate to product page
    await marketplace.navigateToMarketplaceProduct(page, productId, pluginId);
  });

  test('Show loading state while fetching', async ({ page }) => {
    // Check for loading state immediately after navigation
    const loadingElement = page.locator(`${appClass}-app-marketplace-page div[aria-label="Fetching product details"]`);
    await expect(loadingElement).toBeVisible();
  });

  test('Product page content is visible', async ({ page }) => {
    // Wait for API call to complete
    await page.waitForResponse('**/newfold-marketplace/v1/products/page**');
    
    // Wait for loading to complete
    await marketplace.waitForMarketplaceLoadingComplete(page);
    
    // Verify product page content is visible
    await expect(page.locator('.nfd-product-page-content')).toBeVisible();
  });

  test('Show error state if fetching fails', async ({ page }) => {
    // Reload page to trigger new API call
    await page.reload();
    
    // Setup error intercept
    await marketplace.setupMarketplaceErrorIntercepts(page, {
      status: 404,
      message: 'Error',
      delay: 250
    });
    
    // Wait for error response
    await page.waitForResponse('**/newfold-marketplace/v1/products/page**');
    
    // Wait for error state to appear
    await page.waitForTimeout(500);
    
    // Verify error state elements
    const errorContainer = page.locator(`${appClass}-app-marketplace-page div[role="alert"]`);
    await expect(errorContainer).toBeVisible();
    
    // Verify error image
    const errorImage = errorContainer.locator('img[alt="Dog walking with a leash"]');
    await expect(errorImage).toBeVisible();
    
    // Verify error messages
    await expect(page.locator('text=Oops! Something Went Wrong')).toBeVisible();
    await expect(page.locator('text=An error occurred while loading the content. Please try again later.')).toBeVisible();
  });
});
