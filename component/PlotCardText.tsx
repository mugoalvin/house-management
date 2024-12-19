import { StyleSheet, View } from 'react-native'
import React from 'react'
import CustomizedText from './CustomizedText'
import { appFontSize } from '@/assets/values'

interface PlotCardTextProps {
	value: number | string
	variable: string
}

const PlotCardText = ({value, variable} : PlotCardTextProps) => {
	return (
		<View>
			<CustomizedText textStyling={{ fontSize: 26 }}>{value}</CustomizedText>
			<CustomizedText textStyling={{ fontSize: appFontSize }}>{variable}</CustomizedText>
		</View>
	)
}

export default PlotCardText

const styles = StyleSheet.create({})