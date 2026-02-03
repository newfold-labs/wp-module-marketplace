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

	/**
	 * Query_block_themes_args returns full-site-editing args when action is query_themes and browse is popular.
	 *
	 * @return void
	 */
	public function test_query_block_themes_args_returns_fse_args_when_popular() {
		$args   = (object) array(
			'browse' => 'popular',
			'page'   => 2,
		);
		$result = Themes::query_block_themes_args( $args, 'query_themes' );
		$this->assertSame( 'full-site-editing', $result->tag );
		$this->assertSame( 30, $result->per_page );
		$this->assertSame( 'popular', $result->browse );
		$this->assertSame( 2, $result->page );
	}

	/**
	 * Query_block_themes_args returns args unchanged when action is not query_themes.
	 *
	 * @return void
	 */
	public function test_query_block_themes_args_returns_unchanged_when_not_query_themes() {
		$args   = (object) array(
			'browse' => 'popular',
			'page'   => 1,
		);
		$result = Themes::query_block_themes_args( $args, 'theme_information' );
		$this->assertSame( $args, $result );
	}

	/**
	 * Query_block_themes_args returns args unchanged when browse is not popular.
	 *
	 * @return void
	 */
	public function test_query_block_themes_args_returns_unchanged_when_not_popular() {
		$args   = (object) array(
			'browse' => 'featured',
			'page'   => 1,
		);
		$result = Themes::query_block_themes_args( $args, 'query_themes' );
		$this->assertSame( $args, $result );
	}

	/**
	 * Sort_query_themes_results puts priority themes first when action is query_themes and browse is popular.
	 *
	 * @return void
	 */
	public function test_sort_query_themes_results_puts_priority_themes_first() {
		$theme_a    = (object) array(
			'slug' => 'theme-a',
			'name' => 'Theme A',
		);
		$theme_b    = (object) array(
			'slug' => 'theme-b',
			'name' => 'Theme B',
		);
		$theme_yith = (object) array(
			'slug' => 'yith-wonder',
			'name' => 'Yith Wonder',
		);
		$res        = (object) array(
			'themes' => array(
				'theme-a'     => $theme_a,
				'theme-b'     => $theme_b,
				'yith-wonder' => $theme_yith,
			),
		);
		$args        = (object) array( 'browse' => 'popular' );
		$result       = Themes::sort_query_themes_results( $res, 'query_themes', $args );
		$this->assertSame( 'yith-wonder', $result->themes[0]->slug );
	}
}
