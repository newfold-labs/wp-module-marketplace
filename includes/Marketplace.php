<?php

namespace NewfoldLabs\WP\Module\Marketplace;

use NewfoldLabs\WP\ModuleLoader\Container;

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
		add_filter( 'http_request_args', array( __CLASS__, 'add_locale_header' ), 10, 2 );
	}

	/**
	 * Add locale headers to hiive requests.
	 *
	 * @param array  $args - HTTP request arguments
	 * @param string $url - URL of the request
	 *
	 * @return array
	 */
	public static function add_locale_header( $args, $url ) {
		if ( defined( 'NFD_HIIVE_URL' ) && strpos( $url, NFD_HIIVE_URL ) !== false ) {
			if ( ! isset( $args['headers'] ) || ! is_array( $args['headers'] ) ) {
				$args['headers'] = array();
			}
			$args['headers']['X-WP-LOCALE'] = get_locale();
		}

		return $args;
	}
}
