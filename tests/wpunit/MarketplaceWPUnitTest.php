<?php

namespace NewfoldLabs\WP\Module\Marketplace;

/**
 * Marketplace wpunit tests.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Marketplace\Marketplace
 */
class MarketplaceWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Load_script_translation_file returns unchanged file when handle is not newfold-marketplace.
	 *
	 * @return void
	 */
	public function test_load_script_translation_file_returns_unchanged_for_other_handle() {
		$marketplace = new Marketplace( $this->getMockContainer() );
		$file       = '/some/default/path.json';
		$result     = $marketplace->load_script_translation_file( $file, 'other-handle', 'wp-module-marketplace' );
		$this->assertSame( $file, $result );
	}

	/**
	 * Load_script_translation_file returns path under NFD_MARKETPLACE_DIR when handle is newfold-marketplace.
	 *
	 * @return void
	 */
	public function test_load_script_translation_file_returns_module_path_for_marketplace_handle() {
		$module_root = dirname( dirname( __DIR__ ) );
		if ( ! defined( 'NFD_MARKETPLACE_DIR' ) ) {
			define( 'NFD_MARKETPLACE_DIR', $module_root );
		}
		$marketplace = new Marketplace( $this->getMockContainer() );
		$result     = $marketplace->load_script_translation_file( '/default.json', 'newfold-marketplace', 'wp-module-marketplace' );
		$this->assertStringContainsString( 'languages', $result );
		$this->assertStringContainsString( NFD_MARKETPLACE_DIR, $result );
	}

	/**
	 * Get a minimal mock container for Marketplace constructor.
	 *
	 * @return \NewfoldLabs\WP\ModuleLoader\Container
	 */
	private function getMockContainer() {
		$container = $this->getMockBuilder( \NewfoldLabs\WP\ModuleLoader\Container::class )
			->getMock();
		return $container;
	}
}
