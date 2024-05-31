// <reference types="Cypress" />
const marketplaceProductsFixture = require( '../fixtures/marketplace-products.json' );

describe( 'Marketplace Page', function () {
	const appClass = '.' + Cypress.env( 'appId' );

	before( () => {

		cy.exec( 'npx wp-env run cli wp transient delete newfold_marketplace' );

		cy.intercept(
			{
				method: 'GET',
				url: /newfold-marketplace(\/|%2F)v1(\/|%2F)marketplace/,
			},
			marketplaceProductsFixture
		).as( 'marketplace_products' );

		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace'
		);
	} );

	it( 'Exists', () => {
		cy.contains( 'h2', 'Marketplace' );
	} );

	it( 'Is Accessible', () => {
		cy.injectAxe();
		cy.wait( 1000 );
		cy.checkA11y( appClass + '-app-body' );
	} );

	it( 'Product grid has 5 items', () => {
		cy.get( '.marketplace-item' ).should( 'have.length', 5 );
	} );

	it( 'First product card renders correctly', () => {
		cy.get( '#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2' ).as(
			'card'
		);

		cy.get( '@card' )
			.findByRole( 'link', { name: 'Learn More' } )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.attr', 'href' )
			.and(
				'include',
				'https://www.web.com/websites/website-design-services'
			);

		cy.get( '@card' )
			.first()
			.within( () => {
				cy.get( '.marketplace-item-title' )
					.contains( 'Web Design Services' )
					.should( 'be.visible' );
				cy.get( '.marketplace-item-image' ).should( 'be.visible' );
				cy.get(
					'.marketplace-item-footer .marketplace-item-price'
				).should( 'not.exist' );
			} );
	} );

	it( 'Second product card render correctly', () => {
		cy.get( '#marketplace-item-2a1dadb5-f58d-4ae4-a26b-27efb09136eb' ).as(
			'card'
		);

		cy.get( '@card' )
			.findByRole( 'link', { name: 'Buy Now' } )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.attr', 'href' )
			.and(
				'include',
				'https://www.mojomarketplace.com/cart?item_id=5377b431-d8a8-431b-a711-50c10a141528'
			);

		cy.get( '@card' )
			.first()
			.within( () => {
				cy.get( '.marketplace-item-title' )
					.contains( 'Highend' )
					.should( 'be.visible' );
				cy.get( '.marketplace-item-image' ).should( 'be.visible' );
				cy.get( '.marketplace-item-footer .marketplace-item-price' )
					.contains( '$59.00' )
					.should( 'be.visible' );
			} );
	} );

	it( 'CTA links have target=_blank', () => {
		cy.get( '#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2' ).as(
			'card'
		);

		cy.get( '@card' )
			.findByRole( 'link', { name: 'Learn More' } )
			.scrollIntoView()
			.should( 'have.attr', 'target' )
			.and( 'include', '_blank' );
	} );

	it( 'Product page Secondary CTA links properly', () => {
		cy.get( '#marketplace-item-a2ff70f1-9670-4e25-a0e1-a068d3e43d55' ).as(
			'card'
		);

		cy.get( '@card' )
			.findByRole( 'link', { name: 'Learn More' } )
			.scrollIntoView()
			.should( 'be.visible' )
			.and( 'have.attr', 'target', '_self' )
			.and( 'have.attr', 'href' )
			.and(
				'include',
				'page=' +
					Cypress.env( 'pluginId' ) +
					'#/marketplace/product/549e5e29-735f-4e09-892e-766ca9b59858'
			);
	} );

	it( 'Category Tab Filters properly', () => {
		cy.get( appClass + '-app-subnavitem-Services' ).click();
		cy.get( '.marketplace-item' ).should( 'have.length', 12 );
		cy.get( '#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2 h3' )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.text', 'Web Design Services' );

		cy.get( appClass + '-app-subnavitem-SEO' ).click();
		cy.get( '.marketplace-item' ).should( 'have.length', 6 );
		cy.get( '#marketplace-item-a1ff70f1-9670-4e25-a0e1-a068d3e43a45 h3' )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.text', 'Yoast Premium' );
	} );

	it( 'Load more button loads more products', () => {
		cy.get( appClass + '-app-subnavitem-Services' ).click();
		cy.wait( 300 );

		cy.get( '.marketplace-item' ).should( 'have.length', 12 );
		cy.contains( 'button', 'Load More' );
		cy.get( '.marketplace-list button' ).scrollIntoView().click();
		cy.wait( 300 );

		cy.get( '.marketplace-item' ).should( 'have.length', 14 );
	} );

	it( 'Category pages update path', () => {
		cy.get( appClass + '-app-subnavitem-Services' ).click();
		cy.location().should( ( loc ) => {
			expect( loc.hash ).to.eq( '#/marketplace/services' );
		} );
	} );

	it( 'Category pages update page title', () => {
		cy.get( appClass + '-app-subnavitem-eCommerce' ).click();
		cy.location().should( ( loc ) => {
			expect( loc.hash ).to.eq( '#/marketplace/ecommerce' );
		} );
		cy.get( '.nfd-container__header .nfd-title' ).contains( 'eCommerce' );
	} );

	// CTB Not supported yet on all plugins
	it( 'Product CTB cards render correctly', () => {
		cy.get( appClass + '-app-subnavitem-SEO' ).click();
		cy.get(
			'.marketplace-item-a1ff70f1-9670-4e25-a0e1-a068d3e43a45 a.nfd-button'
		)
			.should( 'be.visible' )
			.should( 'have.attr', 'data-action', 'load-nfd-ctb' )
			.should(
				'have.attr',
				'data-ctb-id',
				'57d6a568-783c-45e2-a388-847cff155897'
			);
	} );

	// Product with a sale price displays properly - full_price_formatted
	it( 'Product with sale price displays properly', () => {
		cy.get( appClass + '-app-subnavitem-eCommerce' ).click();
		cy.get(
			'.marketplace-item-c9201843-d8ae-4032-bd4e-f3fa5a8b8314 .marketplace-item-price'
		).should( 'contain', '69' );
		cy.get(
			'.marketplace-item-c9201843-d8ae-4032-bd4e-f3fa5a8b8314 .marketplace-item-fullprice'
		).should( 'contain', '79' );
	} );

	// TESTS NEEDED
	// Custom style for a category is in place - categories.data.styles
	// Product click events fire properly
} );
