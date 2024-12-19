import { StyleSheet, useColorScheme, Pressable, StyleProp, ViewProps, ViewStyle } from 'react-native'
import { useTheme, MD3Theme } from 'react-native-paper'

type CardProps = {
	children ?: any
	cardStyle?: StyleProp<ViewStyle>
	onPress?: () => void
}

const Card = ({children, cardStyle, onPress} : CardProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const CardStyle = getCardStyle(colorScheme, theme)

	return (
		// <Pressable style={CardStyle.cardView} onPress={(event) => {event.preventDefault(); onPress}}>
		<Pressable style={[CardStyle.cardView, cardStyle]} onPress={onPress}>
			{children}
		</Pressable>
	)
}

export default Card


export const getCardStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	cardView: {
		position: 'relative',
		flex: 1,
		overflow: 'hidden',
		padding: 10,
		minHeight: 50,
		borderRadius: 10,
		backgroundColor: colorScheme == 'dark' ? theme.colors.elevation.level1 : theme.colors.elevation.level2
	},
	cardHeaderText: {
		fontFamily: 'DefaultCustomFont-Bold',
		fontSize: theme.fonts.titleLarge.fontSize,
		marginVertical: 10,
		color: theme.colors.tertiary
		// color: theme.colors.onSecondaryContainer
		// color: theme.colors.surfaceVariant
	},
	cardHeaderView: {
		flexDirection: "row",
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 50
	}
})