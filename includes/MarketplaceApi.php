<?php

namespace NewFoldLabs\WP\Module\Marketplace;

// use WP_Forge\Helpers\Arr;

use NewfoldLabs\WP\Module\Data\HiiveConnection;
use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * Class MarketplaceApi
 */
class MarketplaceApi {

	/**
	 * Transient name where notifications are stored.
	 */
	const TRANSIENT = 'newfold_marketplace';

	/**
	 * Register notification routes.
	 */
	public static function registerRoutes() {

		// Add route for fetching marketplace products per brand
		register_rest_route(
			'newfold-marketplace/v1',
			'/marketplace',
			array(
				'methods'  => \WP_REST_Server::READABLE,
				'callback' => function ( \WP_REST_Request $request ) {
					
					$marketplace = get_transient( self::TRANSIENT );

					if ( false === $marketplace ) {
						$args = array(
							'per_page' => 60,
							// if marketplace brand is set on container, 
							//  use it as brand override, 
							//  otherwise use plugin id (default)
							'brand'    => container()->has('marketplace_brand') ?
											container()->get('marketplace_brand') :
											container()->plugin()->id,
						);

						// construct endpoint with args
						$marketplace_endpoint = add_query_arg(
							$args,
							NFD_HIIVE_URL . '/marketplace/v1/products'
						);
						
						$response = wp_remote_get(
							$marketplace_endpoint,
							array(
								'headers' => array(
									'Content-Type'  => 'application/json',
									'Accept'        => 'application/json',
									'Authorization' => 'Bearer ' . HiiveConnection::get_auth_token(),
								),
							)
						);
							
						// return rest_ensure_response( $response );
						if ( ! is_wp_error( $response ) ) {
							$body = wp_remote_retrieve_body( $response );
							$data = json_decode( $body, true );
							if ( $data && is_array( $data ) ) {
								$marketplace = $data;
								$expiration = array_key_exists( 'ttl', $marketplace ) ? $marketplace['ttl'] : DAY_IN_SECONDS;
								self::setTransient( $marketplace, $expiration );
							}
						}
					}
					return $marketplace;
				},
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

	}

	/**
	 * Set the transient where marketplace is stored.
	 *
	 * @param string     $data json of marketplace.
	 * @param float|int  $expiration    Transient expiration.
	 */
	public static function setTransient( $data, $expiration = DAY_IN_SECONDS ) {
		set_transient( self::TRANSIENT, $data, $expiration );
	}

}
