import { StyleSheet, View } from 'react-native'
import React from 'react'
import { ActivityIndicator, Button } from 'react-native-paper'
import CustomizedText from './CustomizedText'

interface ModalButtonProps {
	currentStep?: number
	maxRenderSteps?: number
	handleBack?: () => void
	handleNext?: () => void
	submitFormData?: () => void
}

const ModalButtons = ({ currentStep, maxRenderSteps, handleBack, handleNext, submitFormData }: ModalButtonProps) => {
	const [loading, setLoading] = React.useState(false)

	return (
		<View style={ModalButtonStyle.buttonView}>
			{(currentStep ?? 0) > 1 && <Button mode='elevated' onPress={handleBack} style={ModalButtonStyle.btn}><CustomizedText>Back</CustomizedText></Button>}
			{
				(currentStep ?? 0) < (maxRenderSteps ?? 0) ? (
					<Button mode='elevated' onPress={handleNext} style={ModalButtonStyle.btn}><CustomizedText>Next</CustomizedText></Button>
				) : (
					<Button mode='elevated' onPress={() => { setLoading(true); submitFormData && submitFormData() }} style={ModalButtonStyle.btn}>{loading ? <ActivityIndicator /> : <CustomizedText>Submit</CustomizedText>}</Button>
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