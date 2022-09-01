import { default as MarketplaceList } from '../marketplaceList/';
import { default as MarketplaceIsLoading } from '../marketplaceIsLoading/';

/**
 * Marketplace Module
 * For use in brand app to display marketplace
 * 
 * @param {*} props 
 * @returns 
 */
 const Marketplace = ({methods, constants, Components, ...props}) => {
	const [ isLoading, setIsLoading ] = methods.useState( true );
	const [ isError, setIsError ] = methods.useState( false );
	const [ marketplaceCategories, setMarketplaceCategories ] = methods.useState( [] );
	const [ marketplaceItems, setMarketplaceItems ] = methods.useState( [] );
	const [ initialTab, setInitialTab ] = methods.useState();
	const navigate = methods.useNavigate();
	const location = methods.useLocation();

	/**
	 * Update url when navigating between tabs
	 * @param string tab name 
	 */
	const onTabNavigate = ( tabName ) => {
		navigate( '/marketplace/' + tabName, { replace: true } );
	};

	/**
	 * on mount load all marketplace data from module api
	 */
	methods.useEffect(() => {
		methods.apiFetch( {
			url: `${constants.resturl}/newfold-marketplace/v1/marketplace`
		}).then( ( response ) => {
			
			// check response for data
			if ( ! response.hasOwnProperty('data') ) {
				setIsError( true );
			} else {
				const products = response['data'];
				setMarketplaceItems( products );
				setMarketplaceCategories( collectCategories( products ) );
			}
		});
	}, [] );

	/**
	 * When marketplaceItems changes
	 * verify that there are products
	 */
	 methods.useEffect(() => {
		// only after a response
		if ( !isLoading ) {
			// if no marketplace items, display error
			if ( marketplaceItems.length < 1 ) {
				setIsError( true );
			} else {
				setIsError( false );
			}
		}
	}, [ marketplaceItems ] );

	/**
	 * When marketplaceCategories changes
	 * verify that the tab is a category
	 */
	 methods.useEffect(() => {
		// only before rendered, but after categories are populated
		if ( isLoading && marketplaceCategories.length > 1 ) {
			// read initial tab from path
			if ( location.pathname.includes( 'marketplace/' ) ) {
				const urlpath = location.pathname.substring( 
					location.pathname.lastIndexOf( '/' ) + 1
				);
				// make sure a category exists for that path
				if ( urlpath && marketplaceCategories.filter(cat => cat.name === urlpath ).length == 0 ) {
					// if not found, set to featured category
					setInitialTab( 'featured' );
				} else {
					// if found, set that to the initial tab
					setInitialTab( urlpath );
				}
			}
			setIsLoading( false );
		}
	}, [ marketplaceCategories ] );

	/**
	 * map all categories into an array for consuming by tabpanel component
	 * @param Array products 
	 * @returns 
	 */
	const collectCategories = ( products ) => {
		
		if ( ! products.length ) {
			return [];
		}
		
		let thecategories = [];
		let cats = new Set();
		products.forEach((product) => {
			product.categories.forEach((category) => {
				cats.add( category );
			});
		});
		cats.forEach((cat)=>{
			thecategories.push( {
				name: cat.toLowerCase().replaceAll(' ', '-'),
				title: cat,
				currentCount: constants.perPage
			});
		});
		thecategories.sort(
			function( a, b ) {
				// stick featured to top
				if ( a.name === 'featured' ) { return -1; }
				if ( b.name === 'featured' ) { return 1; }
				// sort the rest alphabetically
				if ( a.name < b.name) { return -1; }
				if ( a.name > b.name) { return 1; }
				return 0;
			}
		);
		return thecategories;
	};

	/**
	 * Save a potential updated display counts per category
	 * @param string categoryName 
	 * @param Number newCount 
	 */
	const saveCategoryDisplayCount = (categoryName, newCount) => {
		let updatedMarketplaceCategories = [...marketplaceCategories];
		// find matching cat, and update perPage amount
		updatedMarketplaceCategories.forEach((cat)=>{
			if (cat.name === categoryName ) {
				cat.currentCount = newCount;
			}
		});
		setMarketplaceCategories( updatedMarketplaceCategories );
	};

	/**
	 * render marketplace preloader
	 * 
	 * @returns React Component
	 */
	 const renderSkeleton = () => {
		// render default skeleton
		return <MarketplaceIsLoading />;
	}


	return (
		<div className={methods.classnames('newfold-marketplace-wrapper')}>
			{ isLoading && 
				renderSkeleton()
			}
			{ isError && 
				<h3>Oops, there was an error loading the marketplace, please try again later.</h3>
			}
			{ !isLoading && !isError &&
				<Components.TabPanel
					className="newfold-marketplace-tabs"
					activeClass="current-tab"
					orientation="vertical"
					initialTabName={ initialTab }
					onSelect={ onTabNavigate }
					tabs={ marketplaceCategories }
				>
					{ ( tab ) => <MarketplaceList
						marketplaceItems={marketplaceItems}
						category={tab.title}
						Components={Components}
						methods={methods}
						constants={constants}
						currentCount={tab.currentCount}
						saveCategoryDisplayCount={saveCategoryDisplayCount}
					/> }
				</Components.TabPanel>
			}
		</div>
	)

};

export default Marketplace;