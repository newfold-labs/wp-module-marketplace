/**
 * Marketplace Module Test Helpers
 * 
 * Specific utilities for testing the marketplace module functionality.
 * Includes API mocking, test data setup, and marketplace-specific assertions.
 */

const { expect } = require('@playwright/test');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * WordPress CLI helper for marketplace module
 * 
 * @param {string} cmd - WP-CLI command to execute
 * @param {boolean} failOnNonZeroExit - Whether to fail on non-zero exit code
 * @returns {string} Command output
 */
function wpCli(cmd, failOnNonZeroExit = true) {
  try {
    const result = execSync(`npx wp-env run cli wp ${cmd}`, { 
      encoding: 'utf-8',
      stdio: failOnNonZeroExit ? 'pipe' : 'inherit'
    });
    return result.trim();
  } catch (error) {
    if (failOnNonZeroExit) {
      throw new Error(`WP-CLI command failed: ${cmd}\n${error.message}`);
    }
    return '';
  }
}

/**
 * Clear marketplace transient data
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function clearMarketplaceTransient(page) {
  try {
    wpCli('transient delete newfold_marketplace', false);
  } catch (error) {
    console.warn('Failed to clear marketplace transient:', error.message);
  }
}

/**
 * Setup marketplace API intercepts
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Intercept options
 * @param {Object} options.marketplaceData - Marketplace products data
 * @param {Object} options.productPageData - Product page data
 * @param {number} options.delay - Response delay in milliseconds
 */
async function setupMarketplaceIntercepts(page, options = {}) {
  const { 
    marketplaceData = null, 
    productPageData = null, 
    delay = 0 
  } = options;

  // Load fixture data if not provided
  let marketplaceFixture = marketplaceData;
  let productPageFixture = productPageData;

  if (!marketplaceFixture) {
    const fixturePath = path.join(__dirname, '../fixtures/marketplace-products.json');
    marketplaceFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  }

  if (!productPageFixture) {
    const fixturePath = path.join(__dirname, '../fixtures/product-page.json');
    productPageFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  }

  // Intercept marketplace API calls
  await page.route('**/newfold-marketplace/v1/marketplace**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(marketplaceFixture),
      delay: delay
    });
  });

  // Intercept product page API calls
  await page.route('**/newfold-marketplace/v1/products/page**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(productPageFixture),
      delay: delay
    });
  });
}

/**
 * Setup marketplace API error intercepts
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} options - Error options
 * @param {number} options.status - HTTP status code (default: 404)
 * @param {string} options.message - Error message (default: 'Error')
 * @param {number} options.delay - Response delay in milliseconds
 */
async function setupMarketplaceErrorIntercepts(page, options = {}) {
  const { 
    status = 404, 
    message = 'Error', 
    delay = 250 
  } = options;

  await page.route('**/newfold-marketplace/v1/products/page**', async (route) => {
    await route.fulfill({
      status: status,
      contentType: 'text/plain',
      body: message,
      delay: delay
    });
  });
}

/**
 * Wait for marketplace products to load
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForMarketplaceProducts(page, timeout = 10000) {
  await page.waitForSelector('.marketplace-item:first-of-type', { timeout });
}

/**
 * Wait for marketplace loading state to complete
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForMarketplaceLoadingComplete(page, timeout = 10000) {
  // Wait for loading spinner to disappear
  await page.waitForFunction(() => {
    const loadingElements = document.querySelectorAll('[aria-label="Fetching product details"]');
    return loadingElements.length === 0;
  }, { timeout });
}

/**
 * Get marketplace product by ID
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} productId - Product ID
 * @returns {import('@playwright/test').Locator} Product locator
 */
function getMarketplaceProduct(page, productId) {
  return page.locator(`#marketplace-item-${productId}`);
}

/**
 * Get marketplace category tab
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} category - Category name
 * @returns {import('@playwright/test').Locator} Category tab locator
 */
function getMarketplaceCategoryTab(page, category) {
  return page.locator(`[data-category="${category}"]`);
}

/**
 * Navigate to marketplace category
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} category - Category name
 * @param {string} pluginId - Plugin ID for URL construction
 */
async function navigateToMarketplaceCategory(page, category, pluginId = 'bluehost') {
  await page.goto(`/wp-admin/admin.php?page=${pluginId}#/marketplace/${category}`);
}

/**
 * Navigate to marketplace product page
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} productId - Product ID
 * @param {string} pluginId - Plugin ID for URL construction
 */
