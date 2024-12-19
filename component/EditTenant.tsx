import { Alert, StyleSheet, Text, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getModalStyle } from './CustomModal'
import { TextInput, useTheme } from 'react-native-paper'
import CustomizedText from './CustomizedText'
import ModalButtons from './ModalButtons'
import { tenantFormProps, tenantProps } from '@/assets/tenants'
import { houseDataProps } from '@/app/plotPage'
import { useSQLiteContext } from 'expo-sqlite'
import ConfirmView from './ConfirmView'

interface editTenantProps {
	tenantId: number
	openSnackBar: () => void
	closeModal: () => void
	setSnackbarMsg: (msg: string) => void
}

const EditTenant = ({ tenantId, openSnackBar, closeModal, setSnackbarMsg }: editTenantProps) => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const maxRenderSteps = 5
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [tenantInfo, setTenantInfo] = useState<tenantProps>()
	const initialFormData: tenantFormProps = { id: 0, houseId: 0, tenantName: '', firstName: '', lastName: '', contactInfo: '', moveInDate: new Date(), occupation: '', rentOwed: 0, depositOwed: 0 }
	const [formData, setFormData] = useState(initialFormData)
	

	const getTenantData = async () => {
		// setHouseData
		let data : tenantProps = await db.getFirstAsync('SELECT * FROM tenants WHERE id = ?', [tenantId]) || {} as tenantProps
		setTenantInfo(data)

		setFormData({
			id: data?.id || 0,
			houseId: data?.houseId || 0,
			tenantName: data?.tenantName || '',
			firstName: data?.tenantName.split(' ')[0] || '',
			lastName: data?.tenantName.split(' ')[1] || '',
			contactInfo: data?.contactInfo || '',
			moveInDate: data?.moveInDate || new Date,
			occupation: data?.occupation || '',
			rentOwed: data?.rentOwed || 0,
			depositOwed: data?.depositOwed || 0
		})
	}

	useEffect(() => {
		getTenantData()
	}, [])

	const handleInputChange = (field: keyof tenantFormProps, value: string | number | Date) => {
		setFormData(prevState => {
			const updatedForm = { ...prevState, [field]: value }
			if (field === 'firstName' || field === 'lastName') {
				updatedForm.tenantName = `${updatedForm.firstName.trim()} ${updatedForm.lastName.trim()}`
			}
			return updatedForm
		})
	}
	const handleNext = () => {
		if (currentStep < maxRenderSteps) setCurrentStep(currentStep + 1)
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1)
	}

	const submitForm = async () => {
		closeModal()
		try{
			await db.runAsync('UPDATE tenants SET tenantName = ?, contactInfo = ?, occupation = ?, depositOwed = ?, rentOwed = ? WHERE id = ?', [formData.tenantName, formData.contactInfo, formData.occupation, formData.depositOwed, formData.rentOwed, tenantId])
			setSnackbarMsg('Tenant\'s data has been updated')
			openSnackBar()
		}
		catch(e) {
			Alert.alert('ERROR', `${e}`)
		}
	}
	

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 1: Get Name</CustomizedText>
						<TextInput
							value={formData.firstName}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('firstName', value)}
							mode='outlined'
							label='First Name'
							keyboardType='default'
						/>
						<TextInput
							value={formData.lastName}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('lastName', value)}
							mode='outlined'
							label='Last Name'
							keyboardType='default'
						/>
					</View>
				)
			case 2:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 2: Contact Info And Date</CustomizedText>
						<TextInput
							value={formData.contactInfo}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('contactInfo', value)}
							mode='outlined'
							label='Phone Number'
							keyboardType='numeric'
						/>
					</View>
				)
			case 3:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 3: Profession</CustomizedText>
						<TextInput
							value={formData.occupation}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('occupation', value)}
							mode='outlined'
							label='Occupation'
							keyboardType='default'
						/>
					</View>
				)
			case 4:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 4: Amounts Owed</CustomizedText>
						<TextInput
							value={formData.depositOwed.toString()}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('depositOwed', value)}
							mode='outlined'
							label='Deposit'
							keyboardType='numeric'
						/>

						<TextInput
							value={formData.rentOwed.toString()}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('rentOwed', value)}
							mode='outlined'
							label='Rent'
							keyboardType='numeric'
						/>
					</View>
				)

			case 5:
				return (
					<>
						<View>
							<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 5: Confirmation</CustomizedText>
							<ConfirmView keyHolder='Name' value={formData.tenantName} />
							<ConfirmView keyHolder='Phone No' value={formData.contactInfo} />
							<ConfirmView keyHolder='Profession' value={formData.occupation} />
							<ConfirmView keyHolder='Deposit Owed' value={formData.depositOwed} />
							<ConfirmView keyHolder='Rent Owed' value={formData.rentOwed} />
						</View>

					</>
				)
			default:
				return null
		}
	}

	return (
		<View style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>EditTenant</CustomizedText>
			{renderStep()}
			<ModalButtons maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} currentStep={currentStep} submitFormData={submitForm} />
		</View>
	)
}

export default EditTenant