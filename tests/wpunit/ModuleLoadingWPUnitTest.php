<?php

namespace NewfoldLabs\WP\Module\Marketplace;

/**
 * Module loading wpunit tests.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Marketplace\Marketplace
 */
class ModuleLoadingWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Verify core module classes exist.
	 *
	 * @return void
	 */
	public function test_module_classes_load() {
		$this->assertTrue( class_exists( Marketplace::class ) );
		$this->assertTrue( class_exists( MarketplaceApi::class ) );
		$this->assertTrue( class_exists( PluginsMarketplace::class ) );
		$this->assertTrue( class_exists( Themes::class ) );
	}

	/**
	 * Verify WordPress factory is available.
	 *
	 * @return void
	 */
	public function test_wordpress_factory_available() {
		$this->assertTrue( function_exists( 'get_option' ) );
		$this->assertNotEmpty( get_option( 'blogname' ) );
	}
}