async function navigateToMarketplaceProduct(page, productId, pluginId = 'bluehost') {
  await page.goto(`/wp-admin/admin.php?page=${pluginId}#/marketplace/product/${productId}`);
}

/**
 * Navigate to WordPress premium plugins tab
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function navigateToPremiumPluginsTab(page) {
  await page.goto('/wp-admin/plugin-install.php?tab=premium-marketplace');
}

/**
 * Wait for premium plugins to load
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForPremiumPluginsLoad(page, timeout = 10000) {
  await page.waitForSelector('.nfd-premium-plugins-marketplace', { timeout });
  await page.waitForSelector('.plugin-card:first-of-type', { timeout });
}

/**
 * Get premium plugin card by index
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} index - Card index (0-based)
 * @returns {import('@playwright/test').Locator} Plugin card locator
 */
function getPremiumPluginCard(page, index = 0) {
  return page.locator('.plugin-card').nth(index);
}

/**
 * Verify marketplace product card structure
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} productId - Product ID
 * @param {Object} expected - Expected product data
 */
async function verifyMarketplaceProductCard(page, productId, expected) {
  const productCard = getMarketplaceProduct(page, productId);
  
  // Verify card is visible
  await productCard.scrollIntoViewIfNeeded();
  await expect(productCard).toBeVisible();
  
  // Verify title
  if (expected.title) {
    const title = productCard.locator('.marketplace-item-title');
    await expect(title).toContainText(expected.title);
  }
  
  // Verify image
  const image = productCard.locator('.marketplace-item-image');
  await expect(image).toBeVisible();
  
  // Verify price if expected
  if (expected.price) {
    const price = productCard.locator('.marketplace-item-price');
    await expect(price).toContainText(expected.price);
  }
  
  // Verify primary CTA
  if (expected.primaryCta) {
    const primaryCta = productCard.locator(`a:has-text("${expected.primaryCta}")`);
    await expect(primaryCta).toBeVisible();
    
    if (expected.primaryUrl) {
      await expect(primaryCta).toHaveAttribute('href', expected.primaryUrl);
    }
    
    if (expected.targetBlank) {
      await expect(primaryCta).toHaveAttribute('target', '_blank');
    }
  }
  
  // Verify secondary CTA
  if (expected.secondaryCta) {
    const secondaryCta = productCard.locator(`a:has-text("${expected.secondaryCta}")`);
    await expect(secondaryCta).toBeVisible();
    
    if (expected.secondaryUrl) {
      await expect(secondaryCta).toHaveAttribute('href', expected.secondaryUrl);
    }
  }
}

/**
 * Verify premium plugin card structure
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} index - Card index (0-based)
 */
async function verifyPremiumPluginCard(page, index = 0) {
  const card = getPremiumPluginCard(page, index);
  
  // Verify card is visible
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  
  // Verify thumbnail
  const thumbnail = card.locator('.nfd-plugin-card-thumbnail img');
  await expect(thumbnail).toBeVisible();
  await expect(thumbnail).toHaveAttribute('src');
  
  // Verify title
  const title = card.locator('.nfd-plugin-card-title h3');
  const titleText = await title.textContent();
  expect(titleText).toBeTruthy();
  expect(titleText.trim()).not.toBe('');
  
  // Verify description
  const description = card.locator('.nfd-plugin-card-desc p');
  const descText = await description.textContent();
  expect(descText).toBeTruthy();
  expect(descText.trim()).not.toBe('');
  
  // Verify primary action
  const primaryAction = card.locator('.nfd-plugin-card-actions a:first-of-type');
  await expect(primaryAction).toBeVisible();
  await expect(primaryAction).toHaveAttribute('href');
  
  // Verify secondary action
  const secondaryAction = card.locator('.nfd-plugin-card-actions a:last-of-type');
  await expect(secondaryAction).toBeVisible();
  await expect(secondaryAction).toHaveText('More Details');
  await expect(secondaryAction).toHaveAttribute('href');
}

module.exports = {
  wpCli,
  clearMarketplaceTransient,
  setupMarketplaceIntercepts,
  setupMarketplaceErrorIntercepts,
  waitForMarketplaceProducts,
  waitForMarketplaceLoadingComplete,
  getMarketplaceProduct,
  getMarketplaceCategoryTab,
  navigateToMarketplaceCategory,
  navigateToMarketplaceProduct,
  navigateToPremiumPluginsTab,
  waitForPremiumPluginsLoad,
  getPremiumPluginCard,
  verifyMarketplaceProductCard,
  verifyPremiumPluginCard,
};
