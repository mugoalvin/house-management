import { Alert, Pressable, Vibration, View } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { Avatar, Button, Divider, Icon, List, Menu, useTheme } from 'react-native-paper'

type houseObject = {
	houseId: string
	tenantId: number
	houseNumber: string
	tenantName: string
	occupancy: string
	time: string
}

type HouseInListProps = {
	plotId: number
	plotName: string
	house: houseObject
	setModalVisibility: (state: boolean) => void
	setSelectedHouseId: (houseId: string) => void
}


const HouseList = ({ house, plotName, plotId, setModalVisibility, setSelectedHouseId }: HouseInListProps) => {
	const theme = useTheme()

	const [visible, setVisible] = useState(false)
	const openMenu = () => setVisible(true)
	const closeMenu = () => setVisible(false)

	const handleHousePress = (plotName: string, house: houseObject, plotId: number) => {
		router.push({
			pathname: '/housePage',
			params: {
				plotId: plotId,
				plotName: plotName,
				house: JSON.stringify(house ?? {} as houseObject),
			}
		})
	}

	return (
		<>
			<List.Item
				onPress={() => handleHousePress(plotName, house, plotId)}
				onLongPress={() => {openMenu(); Vibration.vibrate(150)}}
				title={house.tenantName == 'Unknown' ? 'VACANT' : house.tenantName}
				titleStyle={house.tenantName != 'Unknown' ? { fontFamily: 'DefaultCustomFont-ExtraBold' } : { color: '#999', fontFamily: 'DefaultCustomFont' }}
				description={house.tenantName !== 'Unknown' && house.time}
				descriptionStyle={{ fontFamily: 'DefaultCustomFont' }}
				left={props => (
					<>
						<Avatar.Text label={house.houseNumber} size={45} labelStyle={{ fontFamily: 'DefaultCustomFont-ExtraBold', fontSize: 24, color: theme.colors.tertiary }} style={{backgroundColor: theme.colors.surface}} />
					</>
				)}
				right={() => (
					<Menu
						visible={visible}
						onDismiss={closeMenu}
						contentStyle={{top: 30, right: 30, backgroundColor: theme.colors.surface}}
						anchor={
							<Pressable 
								onPress={openMenu} style={{paddingVertical: 10, paddingLeft: 15}}>
								<Icon source='dots-vertical' size={20} />
							</Pressable>
						}>
						<Menu.Item
							onPress={() => {
								closeMenu()
								setSelectedHouseId(house.houseId)
								setModalVisibility(true)
								}}
							leadingIcon='pencil'
							title="Edit House Type"
							titleStyle={{fontFamily: 'DefaultCustomFont', fontSize: theme.fonts.bodyMedium.fontSize}}
							/>
					</Menu>
				)}
			/>
		</>
	)
}

export default HouseList