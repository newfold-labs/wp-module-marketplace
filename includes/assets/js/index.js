class PluginsMarketplace {
    constructor() {
        fetch(window.nfdRestRoot + '/newfold-marketplace/v1/marketplace', {
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
              'X-WP-Nonce': nfdPremiumPluginsMarketplace.restApiNonce
            }
          })
            .then((response) => response.json())
            .then((data) => console.log(data));
    }
}

const nfdPluginsMarketplace = new PluginsMarketplace();
