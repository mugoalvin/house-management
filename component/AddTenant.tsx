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
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import houses from '@/app/houses'

type addTenantProps = {
	houseId: string
	plotId: string
	houseRent: number
	// setTenantId: (id: number) => void
	closeAddTenantModal: () => void
	onOpenSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const AddTenant = ({ houseId, plotId, houseRent, closeAddTenantModal, setSnackbarMsg, onOpenSnackBar }: addTenantProps) => {
	const db = useSQLiteContext()
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [pickerIsOpen, setPickerOpen] = useState<boolean>(false)
	const maxRenderSteps = 4
	// const initialFormData: Partial<tenantFormProps> = { firstName: '', lastName: '', contactInfo: '', moveInDate: new Date(), occupation: '', rentOwed: 0, depositOwed: 0 }
	const initialFormData: Partial<tenantFormProps> = { firstName: '', lastName: '', contactInfo: '', moveInDate: '', occupation: '', rentOwed: 0, depositOwed: 0 }
	const [formData, setFormData] = useState<Partial<tenantFormProps>>(initialFormData)
	const [monthsFromMoveInDate, setMonthsFromMoveInDate] = useState<string[]>([])

	const [ userId, setUserId ] = useState<string>()


	const handleInputChange = (field: keyof tenantFormProps, value: string | number | Date) => {
		// setFormData(prevState => {
		// 	const updatedForm = { ...prevState, [field]: value }
		// 	if (field === 'firstName' || field === 'lastName') {
		// 		updatedForm.tenantName = `${updatedForm.firstName.trim()} ${updatedForm.lastName.trim()}`
		// 	}
		// 	return updatedForm
		// })
		setFormData(prevState => ({ ...prevState, [field]: value }))
	}

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
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
		// Get Occupied Houses
		// const plotData: { numberOccupiedHouses: number } = await db.getFirstAsync('SELECT numberOccupiedHouses FROM plots WHERE id = ?', [plotId]) || { numberOccupiedHouses: 0 };
		let numberOccupiedHouses = 0
		if (userId)
		await getDoc(doc(firestore, `/users/${userId}/plots/${plotId}`))
			.then((doc) => {
				const plotData = doc.data()
				console.log(plotData)
				numberOccupiedHouses = plotData?.numberOccupiedHouses || 0
			})


		await setDoc(doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants`), formData)
			.then(() => {
				closeAddTenantModal()
				setSnackbarMsg(`${formData.firstName} ${formData.lastName} added successful.`)
				onOpenSnackBar()
			})
			.catch((error) => {
				console.error(error)
			})

		await setDoc(doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}`), {
			numberOccupiedHouses: numberOccupiedHouses + 1
		})
		.then(() => {
			setSnackbarMsg('Number of occupied houses updated.')
			onOpenSnackBar()
		})
		.catch((error) => {
			console.error(error)
		})


		// (tenantInsertResult.changes === 1 && updatePlotResult.changes === 1) ? setTenantAdded(!tenantAdded) : console.error('Error adding tenant or updating plot.')


	}

	const handleSubmit = async (formData: Partial<tenantFormProps>, userId: string) => {
		await addTenantToDB(formData as tenantFormProps, userId)
	}

	useEffect(() => {
		getUserId()
	} , [])

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
				<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} submitFormData={() => handleSubmit(formData as tenantFormProps, userId as string)} />
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
						// setMonthsFromMoveInDate(getMonthsBetween(formData.moveInDate))

						// @ts-ignore
						setMonthsFromMoveInDate(getMonthsBetween(selectedDate?.toString()))
					}}
				/>


				// <DateTimePicker
				// 	mode='single'
				// 	date={new Date()}
				// 	onChange={(params) => {
				// 		closeDatePicker()
				// 		handleInputChange('moveInDate', params.date?.toString() || "")
				// 		setMonthsFromMoveInDate(getMonthsBetween(formData.moveInDate))
				// 		ToastAndroid.show(`Date Captured - ${params.date}`, ToastAndroid.SHORT)
				// 	}}

				// 	yearContainerStyle={{ backgroundColor: 'black' }}
				// 	calendarTextStyle={{ color: 'white' }}
				// 	headerTextStyle={{ color: 'white' }}
				// 	headerButtonColor='white'

				// 	dayContainerStyle={{ borderRadius: 10 }}
				// 	weekDaysTextStyle={{ color: 'white' }}


				// 	// timePickerContainerStyle={{backgroundColor: 'red'}}
				// 	timePickerTextStyle={{ color: 'gray' }}
				// 	selectedRangeBackgroundColor='purple'
				// />
			}
		</>
	)
}

export default AddTenant