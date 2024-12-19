import { StyleProp, StyleSheet, TextStyle } from 'react-native'
import React from 'react'
import CustomizedText from './CustomizedText'
import { bigNumberFontSize } from '@/assets/values'
import { MD3Theme, useTheme } from 'react-native-paper'

interface BigBoldProps {
	customStyle?: StyleProp<TextStyle>
	children: string | number | any
}

const BigBold = ({children, customStyle} : BigBoldProps) => {
	const theme = useTheme()
	
	return (
	// @ts-ignore
		<CustomizedText textStyling={[getStyle(theme).number, customStyle]}>{children}</CustomizedText>
	)
}

export default BigBold

const getStyle = (theme: MD3Theme) => StyleSheet.create({
	number: {
		fontSize: bigNumberFontSize,
		fontFamily: 'DefaultCustomFont-Bold',
		color: theme.colors.secondary
	}
})