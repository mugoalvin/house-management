import React, { useEffect, useState } from 'react'
import { Dimensions, Linking, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { MD3Theme, useTheme } from 'react-native-paper'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite'

import { tenantProps } from '@/assets/tenants'
import CustomizedText from '@/component/CustomizedText'
import Card, { getCardStyle } from '@/component/Card'
import { getDashboardStyle } from './dashboard'

const tenantPage = () => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const cardStyle = getCardStyle(colorScheme, theme)
	const dashboardStyles = getDashboardStyle(colorScheme, theme)
	const tenantStyle = getTenantStyle(theme)
	const { tenantName } = useLocalSearchParams()
	const [ tenantData, setTenantData ] = useState<tenantProps>({} as tenantProps)

	const getTenantInfo = async () => {
		const tenantResults = await db.getFirstAsync('SELECT * FROM tenants WHERE tenantName = ?', [tenantName as string]) as tenantProps
		setTenantData(tenantResults)
	}

	const callTenant = async (phoneNumber: string) => {
		Linking.openURL(`tel: ${phoneNumber}`)
	}

	useEffect(() => {
		navigation.setOptions({
			// title: tenantData.tenantName,
			title: 'Profile',
		})
	}, [tenantData])


	useEffect(() => {
		getTenantInfo()
	}, [])

	return (
		<ScrollView style={dashboardStyles.scrollView}>
			<View style={dashboardStyles.view}>
				<Card>
					<View style={tenantStyle.imageView}>
						<CustomizedText textStyling={tenantStyle.tenantName}>{tenantData.tenantName}</CustomizedText>
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

export default tenantPage

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
	varValue : {
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