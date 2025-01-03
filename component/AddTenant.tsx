import { Alert, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { TextInput, useTheme } from 'react-native-paper'
import { tenantFormProps } from '@/assets/tenants'
import { useSQLiteContext } from 'expo-sqlite'
import RNDateTimePicker from '@react-native-community/datetimepicker'

import ModalButtons from './ModalButtons'
import { getMonthsBetween } from '@/assets/values'
import { getModalStyle } from './CustomModal'
import ConfirmView from './ConfirmView'
import { plotsProps } from '@/assets/plots'
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'

type addTenantProps = {
	houseId: string
	plotId: string
	houseRent: number
	closeAddTenantModal: () => void
	setSnackbarMsg: (msg: string) => void
	openSnackBar: () => void
	tenantAdded: (state: boolean) => void
}

const AddTenant = ({ houseId, plotId, houseRent, closeAddTenantModal, setSnackbarMsg, openSnackBar, tenantAdded }: addTenantProps) => {
	const db = useSQLiteContext()
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [pickerIsOpen, setPickerOpen] = useState<boolean>(false)
	const maxRenderSteps = 4
	// const initialFormData: Partial<tenantFormProps> = { firstName: '', lastName: '', contactInfo: '', moveInDate: new Date(), occupation: '', rentOwed: 0, depositOwed: 0 }
	const initialFormData: Partial<tenantFormProps> = { firstName: '', lastName: '', contactInfo: '', moveInDate: '', occupation: '', rentOwed: 0, depositOwed: 0}
	const [formData, setFormData] = useState<Partial<tenantFormProps>>(initialFormData)
	const [monthsFromMoveInDate, setMonthsFromMoveInDate] = useState<string[]>([])

	const [userId, setUserId] = useState<string>()

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
	}

	const handleInputChange = (field: keyof tenantFormProps, value: string | number | Date) => {
		setFormData(prevState => ({ ...prevState, [field]: value }))
	}

	const handleNext = () => {
		if (currentStep < maxRenderSteps) setCurrentStep(currentStep + 1)
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1)
	}

	const openDatePicker = () => {
		setPickerOpen(true)
	}

	const closeDatePicker = () => {
		setPickerOpen(false)
	}

	const addTenantToDB = async (formData: tenantFormProps, userId: string) => {
		let numberOccupiedHouses = 0

		if (userId) {
			await addDoc(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants`), formData)
				.then(() => {
					closeAddTenantModal()
					setSnackbarMsg(`${formData.firstName} ${formData.lastName} added successful.`)
					openSnackBar()
				})
				.catch((error) => {
					console.error('Error adding tenant:\n' + error)
					setSnackbarMsg('Error adding tenant:\n' + error)
					openSnackBar()
				})
			let plotData = {} as plotsProps
			await getDoc(doc(firestore, `/users/${userId}/plots/${plotId}`))
				.then((doc) => {
					const plotDataDB = doc.data()
					plotData = plotDataDB as plotsProps
					numberOccupiedHouses = plotData?.numberOccupiedHouses || 0
				}).
				catch((error) => {
					console.error(error)
				})

			await setDoc(doc(firestore, `/users/${userId}/plots/${plotId}`), {
				...plotData,
				numberOccupiedHouses: numberOccupiedHouses + 1
			})
				.then(() => {
					console.log('Number of occupied houses updated.')
					setSnackbarMsg('Number of occupied houses updated.')
					openSnackBar()
					tenantAdded(true)
				})
				.catch((error) => {
					console.error(error)
				})
		}
	}

	useEffect(() => {
		getUserId()
	}, [])

	useEffect(() => {
		setFormData(prevState => ({
			...prevState,
			rentOwed: monthsFromMoveInDate.length * houseRent,
			depositOwed: houseRent
		}))
	}, [monthsFromMoveInDate])

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 1: Get Name</CustomizedText>
						<TextInput
							value={formData.firstName}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('firstName', value.trim())}
							mode='outlined'
							label='First Name'
							keyboardType='default'
						/>
						<TextInput
							value={formData.lastName}
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('lastName', value.trim())}
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
							onChangeText={(value) => handleInputChange('contactInfo', value.trim())}
							mode='outlined'
							label='Phone Number'
							keyboardType='numeric'
						/>
						{/* <Button onPress={openDatePicker}>Pick Date Moved In</Button> */}
						<TextInput
							value={(formData.moveInDate as Date).toString()}
							onFocus={openDatePicker}
							onBlur={closeDatePicker}
							style={getModalStyle(colorScheme, theme).textInput}
							label='Pick Move In Date'
							mode='outlined'
							showSoftInputOnFocus={false}
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
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Step 4: Confirmation</CustomizedText>
						<ConfirmView keyHolder='Name' value={`${formData.firstName} ${formData.lastName}`} />
						<ConfirmView keyHolder='Phone No.' value={formData.contactInfo || ''} />
						<ConfirmView keyHolder='Move In Date' value={formData.moveInDate ? formData.moveInDate.toString() : 'N/A'} />
						<ConfirmView keyHolder='Occupation' value={formData.occupation || ''} />
					</View>
				)
			default:
				return null
		}
	}

	return (
		<>
			<View style={getModalStyle(colorScheme, theme).main}>
				<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>New Tenant</CustomizedText>
				{renderStep()}
				<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} submitFormData={() => addTenantToDB(formData as tenantFormProps, userId as string)} />
			</View>
			{
				pickerIsOpen &&
				<RNDateTimePicker
					value={new Date}
					display='calendar'
					dateFormat='day month year'
					onChange={(event, selectedDate) => {
						closeDatePicker()
						handleInputChange('moveInDate', selectedDate?.toString() || "")
						setMonthsFromMoveInDate(getMonthsBetween(selectedDate?.toString() || ""))
					}}
				/>
			}
		</>
	)
}

export default AddTenant