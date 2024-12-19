import { Appearance, StyleSheet, useColorScheme } from 'react-native'
import React from 'react'
import { PieChartPro } from 'react-native-gifted-charts'
import CustomizedText from './CustomizedText'
import { useTheme } from 'react-native-paper'


interface pieProps {
	textToShow?: string
	data: {value: number}[]
}

const Pie = ({textToShow, data}: pieProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()

	return (
		// <PieChart
		// 	donut
		// 	data={pieData}
		// 	radius={80}
		// 	innerRadius={70}
		// 	innerCircleColor={colorScheme == 'light' ? Colors.light.card : Colors.dark.card}
		// 	strokeWidth={5}
		// 	strokeColor={colorScheme == 'light' ? Colors.light.card : Colors.dark.card}
		// 	semiCircle={true}
		//
		// 	showValuesAsLabels={true}
		// 	centerLabelComponent={() => (<CustomizedText>70%</CustomizedText>)}
		// 	showGradient={true}
		// 	gradientCenterColor={colorScheme == 'light' ? Colors.light.card : Colors.dark.card}
		// 	curvedStartEdges={true}
		// 	curvedEndEdges={true}
		// 	edgesRadius={10}
		// 	isAnimated={true}
		// 	animationDuration={1000}
		// />

		<PieChartPro
			donut
			radius={60}
			innerRadius={55}
			// innerCircleColor={colorScheme == 'light' ? Colors.light.card : Colors.dark.card}
			innerCircleColor={theme.colors.elevation.level1}
			data={data}
			centerLabelComponent={() => (
				<CustomizedText textStyling={{ textAlign: 'center' }}>
					<CustomizedText textStyling={{ fontSize: 24 }} >{textToShow}</CustomizedText>
					{'\n'}
					months
				</CustomizedText>
			)}
		/>
	)
}

export default Pie

const styles = StyleSheet.create({})