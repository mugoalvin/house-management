import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native"
import { ActivityIndicator, MD3Theme, Menu, Modal, Portal, Snackbar, useTheme } from "react-native-paper"
import { plotsProps } from "@/assets/plots"
import { useSQLiteContext } from "expo-sqlite"
import { useLocalSearchParams, useNavigation } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"

import { calculateTimeDuration, iconSize } from "@/assets/values"
import Card, { getCardStyle } from "@/component/Card"
import CustomizedText from "@/component/CustomizedText"
import PlotInfo from "@/component/PlotInfo"
import EditHouse from "@/component/EditHouse"
import HouseList from "@/component/HouseList"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { firestore } from "@/firebaseConfig"
import { tenantProps } from "@/assets/tenants"

// export type houseDataProps = {
// 	tenants: Partial<tenantProps[]>
// 	houseId: string
// 	tenantId: number
// 	houseNumber: string
// 	tenantName: string
// 	isOccupied: string
// 	rent: number
// 	houseType: string
// 	moveInDate: Date
// }

export interface CombinedHouseTenantData {
	house: houseDataProps;
	tenants: tenantProps[];
}

export type houseDataProps = {
	houseId: string
	houseNumber: string
	tenants: Partial<tenantProps[]>
	isOccupied: boolean
	rent: number
	houseType: string
}


