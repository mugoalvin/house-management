import { Alert, Appearance, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { getMonths, paymentFormProps } from '@/assets/payment'
import { Snackbar, TextInput, useTheme } from 'react-native-paper'
import ModalButtons from './ModalButtons'
import DropDown from './DropDown'
import { useSQLiteContext } from 'expo-sqlite'
import {tenantProps} from "@/assets/tenants";
import { getModalStyle } from './CustomModal'
import ConfirmView from './ConfirmView'

interface PaymentProps {
	tenantInfo: tenantProps
	plotId: number
	closeModal: () => void
	openSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const Payment = ({tenantInfo, plotId, closeModal, openSnackBar, setSnackbarMsg}: PaymentProps) => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const maxRenderSteps = 2
	const [ currentStep, setCurrentStep ] = useState<number>(1)
	const initialFormData = {id: 0 , tenantId: tenantInfo.id , month: '' , amount: 0 , year: new Date().getFullYear() , transactionDate: new Date()}
	const [ formData, setFormData ] = useState<typeof initialFormData>(initialFormData)
	const [ paidHouses, setPaidHouses ] = useState<number>(0)

	const handleNext = () => {
		if (currentStep < 2) setCurrentStep(currentStep + 1);
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}
	
	const handleInputChange = (field: keyof paymentFormProps, value: string | number) => {
		setFormData(prevState => {
			return  { ...prevState, [field]: value }
		})
	}

	const fetchPaidHouses = async () => {
		const result : {paidHouses: number} = await db.getFirstAsync('SELECT paidHouses FROM plots WHERE id = ?', [plotId]) || {} as {paidHouses: number}
		setPaidHouses(result.paidHouses)
	}

	useEffect(() => {
		fetchPaidHouses()
	}, [])

	const makePayment = async () => {
		try {
			let remainingAmount = Number(formData.amount)

			if (tenantInfo.depositOwed > 0) {
				if (remainingAmount >= tenantInfo.depositOwed) {
					remainingAmount -= tenantInfo.depositOwed;
					tenantInfo.depositOwed = 0;
				} else {
					tenantInfo.depositOwed -= remainingAmount;
					remainingAmount = 0;
				}
			}

			if (remainingAmount > 0) {
				tenantInfo.rentOwed -= remainingAmount;
			}

			await db.runAsync('INSERT INTO transactions (tenantId, month, amount, year, transactionDate) VALUES(?, ?, ?, ?, ?)', [formData.tenantId, formData.month, Number(formData.amount), formData.year, new Date().toString()]);
			await db.runAsync('UPDATE tenants SET rentOwed = ?, depositOwed = ? WHERE id = ?', [tenantInfo.rentOwed, tenantInfo.depositOwed, tenantInfo.id])
			tenantInfo.rentOwed == 0 && await db.runAsync('UPDATE plots SET paidHouses = ?', [paidHouses + 1])
			closeModal()
			setSnackbarMsg(`Payment of ${formData.amount} made successfully.`)
			openSnackBar()
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {

	}, [])


	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						{ tenantInfo.depositOwed != 0 && <CustomizedText>Deposit Remaining: {tenantInfo.depositOwed}</CustomizedText> }
						{ tenantInfo.rentOwed != 0 && <CustomizedText>Rent Remaining: {tenantInfo.rentOwed}</CustomizedText> }

						<TextInput
							mode='outlined'
							label='Amount Paid'
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('amount', value)}
							keyboardType='numeric'
						/>

						{
							tenantInfo.depositOwed == 0 &&
								<DropDown
									data={getMonths()}
									onSelect={(value) => handleInputChange('month', value.toString())}
									placeholder='Select Month Of Payment'
								/>
						}

						<TextInput
							label='Enter Year'
							mode='outlined'
							value={new Date().getFullYear().toString()}
							onChangeText={(year) => handleInputChange('year', Number(year))}
							style={getModalStyle(colorScheme, theme).textInput}
							keyboardType='numeric'
						/>						
					</View>
				)
			case 2:
				return (
					<View>
						<CustomizedText textStyling={getModalStyle(colorScheme, theme).step}>Payment Confirmation</CustomizedText>

						<ConfirmView keyHolder='Amount' value={formData.amount}/>
						{ formData.month == '' || <ConfirmView keyHolder='Month' value={formData.month}/> }
						<ConfirmView keyHolder='Year' value={formData.year}/>
					</View>
				)
			default:
				return null
		}
	}

	return (
		<View style={getModalStyle(colorScheme, theme).main}>
			<CustomizedText textStyling={getModalStyle(colorScheme, theme).title}>Make Payment</CustomizedText>
			{renderStep()}
			<ModalButtons currentStep={currentStep} handleNext={handleNext} handleBack={handleBack} submitFormData={makePayment} maxRenderSteps={maxRenderSteps}/>
		</View>
	)
}

export default Payment