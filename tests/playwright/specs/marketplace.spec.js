const { test, expect } = require('@playwright/test');
const path = require('path');

// Use environment variable to resolve plugin helpers
const pluginDir = process.env.PLUGIN_DIR || path.resolve(__dirname, '../../../../../../');
const { auth, a11y } = require(path.join(pluginDir, 'tests/playwright/helpers'));
const helpers = require('../helpers'); // Renamed from marketplace

test.describe('Marketplace Page', () => {
  const appClass = '.bluehost'; // Default app class, can be overridden with environment variable
  const pluginId = process.env.PLUGIN_ID || 'bluehost';

  test.beforeEach(async ({ page }) => {
    // Clear marketplace transient
    await helpers.clearMarketplaceTransient(page);

    // Setup marketplace API intercepts
    await helpers.setupMarketplaceIntercepts(page);

    // Login to WordPress
    await auth.loginToWordPress(page);

    // Navigate to marketplace featured page
    await helpers.navigateToMarketplaceCategory(page, 'featured', pluginId);
  });

  test('Exists', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Marketplace');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for marketplace to load
    await helpers.waitForMarketplaceProducts(page);
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(1000);
    
    // Run accessibility check on the marketplace page
    await a11y.checkA11y(page, `${appClass}-app-marketplace-page`);
  });

  test('Product grid has 5 items', async ({ page }) => {
    await helpers.waitForMarketplaceProducts(page);
    
    const productItems = page.locator('.marketplace-item');
    await expect(productItems).toHaveCount(5);
  });

  test('First product card renders correctly', async ({ page }) => {
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = '1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2';
    const productCard = helpers.getMarketplaceProduct(page, productId);
    
    // Verify card is visible
    await productCard.scrollIntoViewIfNeeded();
    await expect(productCard).toBeVisible();
    
    // Verify Learn More link
    const learnMoreLink = productCard.locator('a:has-text("Learn More")');
    await learnMoreLink.scrollIntoViewIfNeeded();
    await expect(learnMoreLink).toBeVisible();
    await expect(learnMoreLink).toHaveAttribute('href');
    await expect(learnMoreLink).toHaveAttribute('href', /https:\/\/www\.web\.com\/websites\/website-design-services/);
    
    // Verify card content
    await productCard.locator('.marketplace-item-title').first().within(() => {
      expect(page.locator('text=Web Design Services')).toBeVisible();
    });
    
    await expect(productCard.locator('.marketplace-item-image')).toBeVisible();
    
    // Verify no price element exists for this service
    await expect(productCard.locator('.marketplace-item-footer .marketplace-item-price')).toHaveCount(0);
  });

  test('Second product card render correctly', async ({ page }) => {
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = '2a1dadb5-f58d-4ae4-a26b-27efb09136eb';
    const productCard = helpers.getMarketplaceProduct(page, productId);
    
    // Verify card is visible
    await productCard.scrollIntoViewIfNeeded();
    await expect(productCard).toBeVisible();
    
    // Verify Buy Now link
    const buyNowLink = productCard.locator('a:has-text("Buy Now")');
    await buyNowLink.scrollIntoViewIfNeeded();
    await expect(buyNowLink).toBeVisible();
    await expect(buyNowLink).toHaveAttribute('href');
    await expect(buyNowLink).toHaveAttribute('href', /https:\/\/www\.mojomarketplace\.com\/cart\?item_id=5377b431-d8a8-431b-a711-50c10a141528/);
    
    // Verify card content
    await productCard.locator('.marketplace-item-title').first().within(() => {
      expect(page.locator('text=Highend')).toBeVisible();
    });
    
    await expect(productCard.locator('.marketplace-item-image')).toBeVisible();
    
    // Verify price
    await expect(productCard.locator('.marketplace-item-footer .marketplace-item-price')).toContainText('$59.00');
  });

  test('CTA links have target=_blank', async ({ page }) => {
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = '1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2';
    const productCard = helpers.getMarketplaceProduct(page, productId);
    
    const learnMoreLink = productCard.locator('a:has-text("Learn More")');
    await learnMoreLink.scrollIntoViewIfNeeded();
    await expect(learnMoreLink).toHaveAttribute('target', '_blank');
  });

  test('Product page Secondary CTA links properly', async ({ page }) => {
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = 'a2ff70f1-9670-4e25-a0e1-a068d3e43d55';
    const productCard = helpers.getMarketplaceProduct(page, productId);
    
    const learnMoreLink = productCard.locator('a:has-text("Learn More")');
    await learnMoreLink.scrollIntoViewIfNeeded();
    await expect(learnMoreLink).toBeVisible();
    await expect(learnMoreLink).toHaveAttribute('target', '_self');
    await expect(learnMoreLink).toHaveAttribute('href', /#\/marketplace\/product\/549e5e29-735f-4e09-892e-766ca9b59858/);
  });

  test('Category Tab Filters properly', async ({ page }) => {
    // Start on featured page
    await helpers.navigateToMarketplaceCategory(page, 'featured', pluginId);
    await helpers.waitForMarketplaceProducts(page);
    
    // Verify featured products
    await expect(page.locator('.marketplace-item')).toHaveCount(5);
    
    const firstProduct = helpers.getMarketplaceProduct(page, '1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2');
    const firstProductTitle = firstProduct.locator('h2');
    await firstProductTitle.scrollIntoViewIfNeeded();
    await expect(firstProductTitle).toBeVisible();
    await expect(firstProductTitle).toHaveText('Web Design Services');
    
    // Navigate to SEO category
    await helpers.navigateToMarketplaceCategory(page, 'seo', pluginId);
    await helpers.waitForMarketplaceProducts(page);
    
    // Verify SEO products
    await expect(page.locator('.marketplace-item')).toHaveCount(6);
    
    const seoProduct = helpers.getMarketplaceProduct(page, 'a1ff70f1-9670-4e25-a0e1-a068d3e43a45');
    const seoProductTitle = seoProduct.locator('h2');
    await seoProductTitle.scrollIntoViewIfNeeded();
    await expect(seoProductTitle).toBeVisible();
    await expect(seoProductTitle).toHaveText('Yoast Premium');
  });

  test('Load more button loads more products', async ({ page }) => {
    // Navigate to services category (has more products)
    await helpers.navigateToMarketplaceCategory(page, 'services', pluginId);
    await page.waitForTimeout(300);
    
    // Verify initial products
    await expect(page.locator('.marketplace-item')).toHaveCount(12);
    await expect(page.locator('button:has-text("Load More")')).toBeVisible();
    
    // Click load more button
    const loadMoreButton = page.locator('.marketplace-list button');
    await loadMoreButton.scrollIntoViewIfNeeded();
    await loadMoreButton.click();
    await page.waitForTimeout(300);
    
    // Verify more products loaded
    await expect(page.locator('.marketplace-item')).toHaveCount(14);
  });

  test('Product CTB cards render correctly', async ({ page }) => {
    // Navigate to SEO category (has CTB products)
    await helpers.navigateToMarketplaceCategory(page, 'seo', pluginId);
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = 'a1ff70f1-9670-4e25-a0e1-a068d3e43a45';
    const ctbButton = page.locator(`.marketplace-item-${productId} a.nfd-button`);
    
    await ctbButton.scrollIntoViewIfNeeded();
    await expect(ctbButton).toBeVisible();
    await expect(ctbButton).toHaveAttribute('data-action', 'load-nfd-ctb');
    await expect(ctbButton).toHaveAttribute('data-ctb-id', '57d6a568-783c-45e2-a388-847cff155897');
  });

  test('Product with sale price displays properly', async ({ page }) => {
    // Navigate to ecommerce category (has sale price products)
    await helpers.navigateToMarketplaceCategory(page, 'ecommerce', pluginId);
    await helpers.waitForMarketplaceProducts(page);
    
    const productId = 'c9201843-d8ae-4032-bd4e-f3fa5a8b8314';
    const productCard = helpers.getMarketplaceProduct(page, productId);
    
    // Verify sale price
    await expect(productCard.locator('.marketplace-item-price')).toContainText('69');
    
    // Verify full price (crossed out)
    await expect(productCard.locator('.marketplace-item-fullprice')).toContainText('79');
  });
});
