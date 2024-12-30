import { SafeAreaView, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { plotsProps } from '@/assets/plots'
import { ActivityIndicator, Button, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import DropDown from './DropDown'
import { getModalStyle } from './CustomModal'
import { collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

type plotsToDeleteProps = {
	plots: plotsProps[]
	plotUpdated: boolean
	closePlotModal: () => void
	setPlotUpdated: (state: boolean) => void
	setSnackBarMsg: (msg: string) => void
	onToggleSnackBar: () => void
}

const DeletePlot = ({ plots, plotUpdated, closePlotModal, setPlotUpdated, setSnackBarMsg, onToggleSnackBar }: plotsToDeleteProps) => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const [selectedPlotToDelete, setPlotToDelete] = useState<number>(0)
	const [userId, setUserId] = useState<string>('')
	const [loading, setLoading] = useState<boolean>(false)

	const plotList = plots.map(plot => ({
		key: plot.id,
		value: plot.plotName
	}))

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id || 'NaN')
			})
			.catch(error => {
				console.error('Error Getting User Id: ' + error)
			})
	}

	// const deletePlot = async () => {
	// 	console.log('Deleting Plot: ' + selectedPlotToDelete)

	// 	const plotRef = doc(firestore, `/users/${userId}/plots/${selectedPlotToDelete}`)
	// 	await deleteDoc(plotRef)


	// 	closePlotModal()
	// 	setPlotUpdated(!plotUpdated)
	// 	setSnackBarMsg("Plot Deleted Successfully")
	// 	onToggleSnackBar()
	// }


	const deletePlot = async () => {
		try {
			const plotPath = `/users/${userId}/plots/${selectedPlotToDelete}`;
			const plotRef = doc(firestore, plotPath);

			// Recursive function to delete subcollections
			const deleteDocumentWithSubcollections = async (documentPath: string) => {
				const docRef = doc(firestore, documentPath);

				// Get all subcollections of the document
				const subcollections = await getDocs(collection(firestore, `/users/${userId}/plots/${selectedPlotToDelete}/houses`))

				for (const subcollection of subcollections.docs) {
					const subcollectionRef = collection(firestore, subcollection.ref.path, 'houses')
					const subcollectionDocs = await getDocs(subcollectionRef);

					for (const subDoc of subcollectionDocs.docs) {
						await deleteDocumentWithSubcollections(subDoc.ref.path);
					}
				}

				// Delete the document
				await deleteDoc(docRef);
			};

			// Call the recursive deletion function
			await deleteDocumentWithSubcollections(plotPath);

			// Update UI and show snackbar
			closePlotModal();
			setPlotUpdated(!plotUpdated);
			setSnackBarMsg("Plot Deleted Successfully");
			onToggleSnackBar();
		} catch (error) {
			console.error(error)
			setSnackBarMsg("Failed to delete plot: " + error)
			onToggleSnackBar()
		}
	};


	useEffect(() => {
		getUserId()
	}, [])

	return (
		<SafeAreaView style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Delete Plot</CustomizedText>
			<DropDown
				// @ts-ignore
				data={plotList}
				onSelect={(value: any) => setPlotToDelete(value)}
				placeholder='Select Plot To Delete'
				notFoundText='No Plot Found'
				search
				searchPlaceholder='Search Plot'
			/>
			<Button mode='elevated' style={{ borderRadius: 10, marginTop: 20, }} onPress={() => {setLoading(true); deletePlot()}}><CustomizedText children={loading ? <ActivityIndicator /> : "Delete"} /></Button>
		</SafeAreaView>
	)
}

export default DeletePlot