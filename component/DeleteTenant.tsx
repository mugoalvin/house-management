import { Alert, Appearance, useColorScheme, View } from 'react-native'
import React from 'react'
import CustomizedText from './CustomizedText'
import { tenantProps } from '@/assets/tenants'
import { Button, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import { getModalStyle } from './CustomModal'

interface DeleteTenantProps {
	tenantInfo: tenantProps
	plotId: number
	closeModal: () => void
	onOpenSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const DeleteTenant = ({tenantInfo, plotId, closeModal, onOpenSnackBar, setSnackbarMsg} : DeleteTenantProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const db = useSQLiteContext()
	const theme = useTheme()

	async function deleteTenant() {
		const plotData: {numberOccupiedHouses : number} = await db.getFirstAsync('SELECT numberOccupiedHouses FROM plots WHERE id = ?', [plotId]) ?? {numberOccupiedHouses : 0}
		await db.runAsync('DELETE FROM tenants WHERE id = ?', [tenantInfo.id])
		await db.runAsync('UPDATE plots SET numberOccupiedHouses = ? WHERE id = ?', [plotData.numberOccupiedHouses - 1 , plotId])
		closeModal()
		setSnackbarMsg(`${tenantInfo.tenantName} is no longer a tenant.`)
		onOpenSnackBar()
	}

	return (
		<View style={getModalStyle(colorScheme, theme).main}>
			{
				(tenantInfo !== null && tenantInfo !== undefined)
				?
				<>
					<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Tenant Is Moving Out</CustomizedText>
					<CustomizedText textStyling={{textAlign: 'center', marginVertical: 10}}>Do you want to make house vacant and remove tenant: {'\n'} 
						<CustomizedText textStyling={{ fontFamily: 'DefaultCustomFont-Bold', fontSize: 20 }}>{tenantInfo.tenantName}</CustomizedText>
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