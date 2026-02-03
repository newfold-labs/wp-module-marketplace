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
}
