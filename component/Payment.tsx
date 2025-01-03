import React, { useEffect, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import CustomizedText from './CustomizedText'
import { getMonths, paymentFormProps } from '@/assets/payment'
import { TextInput, useTheme } from 'react-native-paper'
import ModalButtons from './ModalButtons'
import DropDown from './DropDown'
import { getModalStyle } from './CustomModal'
import ConfirmView from './ConfirmView'
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import { CombinedHouseTenantData } from '@/app/plotPage'
import { plotsProps } from '@/assets/plots'

interface PaymentProps {
	userId: string
	plotId: string
	houseData: CombinedHouseTenantData
	closeModal: () => void
	openSnackBar: () => void
	setSnackbarMsg: (msg: string) => void
}

const Payment = ({ userId, plotId, houseData, closeModal, openSnackBar, setSnackbarMsg }: PaymentProps) => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const maxRenderSteps = 2
	const [currentStep, setCurrentStep] = useState<number>(1)
	const initialFormData = { month: '', amount: 0, year: 0, transactionDate: new Date() }
	const [formData, setFormData] = useState({} as typeof initialFormData)
	const [paidHouses, setPaidHouses] = useState<number>(0)
	const [plotData, setPlotData] = useState<plotsProps>()

	const handleNext = () => {
		if (currentStep < 2) setCurrentStep(currentStep + 1);
	}

	const handleBack = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	}

	const handleInputChange = (field: keyof paymentFormProps, value: string | number) => {
		setFormData(prevState => {
			return { ...prevState, [field]: value }
		})
	}

	const fetchPaidHouses = async () => {
		const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
		getDoc(plotRef).then((doc) => {
			if (doc.exists()) {
				const data = doc.data() as plotsProps
				setPlotData(data)
				setPaidHouses(data.paidHouses)
			}
		})
	}

	useEffect(() => {
		fetchPaidHouses()
	}, [])

	const makePayment = async (houseData: CombinedHouseTenantData) => {
		try {
			let remainingAmount = Number(formData.amount)

			if (houseData.tenants[0].depositOwed as number > 0 ) {
				if (remainingAmount >= (houseData.tenants[0]?.depositOwed as number)) {
					remainingAmount -= houseData.tenants[0].depositOwed as number
					houseData.tenants[0].depositOwed = 0;
				} else {
					(houseData.tenants[0].depositOwed as number) -= remainingAmount;
					remainingAmount = 0;
				}
			}

			if (remainingAmount > 0) {
				(houseData.tenants[0].rentOwed as number) -= remainingAmount;
			}

			await addDoc(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${houseData.house.houseId}/tenants/${houseData.tenants[0].id}/transactions`), {
				month: houseData.tenants[0].depositOwed == 0 ? formData.month : "Deposit",
				amount: Number(formData.amount),
				year: formData.year,
				transactionDate: new Date().toISOString()
			}).catch((e) => {
				setSnackbarMsg('Error Adding Transaction: ' + e)
				openSnackBar()
			})

			const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseData.house.houseId}/tenants/${houseData.tenants[0].id}`)
			await setDoc(tenantRef, {
				...houseData.tenants[0],
				rentOwed: houseData.tenants[0].rentOwed,
				depositOwed: houseData.tenants[0].depositOwed
			}).catch((e) => {
				setSnackbarMsg('Error Updating Tenant: ' + e)
				openSnackBar()
			})


			if (houseData.tenants[0].rentOwed == 0) {
				const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
				setDoc(plotRef, {
					...plotData,
					paidHouses: paidHouses + 1
				}).catch((e) => {
					setSnackbarMsg('Error Updating Plot: ' + e)
					openSnackBar()
				})
			}

			closeModal()
			setSnackbarMsg(`Payment of ${formData.amount} made successfully.`)
			openSnackBar()
		} catch (e) {
			console.error(e)
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<View>
						{houseData.tenants[0].depositOwed != 0 && <CustomizedText>Deposit Remaining: {houseData.tenants[0].depositOwed}</CustomizedText>}
						{houseData.tenants[0].rentOwed != 0 && <CustomizedText>Rent Remaining: {houseData.tenants[0].rentOwed}</CustomizedText>}

						<TextInput
							mode='outlined'
							label='Amount Paid'
							style={getModalStyle(colorScheme, theme).textInput}
							onChangeText={(value) => handleInputChange('amount', value)}
							keyboardType='numeric'
						/>

						{
							houseData.tenants[0].depositOwed == 0 &&
							<DropDown
								data={getMonths()}
								onSelect={(value) => handleInputChange('month', value.toString())}
								placeholder='Select Month Of Payment'
							/>
						}

						<TextInput
							label='Enter Year'
							mode='outlined'
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

						<ConfirmView keyHolder='Amount' value={formData.amount} />
						{formData.month == '' || <ConfirmView keyHolder='Month' value={formData.month} />}
						<ConfirmView keyHolder='Year' value={formData.year} />
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
			<ModalButtons currentStep={currentStep} handleNext={handleNext} handleBack={handleBack} submitFormData={() => makePayment(houseData)} maxRenderSteps={maxRenderSteps} />
		</View>
	)
}

export default Payment