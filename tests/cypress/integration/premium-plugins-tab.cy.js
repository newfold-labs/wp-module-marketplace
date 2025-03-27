// <reference types="Cypress" />
const marketplaceProductsFixture = require( '../fixtures/marketplace-products.json' );

describe( 'Plugins Premium Tab', { testIsolation: true }, () => {
	beforeEach( () => {
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-marketplace(\/|%2F)v1(\/|%2F)marketplace/,
			},
			{
				body: marketplaceProductsFixture,
				delay: 1000,
			}
		).as( 'getMarketplaceProducts' );

		cy.login( Cypress.env( 'wpUsername' ), Cypress.env( 'wpPassword' ) );
		cy.visit( '/wp-admin/plugin-install.php?tab=premium-marketplace' );
	} );

	it( 'Premium tab exist', () => {
		cy.get( '.wrap' )
			.find( '.nfd-premium-plugins-marketplace' )
			.contains(
				'Unlock the full potential of your WordPress website with premium plugins'
			)
			.should( 'be.visible' );
	} );

	it( 'Is Accessible', () => {
		cy.injectAxe();
		cy.wait( 1000 );
		cy.checkA11y( '.nfd-premium-plugins-marketplace' );
	} );

	it( 'Should have products', () => {
		cy.wait( '@getMarketplaceProducts' );
		cy.get( '#the-list' ).children( '.plugin-card' ).should( 'be.visible' );
	} );

	it( 'Product should display properly', () => {
		cy.wait( '@getMarketplaceProducts' );

		// thumbnail
		cy.get( '.plugin-card:first-of-type' )
			.find( '.nfd-plugin-card-thumbnail img' )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.attr', 'src' );

		// title
		cy.get( '.plugin-card:first-of-type' )
			.find( '.nfd-plugin-card-title h3' )
			.invoke( 'text' )
			.should( 'not.be.empty' );

		// description
		cy.get( '.plugin-card:first-of-type' )
			.find( '.nfd-plugin-card-desc p' )
			.invoke( 'text' )
			.should( 'not.be.empty' );

		// primary action
		cy.get( '.plugin-card:first-of-type' )
			.find( '.nfd-plugin-card-actions a:first-of-type' )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.attr', 'href' );

		// secondary action
		cy.get( '.plugin-card:first-of-type' )
			.find( '.nfd-plugin-card-actions a:last-of-type' )
			.scrollIntoView()
			.should( 'be.visible' )
			.should( 'have.text', 'More Details' )
			.should( 'have.attr', 'href' );
	} );
} );
