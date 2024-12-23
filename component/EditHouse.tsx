import { Appearance, SafeAreaView, View, useColorScheme, } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { TextInput, useTheme } from 'react-native-paper'
import { useSQLiteContext } from 'expo-sqlite'
import { houseProps } from '@/app/houses'
import DropDown from './DropDown'
import ConfirmView from './ConfirmView'
import { getModalStyle } from './CustomModal'
import ModalButtons from './ModalButtons'


interface AddPlotProps {
	selectedHouseId: string
	closeEditHouseModal?: () => void
	onToggleSnackBar: () => void
	setSnackBarMsg: (msg: string) => void
}

const EditHouse = ({ selectedHouseId, closeEditHouseModal, onToggleSnackBar, setSnackBarMsg }: AddPlotProps) => {
	const db = useSQLiteContext()
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [currentHouseData, setCurrentHouseData] = useState<any | undefined>()
	const maxRenderSteps = 3

	const [formData, setFormData] = useState<houseProps>({
		plotId: 0,
		houseNumber: '',
		tenantId: 0,
		isOccupied: 'VACANT',
		type: undefined,
		rent: 0
	})

	const handleInputChange = (field: keyof houseProps, value: string | number) => {
		setFormData({ ...formData, [field]: value })
	}

	const handleNext = () => {
		if (currentStep < 3) setCurrentStep(currentStep + 1);
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}

	const getHouseData = async () => {
		const data: any = await db.getFirstAsync('SELECT * FROM houses WHERE id = ?', [selectedHouseId])		
		setCurrentHouseData(data)
	}

	useEffect(() => {
		getHouseData()
	}, [])

	useEffect(() => {
		if(currentHouseData) {
			setFormData({
				plotId: currentHouseData.plotId,
				houseNumber: currentHouseData.houseNumber,
				tenantId: currentHouseData.tenantId,
				isOccupied: currentHouseData.isOccupied,
				type: currentHouseData.houseType,
				rent: currentHouseData.rent
			})
		}
	}, [currentHouseData])

	const houseTypeDropdownData = ['Single Room', 'Bed Sitter', 'One Bedroom', 'Two Bedroom', 'Three Bedroom'].map((option, index) => ({
		key: index,
		value: option
	}))

	const updateHouseType = (key: number) => {
		return  houseTypeDropdownData.find(item => item.key == key)?.value
	}

	const handleFormSubmit = async () => {
		try{
			// closeEditHouseModal()
			await db.runAsync('UPDATE houses SET houseNumber = ?, houseType = ?, rent = ? WHERE id = ?', [formData.houseNumber, formData.type ?? '', formData.rent, selectedHouseId])
			// setHouseUpdated(!houseUpdated)
			setSnackBarMsg('House Data Updated')
			onToggleSnackBar()
		}
		catch(e) {
			console.error(e)
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 1: Basic Details</CustomizedText>
						<TextInput
							value={formData.houseNumber}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('houseNumber', value)}
							mode='outlined'
							label='House Number'
							keyboardType='numeric'
						/>
						<DropDown
							data={houseTypeDropdownData}
							onSelect={(value) => handleInputChange('type', updateHouseType(value) ?? '')}
							placeholder={formData.type}
							notFoundText='No such house type!'
							search={false}
						/>
					</View>
				)
			case 2:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 2: Rent Changes</CustomizedText>
						<TextInput
							style={getModalStyle(colorScheme, theme).textInput}
							value={String(formData.rent)}
							onChangeText={(value) => handleInputChange('rent', value)}
							mode='outlined'
							label='Rent Price'
							keyboardType='numeric'
						/>
					</View>
				)

			case 3:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 4: Confirmation</CustomizedText>
						<ConfirmView keyHolder='House Number' value={formData.houseNumber}/>
						<ConfirmView keyHolder='House Type' value={formData.type ?? ''}/>
						<ConfirmView keyHolder='Rent' value={formData.rent}/>
					</View>
				)
			default:
				return null
		}
	}


	return (
		<SafeAreaView style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Change House Record</CustomizedText>
			{renderStep()}
			<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} submitFormData={handleFormSubmit}/>
		</SafeAreaView>
	)
}

export default EditHouse