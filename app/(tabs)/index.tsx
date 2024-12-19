import { Alert, SafeAreaView, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from '@/component/CustomizedText'
import { Button, useTheme } from 'react-native-paper'
import { getDashboardStyle } from '../dashboard'
import { useSQLiteContext } from 'expo-sqlite'
import Card, { getCardStyle } from '@/component/Card'
import ConfirmView from '@/component/ConfirmView'
import { tenantProps } from '@/assets/tenants'

const index = () => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const style = getDashboardStyle(colorScheme, theme)
	const cardStyle = getCardStyle(colorScheme, theme)

	const [tenant, setTenant] = useState<tenantProps>({} as tenantProps)

	const fetchTenant = async () => {
		try {
			const tenant: tenantProps = await db.getFirstAsync('SELECT * FROM tenants WHERE houseId = 100') || {} as tenantProps
			setTenant(tenant)
		}
		catch (error) {
			Alert.alert('Error Fetching', `${error}`)
			return {} as tenantProps
		}
	}

	const insertTenant = async () => {
		try {
			const insert = await db.runAsync('INSERT INTO tenants(houseId, tenantName, contactInfo, moveInDate, occupation, rentOwed, depositOwed) VALUES(?, ?, ?, ?, ?, ?, ?)', [100, 'John Doe', '012345', '30/11/2000', 'Nurse', 5000, 5000])
			insert.changes == 1 && Alert.alert('Done', 'New tenant inserted successfully')
		}
		catch (error) {
			Alert.alert('Error Inserting', `${error}`)
		}
	}

	const deleteTenant = async () => {
		try {
			const remove = await db.runAsync('DELETE FROM tenants WHERE houseId = 100')
			remove.changes == 1 && Alert.alert('Done', 'Tenant deleted successfully')
		}
		catch (error) {
			Alert.alert('Error Deleting', `${error}`)
		}
	}

	return (
		<SafeAreaView style={style.scrollView}>
			<View style={style.view}>
				<View style={style.row}>
					<Card>
						<View>
							<CustomizedText textStyling={cardStyle.cardHeaderText}>Read</CustomizedText>
							<Button children="Fetch" mode='text' onPress={fetchTenant} />
						</View>
						{
							Object.entries(tenant).map(([key, value]) => (
								<ConfirmView keyHolder={key} value={`${value.toString()}`} />
							))
						}
					</Card>
				</View>

				<View style={style.row}>
					<Card>
						<CustomizedText textStyling={cardStyle.cardHeaderText}>Insert</CustomizedText>
						<Button children="Insert" mode='text' onPress={insertTenant} />
					</Card>
				</View>

				<View style={style.row}>
					<Card>
						<CustomizedText textStyling={cardStyle.cardHeaderText}>Delete</CustomizedText>
						<Button children="Delete" mode='text' onPress={deleteTenant} />
					</Card>
				</View>

			</View>
		</SafeAreaView>
	)
}

export default index