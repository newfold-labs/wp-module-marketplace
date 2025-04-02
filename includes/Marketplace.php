<?php

namespace NewfoldLabs\WP\Module\Marketplace;

use NewfoldLabs\WP\ModuleLoader\Container;
use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * Class for handling the initialization of the marketplace module.
 */
class Marketplace {

	/**
	 * Dependency injection container.
	 *
	 * @var Container
	 */
	protected $container;

	/**
	 * Constructor.
	 *
	 * @param Container $container The plugin container.
	 */
	public function __construct( Container $container ) {

		$this->container = $container;

		// Module functionality goes here
		add_action( 'rest_api_init', array( MarketplaceApi::class, 'registerRoutes' ) );
		add_action( 'wp_loaded', array( Themes::class, 'init' ) );
		add_action( 'wp_loaded', array( PluginsMarketplace::class, 'init' ) );

		\add_filter( 'nfd_plugin_subnav', array( $this, 'add_nfd_subnav' ) );
	}

	/**
	 * Add to the Newfold subnav.
	 *
	 * @param array $subnav The nav array.
	 * @return array The filtered nav array
	 */
	public static function add_nfd_subnav( $subnav ) {
		$brand       = container()->get( 'plugin' )['id'];
		$marketplace = array(
			'title'    => __( 'Marketplace', 'wp-module-marketplace' ),
			'route'    => $brand . '#/marketplace',
			'priority' => 25,
		);
		array_push( $subnav, $marketplace );
		return $subnav;
	}
}
