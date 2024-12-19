import { useCallback, useEffect, useState } from "react"
import { StyleSheet, useColorScheme, ScrollView, View, Dimensions, Alert } from "react-native"
import { FAB, ActivityIndicator, Snackbar, useTheme, MD3Theme } from "react-native-paper"
import { router, useFocusEffect, useNavigation } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"

import Card from "@/component/Card"
import PlotCard from "@/component/PlotCard"
import { plotsProps } from "@/assets/plots"
import AddPlot from "@/component/AddPlot"
import CustomizedText from "@/component/CustomizedText"
import { appFontSize } from "@/assets/values"
import DeletePlot from "@/component/DeletePlot"
import EditPlot from "@/component/EditPlot"
import CustomModal from "@/component/CustomModal"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { firebaseAuth, firestore } from "@/firebaseConfig"

export default function Plots() {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const [allPlots, setAllPlots] = useState<plotsProps[]>([])
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete' | null>(null)
	const [plotUpdated, setPlotUpdated] = useState<boolean>(false)
	const [selectedPlotId, setSelectedPlotId] = useState<number>(0)
	const [snackBarMsg, setSnackBarMsg] = useState<string>('')

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const onToggleSnackBar = () => setSnackBarVisibility(!snackBarVisibility)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	const openPlot = (plotName: string, plotId: number) => {
		router.push({ pathname: '/plotPage', params: { plotName, plotId } })
	}

	const openPlotModal = (action: 'add' | 'edit' | 'delete', plotId: number = 0) => {
		setSelectedPlotId(plotId)
		setModalAction(action)
		setModalVisibility(true)
	}

	const closePlotModal = () => {
		setModalVisibility(false)
		setModalAction(null)
	}

	async function getAllPlotData(): Promise<plotsProps[]> {
		const querySnapShot = await getDocs(collection(firestore, '/plots'))
		querySnapShot.forEach(doc => {
			console.log(doc.id, " => ", doc.data());
		})
		return await db.getAllAsync('SELECT id, plotName, numberOfHouses, paidHouses, numberOccupiedHouses, rentPrice FROM plots') as plotsProps[]
	}

	async function getPageReady() {
		setAllPlots(await getAllPlotData())
	}

	useEffect(() => {
		navigation.setOptions({
			headerShown: true,
			title: 'Plots',
		})
		getPageReady()
	}, [plotUpdated])

	useEffect(() => {
		getPageReady()
	}, [])

	// useEffect(() => {
	// 	Alert.alert('All Plots', JSON.stringify(allPlots))
	// }, [allPlots])


	return (
			<>
				<ScrollView style={getPlotStyle(colorScheme, theme).scrollView} scrollEnabled={allPlots == undefined ? false : true}>
					{
						allPlots == undefined ? (
							<View style={{ justifyContent: 'center', height: Dimensions.get('window').height, marginTop: -50 }}>
								<ActivityIndicator size='large' />
							</View>
						) :
							<View style={getPlotStyle(colorScheme, theme).view}>
								{
									allPlots.length == 0 ?
										<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: Dimensions.get('window').height * .8 }}>
											<CustomizedText textStyling={{ textAlign: 'center', marginBottom: 20, fontFamily: 'DefaultCustomFont-Bold', fontSize: appFontSize + 5 }}>No plots available at the moment</CustomizedText>
											<CustomizedText textStyling={{ textAlign: 'center', fontSize: appFontSize }}>
												Click on
												<View style={{ backgroundColor: theme.colors.primaryContainer, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}>
													<CustomizedText>+</CustomizedText>
												</View> to add a now one below
											</CustomizedText>
										</View>
										:
										allPlots.map((plotData, index) => (
											<Card key={index} onPress={() => openPlot(plotData.plotName, plotData.id || 0)}>
												<PlotCard
													plotObj={plotData}
													openModal={(action, plotid) => openPlotModal(action, plotid)}
												/>
											</Card>
										)
										)
								}
							</View>
					}

				</ScrollView>

				<CustomModal visibility={modalVisibility} closeModal={closePlotModal}>
					{
						modalAction == "add" &&
						<AddPlot closeAddPlotModal={closePlotModal} plotUpdated={plotUpdated} setPlotUpdated={setPlotUpdated} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={onToggleSnackBar} />
					}
					{
						modalAction == "edit" &&
						<EditPlot plotId={selectedPlotId} plotUpdated={plotUpdated} closePlotModal={closePlotModal} setPlotUpdated={setPlotUpdated} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={onToggleSnackBar} />
					}
					{
						modalAction == "delete" &&
						<DeletePlot plots={allPlots || []} closePlotModal={closePlotModal} plotUpdated={plotUpdated} setPlotUpdated={setPlotUpdated} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={onToggleSnackBar} />
					}
				</CustomModal>

				<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} duration={Snackbar.DURATION_SHORT} children={snackBarMsg} style={{ margin: 20, backgroundColor: theme.colors.secondary }} />

				<FAB
					visible={snackBarVisibility ? false : true}
					icon='plus'
					style={getPlotStyle(colorScheme, theme).fab}
					onPress={() => openPlotModal('add')}
				/>
			</>
	)
}

const getPlotStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	view: {
		flex: 1,
		gap: 10,
	},
	scrollView: {
		padding: 10,
		backgroundColor: theme.colors.surface
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	}
})