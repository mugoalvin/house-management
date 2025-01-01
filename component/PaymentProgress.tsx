import { StyleSheet, useColorScheme, View} from "react-native";
import CustomizedText from "@/component/CustomizedText";
import { MD3Theme, useTheme } from "react-native-paper";

interface PaymentProgressProps {
	currentAmount: number;
	finalPrice: number
}

const PaymentProgress = ({currentAmount, finalPrice}: PaymentProgressProps) => {
	const colorScheme = useColorScheme() || 'dark';
	const theme = useTheme()

	return (
		<View style={getPaymentProgressStyles(colorScheme, theme).progressBarContainer}>
			<CustomizedText textStyling={getPaymentProgressStyles(colorScheme, theme).startLabel}>0</CustomizedText>
			<View style={getPaymentProgressStyles(colorScheme, theme).progressBar}>
				<View style={{ ...getPaymentProgressStyles(colorScheme, theme).progress, width: `${(currentAmount / finalPrice) * 100}%`}}>
					{ (currentAmount != 0 || currentAmount != finalPrice && Number.isNaN(currentAmount)) &&
					<CustomizedText textStyling={getPaymentProgressStyles(colorScheme, theme).currentPayment}>{currentAmount}</CustomizedText>}
				</View>
			</View>
			<CustomizedText textStyling={getPaymentProgressStyles(colorScheme, theme).finalLabel}>{finalPrice}</CustomizedText>
		</View>
	)
}

export default PaymentProgress


const getPaymentProgressStyles = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	progressBarContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		paddingVertical: 20,
		position: 'relative',
	},
	progressBar: {
		flex: 1,
		height: 10,
		// backgroundColor: theme.colors.secondary,
		backgroundColor: theme.colors.surface,
		borderRadius: 5,
		// marginHorizontal: 10,
	},
	progress: {
		height: '100%',
		backgroundColor: '#4caf50',
		// backgroundColor: theme.colors.onTertiary,
		borderRadius: 5,
		position: 'relative'
	},
	currentPayment: {
		position: 'absolute',
		bottom: -20,
		right: 0,
	},
	startLabel: {
		position: 'absolute',
		bottom: 0,
		left: 0
	},
	finalLabel: {
		position: 'absolute',
		bottom: 0,
		right: 0

	}
})