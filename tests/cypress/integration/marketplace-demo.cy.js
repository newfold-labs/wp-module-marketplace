// <reference types="Cypress" />
const productsFixture = require( '../fixtures/products.json' );

describe( 'Marketplace Demo', function () {

	before( () => {
		cy.intercept(
			{
				method: 'GET',
				url: /newfold-marketplace(\/|%2F)v1(\/|%2F)marketplace/,
			},
			productsFixture
		);

		cy.visit(
			'/wp-admin/admin.php?page=' +
				Cypress.env( 'pluginId' ) +
				'#/marketplace'
		);
	} );

	it( 'SubTitle is updated for Demo', () => {
		cy.get( '.newfold-marketplace-header' ).should( 'contain', 'only a test');
	} );

} );
