import { SafeAreaView, useColorScheme, View } from 'react-native'
import React from 'react'
import CustomizedText from '@/component/CustomizedText'
import { useTheme } from 'react-native-paper'
import { getDashboardStyle } from '../dashboard'

const index = () => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'

	
	return (
		<SafeAreaView style={{flex: 1, backgroundColor: theme.colors.surface}}>
			<View style={[getDashboardStyle(colorScheme, theme).view, {alignItems: 'center', justifyContent: 'center'}]}>
				<CustomizedText textStyling={{color: theme.colors.onSurface}}>Settings</CustomizedText>
			</View>
		</SafeAreaView>
	)
}

export default index