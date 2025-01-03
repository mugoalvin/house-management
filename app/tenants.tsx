import { SafeAreaView, SectionList, StyleSheet, useColorScheme, View } from 'react-native'
import { Avatar, List, MD3Theme, useTheme } from 'react-native-paper'
import React, { useEffect, useState } from 'react'
import { router, useNavigation } from 'expo-router'
import { getDashboardStyle } from './dashboard'
import CustomizedText from '@/component/CustomizedText'
import Card, { getCardStyle } from '@/component/Card'
import { useSQLiteContext } from 'expo-sqlite'
import { plotsProps } from '@/assets/plots'
import { tenantProps } from '@/assets/tenants'
import { houseDataProps } from './plotPage'
import { calculateTimeDuration } from '@/assets/values'

const Tenants = () => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const navigation = useNavigation()
	const [allPlots, setAllPlots] = useState<plotsProps[]>([])
	const [DATA, setDATA] = useState<{ title: string; data: (tenantProps & houseDataProps)[] }[]>([])


	navigation.setOptions({
		title: 'Tenants',
		headerTitleStyle: {
			fontFamily: 'DefaultCustomFont-Bold',
			fontSize: theme.fonts.titleLarge.fontSize,
		}
	})

	const getAllPlots = async () => {
		const plots = await db.getAllAsync('SELECT * FROM plots') as plotsProps[]
		setAllPlots(plots)
	}

	const getTenantInPlot = async (plotId: number) => {
		const tenantInPlot = await db.getAllAsync(`SELECT tenants.*, houses.* FROM tenants JOIN houses ON tenants.houseId = houses.id JOIN plots ON houses.plotId = plots.id WHERE plots.id = ?`, [plotId]) as (tenantProps & houseDataProps)[]
		return tenantInPlot
	}

	useEffect(() => {
		getAllPlots()
	}, [])

	useEffect(() => {
		const fetchData = async () => {
			const groupedData = await Promise.all(
				allPlots.map(async plot => {
					const tenants = await getTenantInPlot(plot.id || 0)
					return {
						title: plot.plotName,
						data: tenants,
					}
				})
			)
			setDATA(groupedData)
		}

		if (allPlots.length > 0) {
			fetchData();
		}
	}, [allPlots]);

	return (
		<SafeAreaView style={getDashboardStyle(colorScheme, theme).scrollView}>
			<View style={getDashboardStyle(colorScheme, theme).view}>
				<SectionList
					sections={DATA}
					renderSectionHeader={({ section: { title } }) => (
						<View style={getSectionStyle(colorScheme, theme).titleView}>
							<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>{title}</CustomizedText>
						</View>
					)}
					renderItem={({ item: tenant }) => (
						<Card cardStyle={{ marginVertical: 5 }} onPress={() => router.push({ pathname: '/tenantPage', params: { tenantName: tenant.tenantName } })}>
							<List.Item
								title={tenant.tenantName}
								titleStyle={{ fontFamily: 'DefaultCustomFont-ExtraBold' }}
								description={calculateTimeDuration(new Date(tenant.moveInDate))}
								descriptionStyle={{ fontFamily: 'DefaultCustomFont' }}
								left={props => (
									<Avatar.Text label={tenant.houseNumber} size={45} labelStyle={{ fontFamily: 'DefaultCustomFont-ExtraBold', fontSize: 24, color: theme.colors.tertiary }} style={{ backgroundColor: theme.colors.surface }} />
								)}
							/>
						</Card>
					)}
					renderSectionFooter={() => (
						<View style={{ height: 20 }} />
					)}
				/>
			</View>
		</SafeAreaView>
	)
}

export default Tenants


const getSectionStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	titleView: {
	},
	title: {

	},
	itemView: {
		// backgroundColor: 'green'
	},
	item: {

	}
})