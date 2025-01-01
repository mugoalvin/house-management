import { SafeAreaView, View, useColorScheme, } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { TextInput, useTheme } from 'react-native-paper'
import { houseProps } from '@/app/houses'
import DropDown from './DropDown'
import ConfirmView from './ConfirmView'
import { getModalStyle } from './CustomModal'
import ModalButtons from './ModalButtons'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { firestore } from '@/firebaseConfig'
import { houseDataProps } from '@/app/plotPage'


interface AddPlotProps {
	// selectedHouseId: string
	house: houseDataProps
	closeEditHouseModal: () => void
	onToggleSnackBar: () => void
	setSnackBarMsg: (msg: string) => void
}

const EditHouse = ({ house, onToggleSnackBar, setSnackBarMsg, closeEditHouseModal }: AddPlotProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [currentHouseData, setCurrentHouseData] = useState<any | undefined>()
	const maxRenderSteps = 3

	const [userId, setUserId] = useState<string>('')
	const [plotId, setPlotId] = useState<string>('')
	const [houseId, setHouseId] = useState<string>('')
	const [tenantId, setTenantId] = useState<string>('')

	const fetchTenantIdentifiers = async () => {
		const userId = await AsyncStorage.getItem('userId')
		const plotId = await AsyncStorage.getItem('plotId')
		const houseId = house.houseId
		const tenantId = await AsyncStorage.getItem('tenantId')

		setUserId(userId!)
		setPlotId(plotId!)
		setHouseId(houseId!)
		setTenantId(tenantId!)
	}

	const [formData, setFormData] = useState<Partial<houseDataProps>>({
		houseNumber: house.houseNumber,
		houseType: house.houseType,
		rent: house.rent,
	})

	const handleInputChange = (field: keyof houseDataProps, value: string | number) => {
		setFormData({ ...formData, [field]: value })
	}

	const handleNext = () => {
		if (currentStep < 3) setCurrentStep(currentStep + 1);
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}

	const getHouseData = async (userId: string, plotId: string, houseId: string, tenantId: string) => {
		if (userId === '' || plotId === '' || houseId === '' || tenantId === '') return
		else {
			const houseRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${tenantId}`)
			await getDoc(houseRef).then((doc) => {
				if (doc.exists()) {
					const data = doc.data() as houseDataProps
					setCurrentHouseData(data)
				}
			})
		}
	}


	useEffect(() => {
		(async () => {
			await fetchTenantIdentifiers()
		})()
	}, [])

	useEffect(() => {
		if (userId && plotId && houseId && tenantId) {
			getHouseData(userId, plotId, houseId, tenantId)
		}
	}, [userId, plotId, houseId, tenantId]);

	useEffect(() => {
		if (currentHouseData) {
			setFormData({
				houseNumber: currentHouseData.houseNumber,
				isOccupied: currentHouseData.isOccupied,
				houseType: currentHouseData.houseType,
				rent: currentHouseData.rent,
			});
		}
	}, [currentHouseData])

	const houseTypeDropdownData = ['Single Room', 'Bed Sitter', 'One Bedroom', 'Two Bedroom', 'Three Bedroom'].map((option, index) => ({
		key: index,
		value: option
	}))

	const updateHouseType = (key: number) => {
		return houseTypeDropdownData.find(item => item.key == key)?.value
	}

	const handleFormSubmit = async () => {
		try {
			const houseRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}`)
			await updateDoc(houseRef, {
				houseNumber: formData.houseNumber,
				houseType: formData.houseType,
				rent: formData.rent
			})
			setSnackBarMsg('House Data Updated')
			onToggleSnackBar()
			closeEditHouseModal()
		}
		catch (e) {
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
							onSelect={(value) => handleInputChange('houseType', updateHouseType(value) ?? '')}
							placeholder={formData.houseType}
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
							value={formData.rent !== undefined ? String(formData.rent) : ''}
							onChangeText={(value) => handleInputChange('rent', value ? parseInt(value) : '')}
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
						<ConfirmView keyHolder='House Number' value={formData.houseNumber || ''} />
						<ConfirmView keyHolder='House Type' value={formData.houseType ?? ''} />
						<ConfirmView keyHolder='Rent' value={formData.rent || 0} />
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
			<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} submitFormData={handleFormSubmit} />
		</SafeAreaView>
	)
}

export default EditHouse