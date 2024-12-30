import { Alert, Appearance, useColorScheme, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomizedText from './CustomizedText'
import { getMonths, paymentFormProps } from '@/assets/payment'
import { Snackbar, TextInput, useTheme } from 'react-native-paper'
import ModalButtons from './ModalButtons'
import DropDown from './DropDown'
import { useSQLiteContext } from 'expo-sqlite'
import { tenantProps } from "@/assets/tenants";
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
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const maxRenderSteps = 2
	const [currentStep, setCurrentStep] = useState<number>(1)
	const initialFormData = { id: '', tenantId: houseData.tenants[0].id, month: '', amount: 0, year: '', transactionDate: new Date() }
	const [formData, setFormData] = useState<typeof initialFormData>(initialFormData)
	const [paidHouses, setPaidHouses] = useState<number>(0)
	const [plotData, setPlotData] = useState<plotsProps>()

	console.log(houseData.house)
	console.log(houseData.tenants[0])

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
		// const result : {paidHouses: number} = await db.getFirstAsync('SELECT paidHouses FROM plots WHERE id = ?', [plotId]) || {} as {paidHouses: number}
		// const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseData.house.houseId}`)
		const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
		getDoc(plotRef).then((doc) => {
			if (doc.exists()) {
				const data = doc.data() as plotsProps
				console.log(data)
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

			if (houseData.tenants[0].depositOwed > 0) {
				if (remainingAmount >= houseData.tenants[0]?.depositOwed) {
					remainingAmount -= houseData.tenants[0].depositOwed;
					houseData.tenants[0].depositOwed = 0;
				} else {
					houseData.tenants[0].depositOwed -= remainingAmount;
					remainingAmount = 0;
				}
			}

			if (remainingAmount > 0) {
				houseData.tenants[0].rentOwed -= remainingAmount;
			}

			// await db.runAsync('INSERT INTO transactions (tenantId, month, amount, year, transactionDate) VALUES(?, ?, ?, ?, ?)', [formData.tenantId, formData.month, Number(formData.amount), formData.year, new Date().toString()]);
			await addDoc(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${houseData.house.houseId}/tenants/${houseData.tenants[0].id}/transactions`), {
				month: formData.month,
				amount: Number(formData.amount),
				year: formData.year,
				transactionDate: new Date().toISOString()
			}).then(() => {
				console.log('Transaction added successfully')
			}).catch((e) => {
				console.error(e)
			})

			// await db.runAsync('UPDATE tenants SET rentOwed = ?, depositOwed = ? WHERE id = ?', [houseData.tenants[0].rentOwed, houseData.tenants[0].depositOwed, houseData.tenants[0].id])
			const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseData.house.houseId}/tenants/${houseData.tenants[0].id}`)
			await setDoc(tenantRef, {
				...houseData.tenants[0],
				rentOwed: houseData.tenants[0].rentOwed,
				depositOwed: houseData.tenants[0].depositOwed
			}).then(() => {
				console.log('Tenant updated successfully')
			}).catch((e) => {
				console.error(e)
			})


			// houseData.tenants[0].rentOwed == 0 && await db.runAsync('UPDATE plots SET paidHouses = ?', [paidHouses + 1])
			const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
			setDoc(plotRef, {
				...plotData,
				paidHouses: paidHouses + 1
			}).then(() => {
				console.log('Plot updated successfully')
			}).catch((e) => {
				console.error(e)
			})

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