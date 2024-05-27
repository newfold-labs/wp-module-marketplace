import './stylesheet.scss';

/**
 * MarketplaceSkeleton Component
 * Use to generate content loading skeleton
 *
 * @param {*} props
 * @return {JSX.Element} MarketplaceSkeleton
 */
const MarketplaceSkeleton = ( { width, height, customClass } ) => {
	return (
		<div
			// eslint-disable-next-line prettier/prettier
			className={ 'newfold-marketplace-skeleton ' + ( customClass ) }
			style={ {
				width: width || '100%',
				height: height || 'auto',
			} }
		></div>
	);
};

export default MarketplaceSkeleton;
