import Marketplace from './marketplace';
import ProductPage from './productPage';

const NewfoldMarketplace = ( { methods, constants, ...props } ) => {
	const match = methods.useMatch( 'marketplace/product/:id' );
	if ( match ) {
		return <ProductPage productId={ match.params.id } />;
	}

	return (
		<Marketplace methods={ methods } constants={ constants } { ...props } />
	);
};

export default NewfoldMarketplace;
