const initialState = {
	html: null,
	loading: true,
	error: false,
};

const ProductPage = ( { productPageId, methods } ) => {
	const [ data, setData ] = methods.useState( {
		...initialState,
	} );

	methods.useEffect( () => {
		// Reset the state
		setData( {
			...initialState,
		} );

		methods
			.apiFetch( {
				url: methods.NewfoldRuntime.createApiUrl(
					`/newfold-marketplace/v1/products/page`,
					{ id: productPageId }
				),
			} )
			.then( ( response ) => {
				if ( response.hasOwnProperty( 'html' ) ) {
					setData( {
						html: response.html,
						loading: false,
						error: false,
					} );
				} else {
					setData( {
						html: null,
						loading: false,
						error: true,
					} );
				}
			} );
	}, [ productPageId ] );

	return (
		<div>
			{ data.loading && <p>Loading...</p> }
			{ data.error && <p>Error loading product</p> }
			{ data.html && (
				<div
					dangerouslySetInnerHTML={ {
						__html: data.html,
					} }
				/>
			) }
		</div>
	);
};

export default ProductPage;
