import { SafeAreaView, useColorScheme } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { plotsProps } from '@/assets/plots'
import { Button, useTheme } from 'react-native-paper'
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

	const deletePlot = async (plotId: number) => {
		// -----------------------------------------------------------------------------------SQLite-----------------------------------------------------------------------------------
		const houses: plotsProps[] = await db.getAllAsync('SELECT id FROM houses WHERE plotId = ?', [plotId])
		houses.forEach(async house => {
			await db.runAsync('DELETE FROM tenants WHERE houseId = ?', [house.id || -1])
		})
		await db.runAsync('DELETE FROM houses WHERE plotId = ?', [plotId])
		await db.runAsync('DELETE FROM plots WHERE id = ?', [plotId])
		// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


		// +++++++++++++++++++++++++++++++++++++++++Firestore+++++++++++++++++++++++++++++++++++++++++
		const plotRef = doc(firestore, `/users/${userId}/plots/${selectedPlotToDelete}`)
		// const houseDocs = await getDocs(collection(plotRef, 'houses'))
		await deleteDoc(plotRef)
		// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		closePlotModal()
		setPlotUpdated(!plotUpdated)
		setSnackBarMsg("Plot Deleted Successfully")
		onToggleSnackBar()
	}

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
			<Button mode='elevated' style={{ borderRadius: 10, marginTop: 20, }} onPress={() => deletePlot(selectedPlotToDelete)}>Delete</Button>
		</SafeAreaView>
	)
}

export default DeletePlot