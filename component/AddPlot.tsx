import { Alert, SafeAreaView, View, useColorScheme, } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { TextInput, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import DropDown from './DropDown'
import { getModalStyle } from './CustomModal'
import ModalButtons from './ModalButtons'
import ConfirmView from './ConfirmView'


import { firestore } from '@/firebaseConfig'
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { houseProps } from '@/app/houses'


interface FormData {
	plotName: string
	numberOfHouses: number | undefined
	houseType: string
	rentPrice: number
	details: string
	paidHouses?: number
	amountPaid?: number
	numberOccupiedHouses?: number
}

interface AddPlotProps {
	plotUpdated: boolean
	closeAddPlotModal: () => void
	onToggleSnackBar: () => void
	setSnackBarMsg: (msg: string) => void
	setPlotUpdated: (state: boolean) => void
}

const AddPlot = ({ plotUpdated, closeAddPlotModal, onToggleSnackBar, setSnackBarMsg, setPlotUpdated }: AddPlotProps) => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const [currentStep, setCurrentStep] = useState<number>(1)
	const initialFormData: FormData = {plotName: '', numberOfHouses: 0, houseType: '', rentPrice: 0, details: '', paidHouses: 0, amountPaid: 0, numberOccupiedHouses: 0}
	const [formData, setFormData] = useState<FormData>(initialFormData)
	const maxRenderSteps = 4
	
	const [ userId, setUserId ] = useState<string>()

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
	}

	const handleInputChange = (field: keyof FormData, value: string | number) => {
		setFormData({ ...formData, [field]: value });
	}

	const handleNext = () => {
		if (currentStep < maxRenderSteps) setCurrentStep(currentStep + 1);
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}

	const submitFormData = async () => {
		// ++++++++++++++++++++++++++++++++++++++++Firebase Add Plot++++++++++++++++++++++++++++++++++++++++
		const docRef = doc(collection(firestore, `/users/${userId}/plots`))
		await setDoc(docRef, formData)
			.then(async () => {
				const plotId = docRef.id
				for (let i = 0; i < (formData.numberOfHouses ?? 0); i++) {
					const houseDocRef = doc(collection(firestore, `/users/${userId}/plots/${plotId}/houses`))
					await setDoc(houseDocRef, {
						houseNumber: `#${i + 1}`,
						houseType: formData.houseType,
						rent: formData.rentPrice
					})
				}

				closeAddPlotModal()
				setPlotUpdated(!plotUpdated)
				onToggleSnackBar()
				setSnackBarMsg(`${formData.plotName} and ${formData.numberOfHouses} Created Successfully`)
			})
			.catch(error => {
				console.error(error)
			})

		// const houseData : houseProps = {
		// 	// houseNumber: 
		// 	rent: 
		// }
		// await setDoc(doc(firestore, `/users/${userId}/plots/${docRef.id}/houses`), )
		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		
		// -------------------------------------------------------------------------------SQLite Add Tenant-------------------------------------------------------------------------------
		// const newTenant = await db.runAsync(`
		// 	INSERT INTO plots( 'plotName', 'numberOfHouses', 'houseType', 'rentPrice', 'details', 'paidHouses', 'amountPaid', 'numberOccupiedHouses' ) VALUES( ?, ?, ?, ?, ?, 0, 0, 0 ); ` ,
		// 	[formData.plotName, formData.numberOfHouses ?? 0, formData.houseType, formData.rentPrice ?? 0, formData.details])

		// if (newTenant.changes == 1) {
		// 	closeAddPlotModal()
		// 	setPlotUpdated(!plotUpdated)
		// 	// Alert.alert('Done', `${formData.plotName} Added Successfully`)
		// 	onToggleSnackBar()
		// 	setSnackBarMsg(`${formData.plotName} Added Successfully`)
		// }
		// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	}

	const houseOptions = [
		{key: 1, value: 'Single Room' },
		{key: 2, value: 'Bedsitter' },
		{key: 3, value: 'One Bedroom' },
		{key: 4, value: 'Two Bedroom' },
		{key: 5, value: 'Three Bedroom' },
	]

	useEffect(() => {
		getUserId()
	}, [])

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
						<TextInput
							label="Number Of Houses"
							mode='outlined'
							keyboardType='numeric'
							onChangeText={(value) => handleInputChange('numberOfHouses', parseInt(value))}
							style={getModalStyle(colorScheme, theme).textInput}
						/>
					</View>
				)
			case 2:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 2: Plot Details</CustomizedText>						
						<DropDown
							data={houseOptions}
							onSelect={(key) => {
								const selectedItem = houseOptions.find(option => option.key === key)
								handleInputChange('houseType', selectedItem?.value || '')}
							}
							placeholder='Select House Type'
						/>
						<TextInput
							label="Brief Plot Details"
							mode='outlined'
							keyboardType='default'
							value={formData.details}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('details', value)}
						/>
					</View>
				);
			case 3:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 3: Payment Details</CustomizedText>
						<TextInput
							label="Rent Price"
							mode='outlined'
							keyboardType='numeric'
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('rentPrice', parseInt(value))}
						/>
					</View>
				)
			case 4:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 4: Confirmation</CustomizedText>

						<ConfirmView keyHolder='Plot Name' value={formData.plotName} />
						<ConfirmView keyHolder='Number of Houses' value={formData.numberOfHouses || 0} />
						<ConfirmView keyHolder='House Type' value={formData.houseType} />
						<ConfirmView keyHolder='Rent Price' value={formData.rentPrice} />
					</View>
				);
			default:
				return null
		}
	}


	return (
		<SafeAreaView style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Create Plot</CustomizedText>
			{renderStep()}
			<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleBack={handleBack} handleNext={handleNext} submitFormData={submitFormData}/>
		</SafeAreaView>
	)
}


export default AddPlot