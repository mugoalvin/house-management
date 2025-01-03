import React, { useState } from 'react'
import { Pressable, Vibration } from 'react-native'
import { router, useNavigation } from 'expo-router'
import { Avatar, Icon, List, Menu, useTheme } from 'react-native-paper'
import { CombinedHouseTenantData } from '@/app/plotPage'
import { calculateTimeDuration } from '@/assets/values'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomizedText from './CustomizedText'

// import {  } from 'react-navigation'

type HouseInListProps = {
	plotId: string
	plotName: string
	house: Partial<CombinedHouseTenantData>
	setModalVisibility: (state: boolean) => void
	setSelectedHouseId: (houseId: string) => void
}


const HouseList = ({ house, plotName, plotId, setModalVisibility, setSelectedHouseId }: HouseInListProps) => {
	const theme = useTheme()

	const navigation = useNavigation()

	const [visible, setVisible] = useState(false)
	const openMenu = () => setVisible(true)
	const closeMenu = () => setVisible(false)


	const handleHousePress = (house: Partial<CombinedHouseTenantData>) => {

		if (house.tenants && house.tenants[0] && house.tenants[0].id) {
			AsyncStorage.setItem('houseId', house.house?.houseId || '')
			AsyncStorage.setItem('tenantId', house.tenants[0].id)
		}

		router.push({
			pathname: '/housePage',
			params: {
				houseId: house.house?.houseId,
				plotid: plotId,
				plotName: plotName,
				house: JSON.stringify(house ?? {} as Partial<CombinedHouseTenantData>)
			}
		})		
	}

	return (
		<>
			<List.Item
				onPress={() => handleHousePress(house)}
				onLongPress={() => { openMenu(); Vibration.vibrate(150) }}
				title={(house.tenants ?? []).length > 0 ? `${house.tenants![0].firstName}  ${house.tenants![0].lastName}` : 'VACANT'}
				description={house.tenants?.length !== 0 && house.tenants![0].moveInDate ? calculateTimeDuration(new Date(house.tenants![0].moveInDate)) : ''}
				titleStyle={house.tenants?.length !== 0 ? { fontFamily: 'DefaultCustomFont-ExtraBold' } : { color: '#999', fontFamily: 'DefaultCustomFont' }}
				descriptionStyle={{ fontFamily: 'DefaultCustomFont' }}
				left={props => (
					<>
						<Avatar.Text label={house.house?.houseNumber || ''} size={45} labelStyle={{ fontFamily: 'DefaultCustomFont-ExtraBold', fontSize: 24, color: theme.colors.tertiary }} style={{ backgroundColor: theme.colors.surface }} />
					</>
				)}
				right={() => (
					<Menu
						visible={visible}
						onDismiss={closeMenu}
						contentStyle={{ top: 30, right: 30, backgroundColor: theme.colors.surface }}
						anchor={
							<Pressable onPress={openMenu} style={{ paddingVertical: 10, paddingLeft: 15 }}>
								<Icon source='dots-vertical' size={20} />
							</Pressable>
						}>
						<Menu.Item
							onPress={() => {
								closeMenu()
								setSelectedHouseId(house.house?.houseId || 'No House ID')
								setModalVisibility(true)
							}}
							leadingIcon='pencil'
							title="Edit House Type"
							titleStyle={{ fontFamily: 'DefaultCustomFont', fontSize: theme.fonts.bodyMedium.fontSize }}
						/>
					</Menu>
				)}
			/>
		</>
	)
}

export default HouseList