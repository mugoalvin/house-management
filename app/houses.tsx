import { View, Text, useColorScheme, ScrollView, Appearance } from 'react-native'
import React from 'react'
import PageHeader from '@/component/PageHeader'
import { StyleSheet } from 'react-native'
import { Colors } from '@/constants/Colors'
import { MD3Theme, ThemeProvider, useTheme } from 'react-native-paper'

export type houseProps = {
	plotId: number
	houseNumber: string
	tenantId: number
	isOccupied: 'VACANT' | 'OCCUPIED'
	type: 'Single Room' | 'Bed Sitter' | 'One Bedroom' | 'Two Bedroom' | 'Three Bedroom' | undefined
	rent: number
}

const houses = () => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const plotsPageStyles = getPlotsPageStyles(colorScheme, theme)

	return (
		<>
			{/* <PageHeader pageTitle='Houses' /> */}
			<ScrollView style={plotsPageStyles.scrollView} />
		</>
	)
}

export default houses


const getPlotsPageStyles = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	view: {
		flex: 1,
		gap: 20,
	},
	scrollView: {
		rowGap: 20,
		padding: 10,
		backgroundColor: theme.colors.onSecondary,
	},
})