<?php

namespace NewfoldLabs\WP\Module\Marketplace;

/**
 * MarketplaceApi wpunit tests.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Marketplace\MarketplaceApi
 */
class MarketplaceApiWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Transient constant has expected value.
	 *
	 * @return void
	 */
	public function test_transient_constant() {
		$this->assertSame( 'newfold_marketplace', MarketplaceApi::TRANSIENT );
	}

	/**
	 * Get_expiration returns TTL from meta when present.
	 *
	 * @return void
	 */
	public function test_get_expiration_returns_meta_ttl_when_present() {
		$marketplace = array(
			'meta' => array(
				'ttl' => 3600,
			),
		);
		$this->assertSame( 3600, MarketplaceApi::get_expiration( $marketplace ) );
	}

	/**
	 * Get_expiration returns DAY_IN_SECONDS when meta ttl missing.
	 *
	 * @return void
	 */
	public function test_get_expiration_returns_day_in_seconds_when_no_meta_ttl() {
		$marketplace = array();
		$this->assertSame( DAY_IN_SECONDS, MarketplaceApi::get_expiration( $marketplace ) );
	}

	/**
	 * Get_expiration returns DAY_IN_SECONDS when meta exists but ttl missing.
	 *
	 * @return void
	 */
	public function test_get_expiration_returns_day_in_seconds_when_meta_has_no_ttl() {
		$marketplace = array( 'meta' => array() );
		$this->assertSame( DAY_IN_SECONDS, MarketplaceApi::get_expiration( $marketplace ) );
	}

	/**
	 * SetTransient stores data and it can be retrieved.
	 *
	 * @return void
	 */
	public function test_set_transient_stores_data() {
		$data = array( 'test' => 'value' );
		MarketplaceApi::setTransient( $data, 60 );
		$this->assertSame( $data, get_transient( MarketplaceApi::TRANSIENT ) );
		delete_transient( MarketplaceApi::TRANSIENT );
	}

	/**
	 * RegisterRoutes registers REST routes for marketplace and products/page.
	 *
	 * @return void
	 */
	public function test_register_routes_registers_rest_endpoints() {
		MarketplaceApi::registerRoutes();
		$server = rest_get_server();
		$routes = $server->get_routes();
		$found  = array_filter(
			array_keys( $routes ),
			function ( $route ) {
				return strpos( $route, 'newfold-marketplace' ) !== false;
			}
		);
		$this->assertNotEmpty( $found, 'Expected newfold-marketplace routes to be registered' );
	}
}
