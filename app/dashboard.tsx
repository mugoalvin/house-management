import { View, StyleSheet, StatusBar, useColorScheme, ScrollView, DrawerLayoutAndroid, Dimensions, Alert } from "react-native"
import Card, { getCardStyle } from "@/component/Card";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ItemCount from "@/component/ItemCount";
import Bar from "@/component/Bar";
import Table from "@/component/Table";
import { Link, router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";

import * as Notifications from 'expo-notifications';


// Tenants Information
import { tenantProps, tenantsColumns } from "@/assets/tenants"

// Transactions Information
import { tableTransactionsHeadertexts } from "@/assets/transactions";
import CustomizedText from "@/component/CustomizedText";
import { useSQLiteContext } from "expo-sqlite";
import { ActivityIndicator, Icon, MD3Theme, useTheme } from "react-native-paper";
import { titleFontSize } from "@/assets/values";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { firestore } from "@/firebaseConfig";
import { firebaseTenantProps } from "@/assets/firebaseObjs/tenants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Dashboard() {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const dashboardStyle = getDashboardStyle(colorScheme, theme)

	const [ userId, setUserId ] = useState<string>()
	
	const [allTenants, setAllTenants] = useState<tenantProps[]>([])
	const [allTenantsColumns, setAllTenantsColumns] = useState<any[]>([])
	const [transactions, setTransactions] = useState<any[]>([])
	const [noOfPlots, setNoOfPlots] = useState<number>(0)
	const [noOfHouses, setNoOfHouses] = useState<number>(0)
	const [noOfTenants, setNoOfTenants] = useState<number>(0)

	const [, setIsDrawerOpen] = useState<boolean>(false)
	const drawer = useRef<DrawerLayoutAndroid>(null)
	const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>('left')
	const [userData, setUserData] = useState<firebaseTenantProps>()

	const toggleDrawer = () => {
		setIsDrawerOpen(prevIsDrawerOpen => {
			if (prevIsDrawerOpen) {
				drawer.current?.closeDrawer()
			} else {
				drawer.current?.openDrawer()
			}
			return !prevIsDrawerOpen
		})
	}

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
	}

	const mapColumnNames = (rawColumns: Array<{ name: string }>) => {
		rawColumns.pop()
		return rawColumns.map(column => {
			const columnData = tenantsColumns[column.name as keyof tenantsColumns];

			if (!columnData) {
				console.error(`No column data found for: ${column.name}`)
				return { title: column.name, flexBasisNo: 1 }
			}

			return {
				title: columnData.title,
				flexBasisNo: columnData.flexBasisNo
			}
		})
	}

	async function getTenants(): Promise<tenantProps[]> {
		const tenants: tenantProps[] = await db.getAllAsync(`
			SELECT plotName, houses.houseNumber, tenantName, contactInfo, moveInDate
			FROM tenants 
			LEFT JOIN houses ON tenants.houseId = houses.id 
			LEFT JOIN plots ON houses.plotId = plots.id
		`)
		
		tenants.forEach(tenant => {
			// @ts-ignore
			tenant.moveInDate = new Date(tenant.moveInDate).toDateString()
		})

		return tenants
	}

	async function getTenantsColumns(): Promise<any[]> {
		const allColumns: any[] = await db.getAllAsync('PRAGMA table_info(tenants)')
		let columns: any[] = []
		allColumns.map(column => {
			if (column.name != 'id' && column.name != 'occupation' && column.name !== 'rentOwed') {
				columns.push(column)
			}
		})
		return columns
	}

	async function getTransactionsData(): Promise<any[]> {
		return await db.getAllAsync('SELECT * FROM transactions JOIN tenants ON transactions.tenantId = tenants.id JOIN houses ON tenants.houseId = houses.id ORDER BY transactions.id DESC LIMIT 5')
	}

	async function getNoOfPlots(): Promise<{ rowCount: number }> {
		// return await db.getFirstAsync('SELECT COUNT(*) AS rowCount FROM plots') ?? { rowCount: 0 }
		const plotCollection = collection(firestore, `/users/${userId}/plots`)
		const plotSnapShot = await getDocs(query(plotCollection))

		return { rowCount: plotSnapShot.size }
	}

	async function getNoHouses(): Promise<{ totalRecords: number }> {
		return await db.getFirstAsync("SELECT COUNT(*) AS totalRecords FROM houses") || { totalRecords: 0 }
	}

	async function getNoTenants(): Promise<{ tenantCount: number }> {
		return await db.getFirstAsync('SELECT COUNT(*) AS tenantCount FROM tenants') || { tenantCount: 0 }
	}

	const onTenantClick = (row: any) => {
		router.push({
			pathname: '/tenantPage',
			params: {
				tenantName: row.tenantName
			}
		})
	}

	const fetchNoOfPlots = async () => {
		setNoOfPlots((await getNoOfPlots()).rowCount)
	}

	async function setData() {
		setAllTenantsColumns(mapColumnNames(await getTenantsColumns()))
		setTransactions(await getTransactionsData())
		setAllTenants(await getTenants())
		setNoOfHouses((await getNoHouses()).totalRecords)
		setNoOfTenants((await getNoTenants()).tenantCount)
	}

	useFocusEffect(
		useCallback(() => {
			// setData()
		}, [])

	)
	useFocusEffect (
		useCallback( () => {
			if (userId) {
				fetchNoOfPlots()
			}
		}, [])
	)

	useEffect(() => {
		navigation.setOptions({
			title: 'Dashboard',
			headerShown: true,
		})

		getUserId()
	}, [])

	const getUserData = async(userId: string) => {
		const docRef = doc(firestore, 'users', userId)
		const docSnap = await getDoc(docRef)

		if (docSnap.exists()) {
			setUserData(docSnap.data() as firebaseTenantProps)
		}
		else {
			console.warn('No docs found!')
		}
	}

	useEffect(() => {
		getUserData(userId as string)
	}, [userId])

	const transformedTransactions = transactions.map(transaction => ({
		name: transaction.tenantName,
		houseNo: transaction.houseNumber,
		price: transaction.amount,
		balance: transaction.rentOwed + transaction.depositOwed,
		date: new Date(transaction.transactionDate).toDateString()
	}))

	return (
		<>
			<StatusBar
				animated
				barStyle='light-content'
				backgroundColor={colorScheme == 'dark' ? theme.colors.surface : theme.colors.onSecondaryContainer}
			/>

			<ScrollView style={dashboardStyle.scrollView}>
				<View style={dashboardStyle.view}>
					<View style={dashboardStyle.row}>
						<Card cardStyle={dashboardStyle.card}>
							<ItemCount ItemCountObj={{ number: noOfPlots, label: 'Plots' }} onPress={() => router.push('/plots')} />
							{/* <Icon source='menu-right' size={40} color={theme.colors.surfaceDisabled} /> */}
						</Card>
						<Card cardStyle={dashboardStyle.card}>
							<ItemCount ItemCountObj={{ number: noOfTenants, label: noOfTenants == 1 ? 'Tenant' : 'Tenants' }} onPress={() => router.push('/tenants')} />
							{/* <Icon source='menu-right' size={40} color={theme.colors.surfaceDisabled} /> */}
						</Card>
					</View>

					<Card>
						<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Occupancy</CustomizedText>
						{/* <Bar /> */}
						<CustomizedText textStyling={{textAlign: 'center', paddingVertical: 10, fontSize: theme.fonts.labelLarge.fontSize, color: theme.colors.error}}>Upcoming</CustomizedText>
					</Card>

					<Card>
						<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Transactions</CustomizedText>
						<Table tableTitles={tableTransactionsHeadertexts} tableData={transformedTransactions} />
						<CustomizedText textStyling={{textAlign: 'center', paddingVertical: 10, fontSize: theme.fonts.labelLarge.fontSize, color: theme.colors.error}}>Upcoming</CustomizedText>
					</Card>

					<Card>
						<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Tenants</CustomizedText>
						<Table tableTitles={[{ title: 'Plot', flexBasisNo: 1 }].concat(allTenantsColumns)} tableData={allTenants} onRowPress={onTenantClick} />
						<CustomizedText textStyling={{textAlign: 'center', paddingVertical: 10, fontSize: theme.fonts.labelLarge.fontSize, color: theme.colors.error}}>Upcoming</CustomizedText>
					</Card>

					{/* <Card onPress={() => router.push('/(tabs)/settings')}>
						<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Open Tabs</CustomizedText>
					</Card> */}

					{/* <View style={{height: Dimensions.get('window').height*.6, justifyContent: 'center', alignItems: 'center'}}>
						<CustomizedText textStyling={{fontFamily: 'DefaultCustomFont-ExtraBold', fontSize: theme.fonts.headlineLarge.fontSize, color: theme.colors.error}}>Caution</CustomizedText>
						<CustomizedText textStyling={{fontFamily: 'DefaultCustomFont-Bold', fontSize: theme.fonts.headlineSmall.fontSize, textAlign: 'center'}}>Still finding things to populate the Dashboard with</CustomizedText>
					</View> */}

					{/* <Button children="Open New Page" mode="outlined" onPress={() => router.push('/(tabs)')}/> */}

				</View>
			</ScrollView>
		</>
	)
}


export const getDashboardStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	scrollView: {
		flex: 1,
		backgroundColor: theme.colors.surface
	},
	view: {
		flex: 1,
		padding: 10,
		gap: 7,
	},
	row: {
		gap: 7,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	container: {
		height: 250
	},
	page: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},

	card: {
		flexDirection: 'row',
		alignItems: 'center'
	}
})