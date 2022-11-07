<?php

namespace NewfoldLabs\WP\Module\Marketplace;

use NewfoldLabs\WP\ModuleLoader\Container;

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
	 * @param Container $container
	 */
	public function __construct( Container $container ) {

		$this->container = $container;

		// Module functionality goes here
		add_action( 'rest_api_init', array( MarketplaceApi::class, 'registerRoutes' ) );
		add_action( 'wp_loaded', array( Themes::class, 'init' ) );
	}

}
