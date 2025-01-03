import React, { useEffect, useState } from 'react'
import { Dimensions, Linking, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { MD3Theme, useTheme } from 'react-native-paper'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'

import { tenantProps } from '@/assets/tenants'
import CustomizedText from '@/component/CustomizedText'
import Card, { getCardStyle } from '@/component/Card'
import { getDashboardStyle } from './dashboard'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import ConfirmView from '@/component/ConfirmView'

const TenantPage = () => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const cardStyle = getCardStyle(colorScheme, theme)
	const dashboardStyles = getDashboardStyle(colorScheme, theme)
	const tenantStyle = getTenantStyle(theme)

	const [userId, setUserId] = useState<string>('')
	const [plotId, setPlotId] = useState<string>('')
	const [houseId, setHouseId] = useState<string>('')
	const [tenantId, setTenantId] = useState<string>('')


	const [tenantData, setTenantData] = useState<tenantProps>({} as tenantProps)

	const fetchTenantIdentifiers = async () => {
		await AsyncStorage.getItem('userId').then((value) => setUserId(value as string))
		await AsyncStorage.getItem('plotId').then((value) => setPlotId(value as string))
		await AsyncStorage.getItem('houseId').then((value) => setHouseId(value as string))
		await AsyncStorage.getItem('tenantId').then((value) => setTenantId(value as string))
	}

	const getTenantInfo = async (userId: string, plotId: string, houseId: string, tenantId: string) => {
		const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${tenantId}`)
		getDoc(tenantRef).then((doc) => {
			if (doc.exists()) {
				const data = doc.data()
				setTenantData(data as tenantProps)
			}
		})
	}

	const callTenant = async (phoneNumber: string) => {
		Linking.openURL(`tel: ${phoneNumber}`)
	}


	useEffect(() => {
		fetchTenantIdentifiers()
	}, [])

	useEffect(() => {
		if (userId !== '' && plotId !== '' && houseId !== '' && tenantId !== '')
			getTenantInfo(userId, plotId, houseId, tenantId)
	}, [userId, plotId, houseId, tenantId])

	useEffect(() => {
		navigation.setOptions({
			// title: tenantData.firstName + ' ' + tenantData.lastName,
			title: 'Profile',
		})
	}, [tenantData])

	return (
		<ScrollView style={dashboardStyles.scrollView}>
			<View style={dashboardStyles.view}>
				<Card>
					<ConfirmView keyHolder='User ID' value={userId} />
					<ConfirmView keyHolder='Plot ID' value={plotId} />
					<ConfirmView keyHolder='House ID' value={houseId} />
					<ConfirmView keyHolder='Tenant ID' value={tenantId} />
				</Card>
				<Card>
					<View style={tenantStyle.imageView}>
						<CustomizedText textStyling={tenantStyle.tenantName}>{tenantData.firstName} {tenantData.lastName}</CustomizedText>
						<CustomizedText textStyling={tenantStyle.occupation}>{tenantData.occupation}</CustomizedText>
					</View>
				</Card>

				<Card>
					<CustomizedText textStyling={cardStyle.cardHeaderText}>Contact Information</CustomizedText>
					<View style={tenantStyle.varValue}>
						<CustomizedText textStyling={tenantStyle.variable}>Phone:</CustomizedText>
						<CustomizedText textStyling={tenantStyle.value} onPress={() => callTenant(tenantData.contactInfo)}>{tenantData.contactInfo}</CustomizedText>
					</View>
				</Card>

				<Card>
					<CustomizedText textStyling={cardStyle.cardHeaderText}>Move In Date</CustomizedText>
					<View style={tenantStyle.varValue}>
						<CustomizedText textStyling={tenantStyle.value}>{new Date(tenantData.moveInDate).toLocaleString()}</CustomizedText>
					</View>
				</Card>

				<Card>
					<CustomizedText textStyling={cardStyle.cardHeaderText}>Payment Status</CustomizedText>
					<View style={tenantStyle.varValue}>
						<CustomizedText textStyling={tenantStyle.variable}>Deposit Owed:</CustomizedText>
						<CustomizedText textStyling={tenantStyle.value}>{tenantData.depositOwed == 0 ? '__' : tenantData.depositOwed}</CustomizedText>
					</View>
					<View style={tenantStyle.varValue}>
						<CustomizedText textStyling={tenantStyle.variable}>Rent Owed:</CustomizedText>
						<CustomizedText textStyling={tenantStyle.value}>{tenantData.rentOwed == 0 ? '__' : tenantData.rentOwed}</CustomizedText>
					</View>

				</Card>
			</View>
		</ScrollView>
	)
}

export default TenantPage

const getTenantStyle = (theme: MD3Theme) => StyleSheet.create({
	imageView: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		height: 200
	},
	tenantName: {
		fontSize: theme.fonts.headlineLarge.fontSize,
		fontFamily: 'DefaultCustomFont-Bold'
	},
	occupation: {
		fontSize: theme.fonts.titleMedium.fontSize,
		color: theme.colors.onSurfaceDisabled,
	},
	varValue: {
		flexDirection: 'row',
		width: Dimensions.get('window').width,
		gap: 20,
		alignItems: 'baseline'
	},
	variable: {
		fontFamily: 'DefaultCustomFont-Bold',
		fontSize: theme.fonts.titleMedium.fontSize
	},
	value: {

	}
})