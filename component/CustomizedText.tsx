import { StyleSheet, Text, TextStyle } from 'react-native'
import React from 'react'
import { useTheme } from 'react-native-paper'

type CustomizedTextProps = {
	children?: React.ReactNode
	textStyling?: TextStyle
	numberOfLines?: number
	ellipsizeMode?: 'clip' | 'head' | 'middle' | 'tail'
	onPress?: () => void
}

const CustomizedText = ({ children, textStyling, numberOfLines, ellipsizeMode, onPress }: CustomizedTextProps) => {
	const theme = useTheme()

	const customTextStyles = StyleSheet.create({
		text: {
			// color: theme.colors.onPrimaryContainer,
			color: theme.colors.onSurface,
			fontFamily: 'DefaultCustomFont',
			fontSize: theme.fonts.bodyMedium.fontSize,
		}
	})

	return (
		<Text
			style={[customTextStyles.text, textStyling]}
			onPress={onPress}
			numberOfLines={numberOfLines}
			ellipsizeMode={ellipsizeMode}>
				{children}
		</Text>
	)
}

export default CustomizedText