import { View, Text } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function Fallback() {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<ActivityIndicator size={"large"} />
			<Text style={{ fontSize: 25, fontWeight: "bold", color: "#555" }}>Configuring New Months Payments</Text>
		</View>
	)
}