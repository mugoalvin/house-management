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

export interface CombinedHouseTenantData {
	house: houseDataProps;
	tenants: Partial<tenantProps>[]
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
	const [userId, setUserId] = useState<string>('')
	const [plotId, setPlotId] = useState<string>('')
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

	const getPlotData = async (plotId: string) => {
		setPlotData((await getDoc(doc(firestore, `/users/${userId}/plots`, plotId))).data() as plotsProps)
	}

	const getTenantsInHousesWithListeners = async (userId: string, plotId: string) => {
	try {
		// Houses Listener
		const housesRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses`);
		console.log("Listening for house changes...");

		onSnapshot(housesRef, (snapshot) => {
			const housesList: houseDataProps[] = [];
			snapshot.docs.forEach((doc) => {
				const houseData = { houseId: doc.id, ...doc.data() } as houseDataProps;
				housesList.push(houseData);
			});

			// Sort houses by houseNumber
			// @ts-ignore
			// housesList.sort((houseA, houseB) => parseInt(houseA.houseNumber?.split('')[1]) - parseInt(houseB.houseNumber?.split('')[1]))
			housesList.sort((a, b) => {
				const numA = parseInt(a.houseNumber.substring(1), 10)
				const numB = parseInt(b.houseNumber.substring(1), 10)
				return numA - numB;
			});
			// housesList.sort()
			setHousesInPlots(housesList);

			// Handle house changes dynamically
			snapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					console.log("House added: ", change.doc.data());
				} else if (change.type === "modified") {
					console.log("House modified: ", change.doc.data());
				} else if (change.type === "removed") {
					console.log("House removed: ", change.doc.data());
				}
			});

			// Update tenants for each house
			housesList.forEach((house) => {
				const tenantsRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.houseId}/tenants`);

				onSnapshot(tenantsRef, (tenantsSnapshot) => {
					const tenantsList: Partial<tenantProps>[] = [];
					tenantsSnapshot.docs.forEach((tenantDoc) => {
						tenantsList.push({ id: tenantDoc.id, ...tenantDoc.data() });
					});

					// Create or update the combined data
					const combinedData: CombinedHouseTenantData = {
						house: house as houseDataProps,
						tenants: tenantsList,
					};

					// Update the combinedList state dynamically
					setHouseTenantObjList((prevList) => {
						const updatedList = [...prevList];
						const existingIndex = updatedList.findIndex((item) => item.house.houseId === house.houseId);
						if (existingIndex >= 0) {
							updatedList[existingIndex] = combinedData;
						} else {
							updatedList.push(combinedData);
						}
						return updatedList;
					});
				});
			});
		});
	} catch (error) {
		console.error("Error setting up house and tenant listeners:", error);
	}
};


	useFocusEffect(
		useCallback(() => {
			getUserIdAndPlotId()
		}, [])
	)

	useEffect(() => {
		if (plotId && userId) {
			getPlotData(plotId as string)
			getTenantsInHousesWithListeners(userId, plotId)
			// getTenantsInHouses()
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
			if (plotId && userId) {
				getPlotData(plotId as string)
				// getTenantsInHouses()
			}
		}, [])
	)

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
										<HouseList key={house?.house.houseId} house={house || {}} plotName={plotData.plotName} plotId={plotId as string} setModalVisibility={setModalVisibility} setSelectedHouseId={setSelectedHouseId} />
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