const PlotPage = () => {

	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const plotsPageStyles = getPlotsPageStyles(colorScheme, theme)
	const [userId, setUserId] = useState<string>()
	const { plotName, plotId } = useLocalSearchParams()
	const [plotData, setPlotData] = useState<plotsProps>({} as plotsProps)
	const [housesInPlots, setHousesInPlots] = useState<Partial<houseDataProps[]>>([])
	const [housesToDisplay, setHousesToDisplay] = useState<Partial<CombinedHouseTenantData[]>>([])
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [selectedHouseId, setSelectedHouseId] = useState<string>()
	const [snackBarMsg, setSnackBarMsg] = useState<string>('')
	const [houseTenantObjList, setHouseTenantObjList] = useState<CombinedHouseTenantData[]>([])

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const openSnackBar = () => setSnackBarVisibility(true)
	const dismissSnackBar = () => setSnackBarVisibility(false)

	const [menuOpen, setMenuOpen] = useState(false)
	const openMenu = () => setMenuOpen(true)
	const closeMenu = () => setMenuOpen(false)

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
	}

	const getPlotData = async (plotId: string) => {
		setPlotData((await getDoc(doc(firestore, `/users/${userId}/plots`, plotId))).data() as plotsProps)
	}

	const getTenantsInHouses = async () => {
		try {
			// Get all houses in the plot
			const housesSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses`));
			const housesList: Partial<houseDataProps>[] = [];

			// Loop through each house and collect house data
			for (const doc of housesSnapshot.docs) {
				const houseData = { houseId: doc.id, ...doc.data() };
				housesList.push(houseData)
			}

			// @ts-ignore
			// Sort houses in ascending order based on house number
			housesList.sort((houseA, houseB) => houseA.houseNumber?.split('')[1] - houseB.houseNumber?.split('')[1]);
			// @ts-ignore
			setHousesInPlots(housesList)

			const combinedList: CombinedHouseTenantData[] = [];

			// Loop through each house to check for tenants
			for (const house of housesList) {
				const tenantsSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.houseId}/tenants`));
				const tenantsList: Partial<tenantProps>[] = [];

				// Check if tenants exist and collect tenant data
				if (!tenantsSnapshot.empty) {
					for (const tenantDoc of tenantsSnapshot.docs) {
						tenantsList.push({ id: tenantDoc.id, ...tenantDoc.data() });
					}

					// Create CombinedHouseTenantData object
					const combinedData: CombinedHouseTenantData = {
						house: house as houseDataProps,
						// @ts-ignore
						tenants: tenantsList,
					};

					// Add to combined list
					combinedList.push(combinedData);
				}
				else {
					const combinedData: CombinedHouseTenantData = {
						house: house as houseDataProps,
						tenants: []
					};
					combinedList.push(combinedData)
				}
			}

			// Update state with the combined list
			setHouseTenantObjList(combinedList || housesList)
		} catch (error) {
			console.error("Error fetching tenants in houses:", error);
		}
	};



	// Get User Id
	// Get Plot Data
	useEffect(() => {
		navigation.setOptions({
			title: plotName as string,
		})
		getUserId()
		getPlotData(plotId as string)
	}, [])
	
	// Get Houses in plot
	useEffect(() => {
		if (plotId && userId) {
			getPlotData(plotId as string)
			getTenantsInHouses()
		}
	}, [plotId, userId])
	
	// Update Houses In Plot
	// Utilize Filters
	// Render Houses








	useEffect(() => {
		setHousesToDisplay(houseTenantObjList)
	}, [houseTenantObjList])



	return (
		<>
			{/* <PageHeader pageTitle={`${plotName}`} /> */}

			<ScrollView style={plotsPageStyles.scrollView}>
				<View style={plotsPageStyles.view}>
					<Card>
						{
							plotData !== undefined && <PlotInfo plotData={plotData} houses={housesInPlots} />
						}
					</Card>

					<Card>
						<View style={getCardStyle(colorScheme, theme).cardHeaderView}>
							<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Houses</CustomizedText>

							<Menu
								visible={menuOpen}
								onDismiss={closeMenu}
								anchor={
									<TouchableOpacity onPress={openMenu} style={{ flexDirection: 'row', gap: 10 }}>
										<CustomizedText>Filter</CustomizedText>
										<Ionicons name="filter" size={iconSize} color={theme.colors.onSurface} />
									</TouchableOpacity>
								}
								contentStyle={{ backgroundColor: theme.colors.surface, top: 40 }}
								children={undefined}
							>
								{/* <Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(housesInPlots) }} title='All' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} /> */}
								{/* <Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getOccupiesHouses()) }} title='Occupied Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} /> */}
								{/* <Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getVacantHouses()) }} title='Vacant Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} /> */}
							</Menu>

						</View>
						<ScrollView style={plotsPageStyles.housesScrollView}>
							{
								housesToDisplay.length == 0 ? <ActivityIndicator /> :
								housesToDisplay.map(house => (
									<HouseList key={house?.house.houseId} house={house || {}} plotName={plotName.toString()} plotId={plotId as string} setModalVisibility={setModalVisibility} setSelectedHouseId={setSelectedHouseId} />
								))
							}
						</ScrollView>
					</Card>

					<Portal>
						<Modal
							visible={modalVisibility}
							// onDismiss={closeEditHouseModal}
							style={plotsPageStyles.modal}
						>
							<EditHouse selectedHouseId={selectedHouseId || ''}
								// closeEditHouseModal={closeEditHouseModal} 
								setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={openSnackBar} />
						</Modal>
					</Portal>

				</View>
			</ScrollView>
			<Snackbar visible={snackBarVisibility} onDismiss={dismissSnackBar} duration={Snackbar.DURATION_SHORT} children={snackBarMsg} style={{ margin: 20, backgroundColor: theme.colors.secondary }} />
		</>
	)
}

export default PlotPage

export const getPlotsPageStyles = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	scrollView: {
		position: 'relative',
		rowGap: 20,
		padding: 10,
		backgroundColor: theme.colors.surface
	},
	view: {
		flex: 1,
		gap: 10,
	},
	modal: {
		margin: 20,
	},
	housesScrollView: {
		// height: 200
	},
	menuItem: {
		height: 40
	},
	titleStyle: {
		fontFamily: 'DefaultCustomFont',
		fontSize: theme.fonts.bodyMedium.fontSize,
	}
})