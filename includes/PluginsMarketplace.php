<?php

namespace NewFoldLabs\WP\Module\Marketplace;

use function NewfoldLabs\WP\ModuleLoader\container;

class PluginsMarketplace {
    public static function init() {
        add_action( 'admin_menu', array( __CLASS__, 'add_premuim_plugins_menu_link' ) );
        add_filter( 'install_plugins_tabs', array( __CLASS__, 'add_premuim_plugins_tab' ) );
        add_action( 'admin_head-plugin-install.php', array( __CLASS__, 'premuim_plugins_tab_enqueue_assets' ) );
    }

    public static function add_premuim_plugins_menu_link() {
        add_submenu_page(
            'plugins.php',
            'Premium Plugins',
            'Premium',
            'manage_options',
            'plugin-install.php?tab=premium-marketplace',
        );
    }

    public static function add_Premuim_plugins_tab( $tabs ) {
        $tabs['premium-marketplace'] = __( 'Premium', container()->plugin()->id . '-wordpress-plugin' );

	    return $tabs;
    }

    public static function premuim_plugins_tab_enqueue_assets() {
        if ( false === ( isset($_GET['tab']) && $_GET['tab'] == 'premium-marketplace' ) ) {
            return;
        }
        
        $assetsDir = container()->plugin()->url . 'vendor/newfold-labs/wp-module-marketplace/includes/assets/';

        wp_register_script('nfd_plugins_marketplace_js', $assetsDir . 'js/index.js');
        wp_enqueue_script( 'nfd_plugins_marketplace_js' );

        wp_localize_script('nfd_plugins_marketplace_js', 'nfdPremiumPluginsMarketplace', 
            array(
                'restApiNonce' => wp_create_nonce('wp_rest'),
            )
        );
    }
}