import React, { useEffect, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import { getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomizedText from './CustomizedText'
import { tenantProps } from '@/assets/tenants'
import { getModalStyle } from './CustomModal'
import { firestore } from '@/firebaseConfig'

interface DeleteTenantProps {
	tenantInfo: tenantProps
	plotId: number
	closeModal: () => void
	onOpenSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const DeleteTenant = ({tenantInfo, closeModal, onOpenSnackBar, setSnackbarMsg} : DeleteTenantProps) => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'

	const [userId, setUserId] = useState<string>('')
	const [plotId, setPlotId] = useState<string>('')
	const [houseId, setHouseId] = useState<string>('')
	// const [tenantId, setTenantId] = useState<string>('')

	const fetchTenantIdentifiers = async () => {
		await AsyncStorage.getItem('userId').then((value) => setUserId(value as string))
		await AsyncStorage.getItem('plotId').then((value) => setPlotId(value as string))
		await AsyncStorage.getItem('houseId').then((value) => setHouseId(value as string))
	}

	async function deleteTenant() {
		let numberOccupiedHouses = 0
		await getDoc(doc(firestore, `/users/${userId}/plots/${plotId}`))
			.then((doc) => {
				numberOccupiedHouses = doc.data()?.numberOccupiedHouses
			}).
			catch((error) => {
				console.error('Error geting number of occupied houses: ' + error)
			})
		await deleteDoc(doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${tenantInfo.id}`)).catch((error) => console.error('Error deleting tenant: ' + error))
		await updateDoc(doc(firestore, `/users/${userId}/plots/${plotId}`), { numberOccupiedHouses: numberOccupiedHouses - 1 }).catch((error) => console.error('Error updating number of occupied houses: ' + error))

		closeModal()
		setSnackbarMsg(`${tenantInfo.firstName} is no longer a tenant.`)
		onOpenSnackBar()
	}

	useEffect(() => {
		fetchTenantIdentifiers()
	}, [])

	useEffect(() => {
		fetchTenantIdentifiers()
	}, [])
	return (
		<View style={getModalStyle(colorScheme, theme).main}>
			{
				(tenantInfo !== null && tenantInfo !== undefined)
				?
				<>
					<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Tenant Is Moving Out</CustomizedText>
					<CustomizedText textStyling={{textAlign: 'center', marginVertical: 10}}>Do you want to make house vacant and remove tenant: {'\n'} 
						<CustomizedText textStyling={{ fontFamily: 'DefaultCustomFont-Bold', fontSize: 20 }}>{tenantInfo.firstName} {tenantInfo.lastName}</CustomizedText>
					</CustomizedText>
					<View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
						<Button mode='elevated' style={{width: '45%', borderRadius: 10}} onPress={deleteTenant}>Yes</Button>
						<Button mode='elevated' style={{width: '45%', borderRadius: 10}} onPress={closeModal}>Cancel</Button>
					</View>
				</>
				:
				<CustomizedText textStyling={{textAlign: 'center', marginVertical: 10}}>No Tenant Available</CustomizedText>
			}
		</View>
	)
}

export default DeleteTenant