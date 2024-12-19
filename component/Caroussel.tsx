import React, {useRef} from 'react'
import { SafeAreaView,  ScrollView,  Text,  StyleSheet,  View,  ImageBackground,  Animated,  useWindowDimensions, Dimensions } from 'react-native'
import CustomizedText from './CustomizedText';
import Pie from './Pie';
import Bar from './Bar';

const images = new Array(6).fill(
	'https://images.unsplash.com/photo-1556740749-887f6717d7e4',
);

const Caroussel = () => {
	const scrollX = useRef(new Animated.Value(0)).current;
	// const {width: windowWidth} = Dimensions.get('window').width;
	const width2Use = Dimensions.get('window').width

	return (
			<View style={styles.scrollContainer}>
				<ScrollView
					horizontal={true}
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					onScroll={Animated.event([
						{
							nativeEvent: {
								contentOffset: {
									x: scrollX,
								},
							},
						}
					], {useNativeDriver: true})}
					// ])}
					scrollEventThrottle={1}>
					{
						images.map((image, imageIndex) => {
							return (
								<View style={{width: width2Use, height: 250}} key={imageIndex}>
									<ImageBackground source={{uri: image}} style={[styles.card, {backgroundColor: 'red'}]}>
										<View style={styles.textContainer}>
											<Text style={styles.infoText}>
												{'Image - ' + imageIndex}
											</Text>
										</View>
									</ImageBackground>
								</View>
							);
						})
					}
				</ScrollView>
				<View style={styles.indicatorContainer}>
					{images.map((image, imageIndex) => {
						const width = scrollX.interpolate({
							inputRange: [
								width2Use * (imageIndex - 1),
								width2Use * imageIndex,
								width2Use * (imageIndex + 1),
							],
							outputRange: [8, 16, 8],
							extrapolate: 'clamp',
						});
						return (
							<Animated.View
								key={imageIndex}
								style={[styles.normalDot, {width}]}
							/>
						);
					})}
				</View>
			</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollContainer: {
		height: 300,
		alignItems: 'center',
		justifyContent: 'center',
	},
	card: {
		flex: 1,
		marginVertical: 4,
		borderRadius: 5,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textContainer: {
		backgroundColor: 'rgba(0,0,0, 0.7)',
		paddingHorizontal: 24,
		paddingVertical: 8,
		borderRadius: 5,
	},
	infoText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	normalDot: {
		height: 8,
		width: 8,
		borderRadius: 4,
		backgroundColor: 'silver',
		marginHorizontal: 4,
	},
	indicatorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
})

export default Caroussel;