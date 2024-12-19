import { useColorScheme } from 'react-native'
import React from 'react'
import { BarChart } from 'react-native-gifted-charts'
import { useTheme } from 'react-native-paper'

const barChartData = [
	{ value: 20, spacing: 6, label: 'Jan' },
	{ value: 0 },

	{ value: 18, spacing: 6, label: 'Feb' },
	{ value: 2 },

	{ value: 19, spacing: 6, label: 'Mar' },
	{ value: 0 },

	{ value: 15, spacing: 6, label: 'Apr' },
	{ value: 5 },
	
	{ value: 18, spacing: 6, label: 'May' },
	{ value: 2 },

	{ value: 14, spacing: 6, label: 'Jun' },
	{ value: 6 },

	{ value: 10, spacing: 6, label: 'July' },
	{ value: 10 },

	{ value: 13, spacing: 6, label: 'Aug' },
	{ value: 7 },

	{ value: 15, spacing: 6, label: 'Sept' },
	{ value: 5 },

	{ value: 18, spacing: 6, label: 'Oct' },
	{ value: 2 },

	{ value: 18, spacing: 6, label: 'Nov' },
	{ value: 2 },

	{ value: 20, spacing: 6, label: 'Dec' },
	{ value: 0 },
]

const Bar = () => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()

	return (
		<BarChart
			data={barChartData}
			initialSpacing={5}
			maxValue={20}
			frontColor={theme.colors.primary}
			gradientColor={theme.colors.elevation.level1}
			minHeight={1}
			noOfSections={5}
			// spacing={30}
			isAnimated={true}
			animationDuration={1000}
			endSpacing={10}
			barWidth={10}
			dashWidth={0}

			// showReferenceLine1={true}
			referenceLine1Position={15}
			referenceLine1Config={{
				color: theme.colors.tertiary,
				dashWidth: 5,
				labelText: 'Reference Line Label',
				labelTextStyle: {
					color: theme.colors.tertiary,
					bottom: 10,
					left: 200
				}
			}}


			showScrollIndicator={true}
			activeOpacity={0}
			intactTopLabel={true}
			roundedTop={true}
			// barBorderTopLeftRadius={5}
			// barBorderTopRightRadius={5}
			labelWidth={30}

			xAxisLabelTextStyle={{
				color: theme.colors.secondary,
				fontFamily: 'DefaultCustomFont'
			}}
			yAxisTextStyle={{
				color: theme.colors.secondary,
				fontFamily: 'DefaultCustomFont'
			}}
			scrollAnimation={true}
		/>
	)
}

export default Bar