import { Alert, Appearance, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
import CustomizedText from './CustomizedText'
import { plotsProps } from '@/assets/plots'
import { SelectList } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons'
import { Button, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import DropDown from './DropDown'
import { Colors } from '@/constants/Colors'
import { getModalStyle } from './CustomModal'

type plotsToDeleteProps = {
	plots: plotsProps[]
	plotUpdated: boolean
	closePlotModal: () => void
	setPlotUpdated: (state: boolean) => void
	setSnackBarMsg: (msg: string) => void
	onToggleSnackBar: () => void
}

const DeletePlot = ({ plots, plotUpdated, closePlotModal, setPlotUpdated, setSnackBarMsg, onToggleSnackBar} : plotsToDeleteProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const db = useSQLiteContext()
	const [selectedPlotToDelete, setPlotToDelete] = useState<number>(0)

	const plotList = plots.map(plot => ({
		key: plot.id,
		value: plot.plotName
	}))

	const deletePlot = async(plotId: number) => {
		const houses: plotsProps[] = await db.getAllAsync('SELECT id FROM houses WHERE plotId = ?', [plotId])
		houses.forEach(async house => {
			await db.runAsync('DELETE FROM tenants WHERE houseId = ?', [house.id || -1])
		})
		await db.runAsync('DELETE FROM houses WHERE plotId = ?', [plotId])
		await db.runAsync('DELETE FROM plots WHERE id = ?', [plotId])
		closePlotModal()
		setPlotUpdated(!plotUpdated)
		setSnackBarMsg("Plot Deleted Successfully")
		onToggleSnackBar()
	}

	return (
		<SafeAreaView style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Delete Plot</CustomizedText>
			<DropDown
				data={plotList}
				onSelect={(value : any) => setPlotToDelete(value)}
				placeholder='Select Plot To Delete'
				notFoundText='No Plot Found'
				search
				searchPlaceholder='Search Plot'
			/>
			<Button mode='elevated' style={{borderRadius: 10, marginTop: 20,}} onPress={() => deletePlot(selectedPlotToDelete) }>Delete</Button>
		</SafeAreaView>
	)
}

export default DeletePlot