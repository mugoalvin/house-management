import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native"
import { MD3Theme, Menu, Modal, Portal, Snackbar, useTheme } from "react-native-paper"
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

export type houseDataProps = {
	tenants: Partial<tenantProps[]>
	houseId: string
	tenantId: number
	houseNumber: string
	tenantName: string
	isOccupied: string
	rent: number
	houseType: string
	moveInDate: Date
}

const PlotPage = () => {
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const plotsPageStyles = getPlotsPageStyles(colorScheme, theme)
	const { plotName, plotId } = useLocalSearchParams()
	const [plotData, setPlotData] = useState<plotsProps>({} as plotsProps)
	const [housesInPlots, setHousesInPlots] = useState<houseDataProps[]>([])
	const [housesToDisplay, setHousesToDisplay] = useState<houseDataProps[]>([])
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [selectedHouseId, setSelectedHouseId] = useState<string>()
	const [snackBarMsg, setSnackBarMsg] = useState<string>('')

	const [userId, setUserId] = useState<string>()

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

	const getOccupiesHouses = (): houseDataProps[] => {
		return housesInPlots.filter(house => house.tenantId !== null)
	}

	const getVacantHouses = (): houseDataProps[] => {
		return housesInPlots.filter(house => house.tenantId == null)
	}

	const getPlotData = async (plotId: string) => {
		setPlotData((await getDoc(doc(firestore, `/users/${userId}/plots`, plotId))).data() as plotsProps)
	}

	const getHousesInPlot = async () => {
		await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses`))
			.then(snapShot => {
				const housesList: Partial<houseDataProps>[] = []
				snapShot.forEach(doc => {
					housesList.push({ houseId: doc.id, ...doc.data() })
				})
				// @ts-ignore
				housesList.sort((houseA, houseB) => houseA.houseNumber?.split('')[1] - houseB.houseNumber?.split('')[1]) // Sorts houses in ascending order
				// @ts-ignore
				setHousesInPlots(housesList)
			})
			.catch(error => {
				console.error(error)
			})
	}

	// const getTenantsInHouse = () => {
	// 	try {
	// 		housesInPlots.forEach(async house => {
	// 		const tenants = {} as Partial<tenantProps>
	// 			await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.houseId}/tenants`))
	// 				.then(snapShot => {
	// 					snapShot.forEach(doc => {
	// 						console.log({id: doc.id, ...doc.data()})
	// 						tenants.push({
	// 							id: doc.id, ...doc.data()
	// 						})
	// 					})
	// 				})
	// 			console.log(tenants)
	// 		})
	// 	}
	// 	catch (error) {
	// 		console.error(error)
	// 	}
	// }

	const getTenantsInHouse = async () => {
		try {
			// Loop through housesInPlots
			for (const house of housesInPlots) {
				const tenants: any = []

				// Fetch tenants for the current house
				const querySnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.houseId}/tenants`));

				// Process tenant data for each document
				querySnapshot.forEach(doc => {
					tenants.push({ id: doc.id, ...doc.data() });
				});

				// Update the house object with the fetched tenants (assuming a 'tenants' property exists)
				house.tenants = tenants;
			}

			// Update housesToDisplay with modified houses (considering filtering)
			const updatedHousesToDisplay = housesInPlots.map(house => ({
				...house, // Include all house properties
				// tenantName: house.tenants?.length > 0 ? house.tenants[0]?.tenantName : 'Unknown',
			}));
			console.log(updatedHousesToDisplay)
			// @ts-ignore
			setHousesToDisplay(updatedHousesToDisplay)
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (plotId && userId) {
			getPlotData(plotId as string)
			getHousesInPlot()
		}
	}, [plotId, userId])

	useEffect(() => {
		getTenantsInHouse()
	}, [housesInPlots])

	useEffect(() => {
		setHousesToDisplay(housesInPlots)
	}, [housesInPlots])

	useEffect(() => {
		navigation.setOptions({
			title: plotName as string,
		})
		getUserId()
	}, [])

	const housesData = housesToDisplay.map(house => ({
		houseId: house.houseId,
		tenantId: house.tenantId,
		houseNumber: house.houseNumber,
		tenantName: house.tenantName || 'Unknown',
		occupancy: house.isOccupied ? 'OCCUPIED' : 'VACANT',
		rent: house.rent,
		houseType: house.houseType,
		time: calculateTimeDuration(house.moveInDate)
	}))

	const closeEditHouseModal = () => {
		setModalVisibility(false)
	}

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
							>
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(housesInPlots) }} title='All' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getOccupiesHouses()) }} title='Occupied Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
								<Menu.Item onPress={() => { closeMenu(); setHousesToDisplay(getVacantHouses()) }} title='Vacant Only' titleStyle={plotsPageStyles.titleStyle} style={plotsPageStyles.menuItem} />
							</Menu>

						</View>
						<ScrollView style={plotsPageStyles.housesScrollView}>
							{
								// houseData.map(house => (
								// 	<HouseList key={house.houseId} house={house} plotName={plotName.toString()} plotId={Number(plotId)} setModalVisibility={setModalVisibility} setSelectedHouseId={setSelectedHouseId} />
								// ))

								housesToDisplay.map((house, i) => (
									<CustomizedText key={i}>{house.houseNumber} {house.tenants[0]?.tenantName}</CustomizedText>
									// <HouseList key={house.houseId} house={house} plotName={plotName.toString()} plotId={Number(plotId)} setModalVisibility={setModalVisibility} setSelectedHouseId={setSelectedHouseId} />
								))

							}
						</ScrollView>
					</Card>

					<Portal>
						<Modal
							visible={modalVisibility}
							onDismiss={closeEditHouseModal}
							style={plotsPageStyles.modal}
						>
							<EditHouse selectedHouseId={selectedHouseId || ''} closeEditHouseModal={closeEditHouseModal} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={openSnackBar} />
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