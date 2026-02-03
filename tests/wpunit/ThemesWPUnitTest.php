<?php

namespace NewfoldLabs\WP\Module\Marketplace;

/**
 * Themes wpunit tests.
 *
 * @coversDefaultClass \NewfoldLabs\WP\Module\Marketplace\Themes
 */
class ThemesWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	/**
	 * Priority_themes includes expected theme slug.
	 *
	 * @return void
	 */
	public function test_priority_themes_includes_yith_wonder() {
		$this->assertIsArray( Themes::$priority_themes );
		$this->assertContains( 'yith-wonder', Themes::$priority_themes );
	}
}
