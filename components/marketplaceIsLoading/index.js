import MarketplaceFilterBarSkeleton from "./MarketplaceFilterBarSkeleton";
import MarketplaceItemSkeleton from "./MarketplaceItemSkeleton";
import './marketplaceIsloading.scss';

/**
 * MarketPlaceIsLoading Component
 * For use in Marketplace to display conent skeleton preloader
 * 
 * @param {*} props 
 * @returns 
 */
const MarketPlaceIsLoading = ({ items, filter, containerClassNames }) => {

    const renderMarketplaceSkeletonItems = (items) => {
        const itemsCount = items || 6;
        let marketplaceItems = [];

        for (let i = 0; i < itemsCount; i++) {
            marketplaceItems.push(i);
        }

        return marketplaceItems.map( () => <MarketplaceItemSkeleton /> );
    }

    return ( 
        <div className="newfold-marketplace-isloading">
            { filter && <MarketplaceFilterBarSkeleton /> }

            <div className={ containerClassNames ? containerClassNames : "grid col2" }>
                { renderMarketplaceSkeletonItems(items) }
            </div>
            
        </div>
     );
}
 
export default MarketPlaceIsLoading;