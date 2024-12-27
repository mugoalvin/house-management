import { useEffect, useState } from "react"
import { StyleSheet, useColorScheme, ScrollView, View, Dimensions } from "react-native"
import { FAB, ActivityIndicator, Snackbar, useTheme, MD3Theme } from "react-native-paper"
import { router, useNavigation } from "expo-router"

import Card from "@/component/Card"
import PlotCard from "@/component/PlotCard"
import { plotsProps } from "@/assets/plots"
import AddPlot from "@/component/AddPlot"
import CustomizedText from "@/component/CustomizedText"
import { appFontSize } from "@/assets/values"
import DeletePlot from "@/component/DeletePlot"
import EditPlot from "@/component/EditPlot"
import CustomModal from "@/component/CustomModal"
import { collection, onSnapshot } from "firebase/firestore"
import { firestore } from "@/firebaseConfig"
import AsyncStorage from "@react-native-async-storage/async-storage"


export default function Plots() {
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const [userId, setUserId] = useState<string>('')
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete' | null>(null)
	const [plotUpdated, setPlotUpdated] = useState<boolean>(false)
	const [selectedPlotId, setSelectedPlotId] = useState<string>('')
	const [fireStorePlots, setFireStorePlots] = useState<plotsProps[] | null>(null)
	const [snackBarMsg, setSnackBarMsg] = useState<string>('')

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const onToggleSnackBar = () => setSnackBarVisibility(!snackBarVisibility)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id || 'NaN')
			})
			.catch(error => {
				console.error('Error Getting User Id: ' + error)
			})
	}

	const openPlot = (plotId: string) => {
		AsyncStorage.setItem('plotId', plotId?.toString())
		router.push({ pathname: '/plotPage' })
	}

	const openPlotModal = (action: 'add' | 'edit' | 'delete', plotId: string) => {
		setSelectedPlotId(plotId)
		setModalAction(action)
		setModalVisibility(true)
	}

	const closePlotModal = () => {
		setModalVisibility(false)
		setModalAction(null)
	}

	useEffect(() => {
		if (userId !== '') {
			const unsubscribe = onSnapshot(
				collection(firestore, `/users/${userId}/plots`), (querySnapshot) => {
					const updatedPlots: plotsProps[] = [];
					querySnapshot.forEach((doc) => {
						updatedPlots.push({ id: doc.id, ...doc.data() } as plotsProps);
					});
					setFireStorePlots(updatedPlots)
				},
				(error) => {
					console.error("Error listening to Firestore changes: ", error.message);
				}
			)
			// Cleanup listener when component unmounts
			return () => unsubscribe();
		}

	}, [userId])

	useEffect(() => {
		navigation.setOptions({
			headerShown: true,
			title: 'Plots',
		})
		getUserId()
	}, [])

	return (
		<>
			<ScrollView style={getPlotStyle(colorScheme, theme).scrollView} scrollEnabled={fireStorePlots == undefined ? false : true}>
				{
					fireStorePlots == null ? (
						<View style={{ justifyContent: 'center', height: Dimensions.get('window').height, marginTop: -50 }}>
							<ActivityIndicator size='large' />
						</View>
					) :
						<View style={getPlotStyle(colorScheme, theme).view}>
							{
								fireStorePlots?.length == 0 ?
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
									fireStorePlots?.map((plotData, index) => (
										<Card key={index} onPress={() => openPlot(plotData.id?.toString() || '')}>
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
					<DeletePlot plots={fireStorePlots || []} closePlotModal={closePlotModal} plotUpdated={plotUpdated} setPlotUpdated={setPlotUpdated} setSnackBarMsg={setSnackBarMsg} onToggleSnackBar={onToggleSnackBar} />
				}
			</CustomModal>

			<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} duration={Snackbar.DURATION_SHORT} children={snackBarMsg} style={{ margin: 20, backgroundColor: theme.colors.secondary }} />

			<FAB
				visible={snackBarVisibility ? false : true}
				icon='plus'
				style={getPlotStyle(colorScheme, theme).fab}
				// onPress={() => openPlotModal('add', selectedPlotId)}
				onPress={() => openPlotModal('add', '')}
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