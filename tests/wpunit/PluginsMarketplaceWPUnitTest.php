<?php

namespace NewfoldLabs\WP\Module\Marketplace;

/**
 * PluginsMarketplace wpunit tests.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Marketplace\PluginsMarketplace
 */
class PluginsMarketplaceWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Add_premuim_plugins_tab adds premium-marketplace key to tabs array.
	 *
	 * @return void
	 */
	public function test_add_premuim_plugins_tab_adds_premium_key() {
		$tabs   = array(
			'featured' => 'Featured',
			'popular'   => 'Popular',
		);
		$result = PluginsMarketplace::add_premuim_plugins_tab( $tabs );
		$this->assertArrayHasKey( 'premium-marketplace', $result );
		$this->assertSame( 'Featured', $result['featured'] );
		$this->assertSame( 'Popular', $result['popular'] );
	}

	/**
	 * Add_premuim_plugins_tab returns array with Premium translation for new tab.
	 *
	 * @return void
	 */
	public function test_add_premuim_plugins_tab_returns_premium_label() {
		$result = PluginsMarketplace::add_premuim_plugins_tab( array() );
		$this->assertNotEmpty( $result['premium-marketplace'] );
	}
}
