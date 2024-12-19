import { Alert, Appearance, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { Button, TextInput, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import ModalButtons from './ModalButtons'
import { getModalStyle } from './CustomModal'
import ConfirmView from './ConfirmView'

interface FormData {
	plotName: string
	numberOfHouses: number | 0
	houseType: string
	rentPrice: number | 0
	details: string

	paidHouses?: number
	amountPaid?: number
	numberOccupiedHouses?: number
}

interface EditPlotProps {
	plotId: number
	plotUpdated: boolean
	closePlotModal: () => void
	setPlotUpdated: (state: boolean) => void
	setSnackBarMsg : (msg: string) => void
	onToggleSnackBar: () => void
}

const EditPlot = ({plotId, plotUpdated, closePlotModal, setPlotUpdated, setSnackBarMsg, onToggleSnackBar} : EditPlotProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const db = useSQLiteContext()
	const maxRenderSteps = 4
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [plotData, setPlotData ] = useState<any | undefined>(undefined)
	const [formData, setFormData] = useState<FormData>({
		plotName: '',
		numberOfHouses: 0,
		houseType: '',
		rentPrice: 0,
		details: ''
	})
	
	const getInitialData = async () => {
		const results: any = await db.getFirstAsync('SELECT * FROM plots WHERE id = ?', [plotId])
		setPlotData(results)
	}

	useEffect(() => {
		getInitialData()
	}, [])
	
	useEffect(() => {
		if(plotData) {
			setFormData({
				plotName: plotData.plotName,
				numberOfHouses: plotData.numberOfHouses,
				houseType: plotData.houseType,
				rentPrice: plotData.rentPrice,
				details: plotData.details
			})
		}
	}, [plotData])

	// ===============================================================================
	const submitFormData = () => {
		try{
			db.runAsync('UPDATE plots SET plotName = ?, numberOfHouses = ?, houseType = ?, rentPrice = ?, details = ? WHERE id = ?', [formData.plotName, formData.numberOfHouses, formData.houseType, formData.rentPrice, formData.details, plotId])
			closePlotModal()
			setPlotUpdated(!plotUpdated)
			setSnackBarMsg('Plot Updated Successfully')
			onToggleSnackBar()
		}
		catch (e) {
			Alert.alert('Error', `${e}`)
		}
	}
	
	// Function to handle input changes
	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData({ ...formData, [field]: value });
	}

	// Function to handle next button click
	const handleNext = () => {
		if (currentStep < maxRenderSteps) setCurrentStep(currentStep + 1);
	}

	// Function to handle back button click
	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}


	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 1: Basic Details</CustomizedText>
						<TextInput
							value={formData.plotName}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('plotName', value)}
							mode='outlined'
							label="Plot Name"
						/>
					</View>
				)
			case 2:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 2: Plot Details</CustomizedText>						
						<TextInput
							label="Brief Plot Details"
							mode='outlined'
							keyboardType='default'
							value={formData.details}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('details', value)}
						/>
					</View>
				)
			case 3:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 3: Payment Details</CustomizedText>
						<TextInput
							label="Rent Price"
							mode='outlined'
							keyboardType='numeric'
							value={formData.rentPrice !== undefined ? String(formData.rentPrice) : ''}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('rentPrice', value)}
						/>
					</View>
				)
			case 4:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 4: Confirmation</CustomizedText>
						<ConfirmView keyHolder='Plot Name' value={formData.plotName} />
						<ConfirmView keyHolder='Rent Price' value={formData.rentPrice} />
						<ConfirmView keyHolder='Details' value={formData.details} />
					</View>
				)
			default:
				return null
		}
	}

	
	return (
		<SafeAreaView style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Edit Plot Data</CustomizedText>
			{renderStep()}
			<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleBack={handleBack} handleNext={handleNext} submitFormData={submitFormData}/>
		</SafeAreaView>	)
}

export default EditPlot