import { useCallback, useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native"
import { ActivityIndicator, MD3Theme, Menu, Modal, Portal, Snackbar, useTheme } from "react-native-paper"
import { collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore"
import { useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "@expo/vector-icons/Ionicons"

import { plotsProps } from "@/assets/plots"
import { iconSize } from "@/assets/values"
import Card, { getCardStyle } from "@/component/Card"
import CustomizedText from "@/component/CustomizedText"
import PlotInfo from "@/component/PlotInfo"
import EditHouse from "@/component/EditHouse"
import HouseList from "@/component/HouseList"
import { firestore } from "@/firebaseConfig"
import { tenantProps } from "@/assets/tenants"
import { set } from "lodash"
import ConfirmView from "@/component/ConfirmView"

export interface CombinedHouseTenantData {
	house: houseDataProps;
	tenants: Partial<tenantProps>[]
}

export type houseDataProps = {
	houseId: string
	houseNumber: string
	tenants: Partial<tenantProps>[]
	isOccupied: boolean
	rent: number
	houseType: string
}

const PlotPage = () => {
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const plotsPageStyles = getPlotsPageStyles(colorScheme, theme)
	const [userId, setUserId] = useState<string>('')
	const [plotId, setPlotId] = useState<string>('')
	const [plotData, setPlotData] = useState<plotsProps>({} as plotsProps)
	const [housesInPlots, setHousesInPlots] = useState<Partial<houseDataProps[]>>([])
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [selectedHouseId, setSelectedHouseId] = useState<string>()
	const [snackBarMsg, setSnackBarMsg] = useState<string>('')
	const [houseTenantObjList, setHouseTenantObjList] = useState<CombinedHouseTenantData[]>([])
	const [housesToDisplay, setHousesToDisplay] = useState<Partial<CombinedHouseTenantData[]>>(houseTenantObjList)

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const openSnackBar = () => setSnackBarVisibility(true)
	const dismissSnackBar = () => setSnackBarVisibility(false)

	const [menuOpen, setMenuOpen] = useState(false)
	const openMenu = () => setMenuOpen(true)
	const closeMenu = () => setMenuOpen(false)

	const getUserIdAndPlotId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString() || '')
			})
		await AsyncStorage.getItem('plotId')
			.then((id) => {
				setPlotId(id?.toString() || '')
			})

		return { userId: userId, plotId: plotId }
	}

	const getOccupiesHouses = (houseTenantObjList: CombinedHouseTenantData[]) => {
		const occupiedHouses = houseTenantObjList.filter(houseTenantData => houseTenantData.tenants.length > 0)
		return occupiedHouses
	}

	const getVacantHouses = (houseTenantObjList: CombinedHouseTenantData[]) => {
		const vacantHouses = houseTenantObjList.filter(houseTenantData => houseTenantData.tenants.length == 0)
		return vacantHouses
	}

	const getPlotData = async (plotId: string) => {
		const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
		await getDoc(plotRef).then((doc) => {
			if (doc.exists()) {
				setPlotData({ id: doc.id, ...doc.data() as plotsProps })
			} else {
				Alert.alert('Error', 'Plot not found')
			}
		})
	}

	const getTenantsInHousesWithListeners = async (userId: string, plotId: string) => {
		try {
			// Houses Listener
			const housesRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses`);

			onSnapshot(housesRef, (snapshot) => {
				const housesList: houseDataProps[] = [];
				snapshot.docs.forEach((doc) => {
					const houseData = { houseId: doc.id, ...doc.data() } as houseDataProps;
					housesList.push(houseData);
				})

				setHousesInPlots(housesList)

				housesList.forEach((house) => {
					const tenantsRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.houseId}/tenants`)

					onSnapshot(tenantsRef, (tenantsSnapshot) => {
						const tenantsList: Partial<tenantProps>[] = []
						tenantsSnapshot.docs.forEach((tenantDoc) => {
							tenantsList.push({ ...tenantDoc.data(), id: tenantDoc.id })
						})

						const combinedData: CombinedHouseTenantData = {
							house: house as houseDataProps,
							tenants: tenantsList
						}

						setHouseTenantObjList((prevList) => {
							const updatedList = [...prevList]
							const existingIndex = updatedList.findIndex((item) => item.house.houseId === house.houseId)
							if (existingIndex >= 0) {
								updatedList[existingIndex] = combinedData;
							} else {
								updatedList.push(combinedData);
							}
							return updatedList.sort((a, b) => parseInt(a.house.houseNumber.slice(1)) - parseInt(b.house.houseNumber.slice(1)))
						})
					})
				})
			})
		} catch (error) {
			console.error("Error setting up house and tenant listeners:", error);
		}
	}


	useFocusEffect(
		useCallback(() => {
			getUserIdAndPlotId()
		}, [])
	)

	useEffect(() => {
		if (plotId && userId) {
			getPlotData(plotId as string)
			getTenantsInHousesWithListeners(userId, plotId)
		}
	}, [plotId, userId])

	useEffect(() => {
		navigation.setOptions({
			title: plotData.plotName as string,
		})
	}, [plotData])

	useEffect(() => {
		setHousesToDisplay(houseTenantObjList)
	}, [houseTenantObjList])

	useFocusEffect(
		useCallback(() => {
			getPlotData(plotId as string)
		}, [])
	)
	return (
		<>
			{/* <PageHeader pageTitle={`${plotName}`} /> */}

			<ScrollView style={plotsPageStyles.scrollView}>
				<View style={plotsPageStyles.view}>
					<Card>
						{
							plotData !== {} as plotsProps && <PlotInfo userId={userId} plotData={plotData} housesTenants={houseTenantObjList} />
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
							>
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(houseTenantObjList) }} title='All' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getOccupiesHouses(houseTenantObjList)) }} title='Occupied Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getVacantHouses(houseTenantObjList)) }} title='Vacant Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
							</Menu>

						</View>
						<ScrollView style={plotsPageStyles.housesScrollView}>
							{
								housesToDisplay.length == 0 ? <ActivityIndicator /> :
									housesToDisplay.map(house => (
										<HouseList key={house?.house.houseId} house={house || {}} plotName={plotData.plotName} plotId={plotId as string} setModalVisibility={setModalVisibility} setSelectedHouseId={setSelectedHouseId} />
									))
							}
						</ScrollView>
					</Card>

					<Portal>
						<Modal
							visible={modalVisibility}
							onDismiss={() => setModalVisibility(false)}
							style={plotsPageStyles.modal}
						>
							<EditHouse house={housesToDisplay.find(h => h!.house.houseId === selectedHouseId)?.house as houseDataProps} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={openSnackBar} closeEditHouseModal={() => setModalVisibility(false)} />
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