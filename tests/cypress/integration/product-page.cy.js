const productPageFixtures = require( '../fixtures/product-page.json' );

describe( 'Product Page', { testIsolation: true }, () => {
	const appClass = '.' + Cypress.env( 'appId' );

	beforeEach( () => {
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-marketplace(\/|%2F)v1(\/|%2F)products(\/|%2F)page/,
			},
			{
				body: productPageFixtures,
				delay: 250,
			}
		).as( 'productPageData' );

		cy.login( Cypress.env( 'wpUsername' ), Cypress.env( 'wpPassword' ) );
		cy.visit( '/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) );
		cy.reload();
	} );

	it( 'Show loading state while fetching', () => {
		cy.visit( '/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) );
		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace/product/549e5e29-735f-4e09-892e-766ca9b59858',
		);
		cy.wait( '@productPageData' );
		cy.visit( '/wp-admin/' );
		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace/product/549e5e29-735f-4e09-892e-766ca9b59858',
		);
		cy.get(
			appClass +
				'-app-marketplace-page div[aria-label="Fetching product details"]'
		).should( 'be.visible', { timeout: 20000 } );
	} );

	it( 'Product page content is visible', () => {
		cy.visit( '/wp-admin/admin.php?page=' + Cypress.env( 'pluginId' ) );
		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace/product/549e5e29-735f-4e09-892e-766ca9b59858',
		);
		cy.reload();
		cy.wait( '@productPageData' );
		cy.get( '.nfd-product-page-content' ).should( 'be.visible' );
	} );

	it( 'Shows error state if fetching fails', () => {
		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace/product/549e5e29-735f-4e09-892e-766ca9b59858',
		);
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-marketplace(\/|%2F)v1(\/|%2F)products(\/|%2F)page/,
			},
			{
				status: 404,
				body: 'Error',
				delay: 250,
			}
		).as( 'productPageError' );
		cy.reload();
		cy.wait( '@productPageError' );
		cy.get( appClass + '-app-marketplace-page div[role="alert"]' )
			.find( 'img[alt="Dog walking with a leash"]' )
			.should( 'exist' )
			.and( 'be.visible' );
		cy.contains( 'Oops! Something Went Wrong' ).should( 'be.visible' );
		cy.contains(
			'An error occurred while loading the content. Please try again later.'
		).should( 'be.visible' );
	} );

} );
