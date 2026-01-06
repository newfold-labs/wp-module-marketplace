/**
 * Marketplace Module Test Helpers for Playwright
 * 
 * Utilities for testing the Deactivation module functionality.
 * Includes plugin activation/deactivation helpers and survey interactions.
 */
import { expect } from '@playwright/test';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve plugin directory from PLUGIN_DIR env var (set by playwright.config.mjs) or process.cwd()
const pluginDir = process.env.PLUGIN_DIR || process.cwd();

// Build path to plugin helpers (.mjs extension for ES module compatibility)
const finalHelpersPath = join(pluginDir, 'tests/playwright/helpers/index.mjs');

// Import plugin helpers using file:// URL
const helpersUrl = pathToFileURL(finalHelpersPath).href;
const pluginHelpers = await import(helpersUrl);
// destructure pluginHelpers
let { auth, wordpress, newfold, a11y, utils } = pluginHelpers;
// destructure wpCli from wordpress
const { wpCli } = wordpress;
const { fancyLog } = utils;


/**
 * Clear marketplace transient data
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function clearMarketplaceTransient(page) {
  try {
    await wpCli('transient delete newfold_marketplace');
  } catch (error) {
    fancyLog('Failed to clear marketplace transient:' + error.message, 55, 'yellow');
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
    marketplaceFixture = JSON.parse(readFileSync(join(__dirname, '../fixtures/marketplace-products.json'), 'utf8'));
  }

  if (!productPageFixture) {
    productPageFixture = JSON.parse(readFileSync(join(__dirname, '../fixtures/product-page.json'), 'utf8'));
  }

  // Intercept marketplace API calls
  await page.route('**/newfold-marketplace/v1/marketplace**', async (route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(marketplaceFixture),
    });
  });

  // Intercept product page API calls
  await page.route('**/newfold-marketplace/v1/products/page**', async (route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(productPageFixture),
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
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    await route.fulfill({
      status: status,
      contentType: 'text/plain',
      body: message,
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

export {
  // Plugin helpers (re-exported for convenience)
  auth,
  wordpress,
  newfold,
  a11y,
  utils,
  // Marketplace specific helpers
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
