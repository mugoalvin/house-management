import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from 'react-native-paper'

interface ModalButtonProps {
	currentStep?: number
	maxRenderSteps?: number
	handleBack?: () => void
	handleNext?: () => void
	submitFormData?: () => void
}

const ModalButtons = ({currentStep, maxRenderSteps, handleBack, handleNext, submitFormData }: ModalButtonProps) => {
	return (
		<View style={ModalButtonStyle.buttonView}>
			{(currentStep ?? 0) > 1 && <Button mode='elevated' onPress={handleBack} style={ModalButtonStyle.btn}>Back</Button>}
			{
				(currentStep ?? 0) < (maxRenderSteps ?? 0) ? (
					<Button mode='elevated' onPress={handleNext} style={ModalButtonStyle.btn}>Next</Button>
				) : (
					<Button mode='elevated' onPress={submitFormData} style={ModalButtonStyle.btn}>Submit</Button>
				)
			}
		</View>
	)
}

export default ModalButtons

const ModalButtonStyle = StyleSheet.create({
	buttonView: {
		flexDirection: 'row',
		marginTop: 20,
		justifyContent: 'space-between',
		gap: 20,
	},
	btn: {
		flex: 1,
		borderRadius: 5
	}
})