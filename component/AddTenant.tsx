import { Alert, useColorScheme, View } from 'react-native'
import React, { useState } from 'react'
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
import { doc, setDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'

type addTenantProps = {
	houseId: number
	plotId: number
	houseRent: number
	setTenantId: (id: number) => void
	closeAddTenantModal: () => void
	onOpenSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const AddTenant = ({ houseId, plotId, houseRent, setTenantId, closeAddTenantModal, setSnackbarMsg, onOpenSnackBar }: addTenantProps) => {
	const db = useSQLiteContext()
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [pickerIsOpen, setPickerOpen] = useState<boolean>(false)
	const maxRenderSteps = 4
	const initialFormData: tenantFormProps = { id: 0, houseId: houseId, tenantName: '', firstName: '', lastName: '', contactInfo: '', moveInDate: new Date(), occupation: '', rentOwed: 0, depositOwed: 0 }
	const [formData, setFormData] = useState<typeof initialFormData>(initialFormData)
	const [monthsFromMoveInDate, setMonthsFromMoveInDate] = useState<string[]>([])

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

	const openDatePicker = () => {
		setPickerOpen(true)
	}

	const closeDatePicker = () => {
		setPickerOpen(false)
	}

	const addTenantToDB = async (formData: tenantFormProps, plotId: number) : Promise<number> => {
		// Get Occupied Houses
		const plotData: { numberOccupiedHouses: number } = await db.getFirstAsync('SELECT numberOccupiedHouses FROM plots WHERE id = ?', [plotId]) || { numberOccupiedHouses: 0 };

		await setDoc(doc(firestore, '/tenants', formData.tenantName), formData)
			.then(() => {
				console.log('New Tenant added tp firestore')
			})
			.catch((error) => {
				console.error(error)
			})
		const tenantInsertResult = await db.runAsync('INSERT INTO tenants(houseId, tenantName, contactInfo, moveInDate, occupation, rentOwed, depositOwed) VALUES(?, ?, ?, ?, ?, ?, ?)', [formData.houseId, formData.tenantName, formData.contactInfo, formData.moveInDate instanceof Date ? formData.moveInDate.toLocaleDateString().split('T')[0] : formData.moveInDate, formData.occupation, houseRent * (monthsFromMoveInDate.length), houseRent]);
		const updatePlotResult = await db.runAsync("UPDATE plots SET numberOccupiedHouses = ? WHERE id = ?", [plotData.numberOccupiedHouses + 1, plotId]);

		// (tenantInsertResult.changes === 1 && updatePlotResult.changes === 1) ? setTenantAdded(!tenantAdded) : console.error('Error adding tenant or updating plot.')
		return tenantInsertResult.lastInsertRowId
	}

	const handleSubmit = async (formData: tenantFormProps, plotId: number) => {
		try {
			await addTenantToDB(formData, plotId)
				.then((newTenantId) => {
					setTenantId(newTenantId)
					closeAddTenantModal()
					setSnackbarMsg(`${formData.firstName} ${formData.lastName} added successful.`)
					onOpenSnackBar()
				})
		} catch (error) {
			console.error('Error during submission:', error);
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
						{/* <Button onPress={openDatePicker}>Pick Date Moved In</Button> */}
						<TextInput
							value={(formData.moveInDate).toString() || ''}
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
						<ConfirmView keyHolder='Name' value={formData.tenantName} />
						<ConfirmView keyHolder='Phone No.' value={formData.contactInfo} />
						<ConfirmView keyHolder='Move In Date' value={formData.moveInDate.toString()} />
						<ConfirmView keyHolder='Occupation' value={formData.occupation} />
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
				<ModalButtons currentStep={currentStep} maxRenderSteps={maxRenderSteps} handleNext={handleNext} handleBack={handleBack} submitFormData={() => handleSubmit(formData, plotId)} />
			</View>
			{
				pickerIsOpen &&
				<RNDateTimePicker
					value={new Date}
					display='calendar'
					dateFormat='day month year'
					onChange={(event, selectedDate) =>{
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