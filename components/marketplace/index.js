import { Container, Title } from '@newfold/ui-component-library';
import { default as MarketplaceList } from '../marketplaceList/';
import { default as MarketplaceIsLoading } from '../marketplaceIsLoading/';
import { Sidebar } from '../marketplaceSubnav/Sidebar';

const defaults = {
	eventendpoint: '/newfold-data/v1/events/',
	perPage: 12,
	appendCategoryToTitle: true,
	text: {
		title: __( 'Marketplace', 'wp-module-marketplace' ),
		subTitle: __(
			'Explore our featured collection of tools and services.',
			'wp-module-marketplace'
		),
		error: __(
			'Oops, there was an error loading the marketplace, please try again later.',
			'wp-module-marketplace'
		),
		noProducts: __(
			'Sorry, no marketplace items. Please, try again later.',
			'wp-module-marketplace'
		),
		loadMore: __( 'Load More', 'wp-module-marketplace' ),
	},
};

/**
 * Marketplace Module
 * For use in brand app to display marketplace
 *
 * @param {*} props
 * @return
 */
const Marketplace = ( { methods, constants, ...props } ) => {
	const [ isLoading, setIsLoading ] = methods.useState( true );
	const [ isError, setIsError ] = methods.useState( false );
	const [ marketplaceCategories, setMarketplaceCategories ] =
		methods.useState( [] );
	const [ marketplaceItems, setMarketplaceItems ] = methods.useState( [] );
	const [ products, setProducts ] = methods.useState( [] );
	const [ activeCategoryIndex, setActiveCategoryIndex ] =
		methods.useState( 0 );
	const location = methods.useLocation();

	// set defaults if not provided
	constants = Object.assign( defaults, constants );
	/**
	 * on mount load all marketplace data from module api
	 */
	methods.useEffect( () => {
		methods
			.apiFetch( {
				url: methods.NewfoldRuntime.createApiUrl(
					'/newfold-marketplace/v1/marketplace'
				),
			} )
			.then( ( response ) => {
				// check response for data
				if (
					! response.hasOwnProperty( 'categories' ) ||
					! response.hasOwnProperty( 'products' )
				) {
					setIsError( true );
				} else {
					setMarketplaceItems( response.products.data );
					setMarketplaceCategories(
						validateCategories( response.categories.data )
					);
				}
			} );
	}, [] );

	/**
	 * When marketplaceItems changes
	 * verify that there are products
	 */
	methods.useEffect( () => {
		// only after a response
		if ( ! isLoading ) {
			// if no marketplace items, display error
			if ( marketplaceItems.length < 1 ) {
				setIsError( true );
			} else {
				setIsError( false );
			}
		}
	}, [ marketplaceItems, products ] );

	/**
	 * When marketplaceCategories changes
	 * verify that the tab is a category
	 */
	methods.useEffect( () => {
		let aci = 0;
		// only before rendered, but after categories are populated
		if ( marketplaceCategories.length > 1 ) {
			// read initial tab from path
			if ( location.pathname.includes( 'marketplace/' ) ) {
				const urlpath = location.pathname.substring(
					location.pathname.lastIndexOf( '/' ) + 1
				);

				// make sure a category exists for that path
				if (
					urlpath &&
					marketplaceCategories.filter(
						( cat ) => cat.name === urlpath
					).length != 0
				) {
					// if found, set the active category
					marketplaceCategories.forEach( ( cat, i ) => {
						if ( cat.name === urlpath ) {
							aci = i;
						}
					} );
				}
			}
			setActiveCategoryIndex( aci );
			filterProducts( aci );
			applyStyles();
		}
	}, [ marketplaceCategories, location.pathname ] );

	/**
	 * Filter products based on urlpath
	 * @param activeCategoryIndex
	 */
	const filterProducts = ( activeCategoryIndex ) => {
		const category = marketplaceCategories[ activeCategoryIndex ].name;
		const filterdProducts = marketplaceItems.filter( ( product ) => {
			return product.categories.some( ( element ) => {
				return element.toLowerCase() === category.toLowerCase();
			} );
		} );

		setProducts( filterdProducts );
		setIsLoading( false );
	};

	/**
	 * Validate provided category data
	 * @param Array      categories
	 * @param categories
	 * @return
	 */
	const validateCategories = ( categories ) => {
		if ( ! categories.length ) {
			return [];
		}

		const thecategories = [];
		categories.forEach( ( cat ) => {
			cat.currentCount = constants.perPage;
			cat.className = 'newfold-marketplace-category-' + cat.name;

			if ( cat.products_count > 0 ) {
				thecategories.push( cat );
			}
		} );

		return thecategories;
	};

	/**
	 * Apply styles if they exist
	 */
	const applyStyles = () => {
		if ( marketplaceCategories ) {
			marketplaceCategories.forEach( ( category ) => {
				if (
					category.styles && // category has styles
					! document.querySelector(
						'[data-styleid="' + category.className + '"]'
					) // not already added
				) {
					const style = document.createElement( 'style' );
					style.textContent = category.styles;
					style.dataset.styleid = category.className;
					document.head.appendChild( style );
				}
			} );
		}
	};

	/**
	 * render marketplace preloader
	 *
	 * @return React Component
	 */
	const renderSkeleton = () => {
		// render default skeleton
		return <MarketplaceIsLoading />;
	};

	const getSectionTitle = () => {
		if (
			! isLoading &&
			! isError &&
			marketplaceCategories &&
			constants.appendCategoryToTitle
		) {
			return (
				constants.text.title +
				': ' +
				marketplaceCategories[ activeCategoryIndex ].title
			);
		}

		return constants.text.title;
	};

	return (
		<div className="nfd-page-content nfd-flex nfd-relative nfd-gap-6 nfd-max-w-full nfd-my-0 nfd-flex-col md:nfd-flex-row">
			<Sidebar
				categories={ marketplaceCategories }
				activeCategoryIndex={ activeCategoryIndex }
				methods={ methods }
				constants={ constants }
			/>
			<Container>
				<Container.Header
					title={ getSectionTitle() }
					description={ constants.text.subTitle }
				/>
				<Container.Block className="newfold-marketplace-wrapper">
					{ isLoading && renderSkeleton() }
					{ isError && (
						<Title as="h3" size="3">
							{ constants.text.error }
						</Title>
					) }
					{ ! isLoading && ! isError && (
						<MarketplaceList
							marketplaceItems={ products }
							category={
								marketplaceCategories[ activeCategoryIndex ]
							}
							currentCount={
								marketplaceCategories[ activeCategoryIndex ]
									.currentCount
							}
							methods={ methods }
							constants={ constants }
						/>
					) }
				</Container.Block>
			</Container>
		</div>
	);
};

export default Marketplace;
