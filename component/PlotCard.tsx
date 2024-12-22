import React, { useState } from 'react'
import { View, useColorScheme, StyleSheet, Pressable } from 'react-native'
import { Divider, Icon, Menu, useTheme } from 'react-native-paper'
// import { PieChart } from 'react-native-gifted-charts'
import { PieChart } from 'react-native-gifted-charts/dist/PieChart'

import { plotNameFontSize } from '@/assets/values'
import CustomizedText from './CustomizedText'
import { getCardStyle } from './Card'
import { plotsProps } from '@/assets/plots'
import PlotCardText from './PlotCardText'

interface plotCardProps {
	plotObj: plotsProps
	openModal: (action : 'add' | 'edit' | 'delete', plotId: number | string) => void
}

const PlotCard = ({ plotObj, openModal }: plotCardProps) => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const plotCardStyles = getPlotCardStyle()

	const [menuVisible, setMenuVisible] = useState(false)
	const openMenu = () => setMenuVisible(true)
	const closeMenu = () => setMenuVisible(false)

	let occupiedPercentage = (plotObj.numberOccupiedHouses / plotObj.numberOfHouses) * 100

	const pieData = [
		{ value: occupiedPercentage, color: theme.colors.primary },
		{ value: (100 - occupiedPercentage), color: colorScheme == 'dark' ? theme.colors.surface : theme.colors.primaryContainer }
	]

	return (
		<>
			<View style={getCardStyle(colorScheme, theme).cardHeaderView}>
				<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>{plotObj.plotName}</CustomizedText>
				<Menu
					visible={menuVisible}
					onDismiss={closeMenu}
					anchorPosition='bottom'
					contentStyle={{top: 0, right: 30, backgroundColor: theme.colors.surface}}
					anchor={
						<Pressable onPress={openMenu} style={getPlotCardStyle().ellipsis}>
							<Icon source='dots-vertical' size={20}/>
						</Pressable>
					}>
					{/* <Menu.Item onPress={() => {closeMenu(); openModal('edit', plotObj.id || 0)}} title="Edit Plot Data" leadingIcon='pencil' titleStyle={plotCardStyles.titleStyle}/> */}
					<Menu.Item onPress={() => {closeMenu(); openModal('edit', plotObj.id || '')}} title="Edit Plot Data" leadingIcon='pencil' titleStyle={plotCardStyles.titleStyle}/>
					<Divider />
					<Menu.Item onPress={() => {closeMenu(); openModal('delete', plotObj.id || '')}} title="Delete Plot" leadingIcon='delete' titleStyle={plotCardStyles.titleStyle}/>
				</Menu>
			</View>
			<View style={{ flexDirection: 'row' }}>
				<View style={{ flex: 1, paddingBottom: 10, alignSelf: 'flex-end', flexDirection: 'row', gap: 30 }}>
					<PlotCardText value={plotObj.numberOfHouses} variable='Houses'/>
					<PlotCardText value={plotObj.numberOccupiedHouses} variable='Occupied'/>
					<PlotCardText value={plotObj.paidHouses} variable='Paid'/>
				</View>
				<View style={{ aspectRatio: 1, padding: 10 }}>
					<PieChart
						donut
						radius={60}
						innerRadius={55}
						innerCircleColor={theme.colors.elevation.level1}
						data={pieData}
						centerLabelComponent={() => (
							<CustomizedText textStyling={{ textAlign: 'center' }}>
								<CustomizedText textStyling={{ fontSize: 24 }} >{occupiedPercentage.toFixed(0)}%</CustomizedText>
								{'\n'}
								Occupied
							</CustomizedText>
						)}
					/>
				</View>
			</View>
		</>
	)
}

export default PlotCard

export const getPlotCardStyle = () => StyleSheet.create({
	plotName: {
		fontSize: plotNameFontSize,
		fontFamily: 'DefaultCustomFont-Bold'
	},
	ellipsis: {
		alignItems: 'flex-end',
		justifyContent: 'center',
		height: '100%',
		aspectRatio: 1
	},
	titleStyle: {
		fontFamily: 'DefaultCustomFont'
	}
})