import React from 'react'
import { Tabs } from 'expo-router'
import { Icon, useTheme } from 'react-native-paper'
import { useColorScheme } from 'react-native'

const TabLayout = () => {
	const theme = useTheme()
	const colorScheme = useColorScheme()

	return (
		<Tabs screenOptions={{
			headerShown: false,
		}}
		// sceneContainerStyle={{backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.onSecondaryContainer}}
		initialRouteName='index'
		>
			<Tabs.Screen name='index' options={{
				title: 'Home',
				tabBarStyle: {backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.onSecondaryContainer},
				tabBarLabelStyle: {fontSize: theme.fonts.bodyMedium.fontSize, fontFamily: 'DefaultCustomFont'},
				tabBarIcon: () => <Icon source='home' size={25} />
			}}/>
			<Tabs.Screen name='settings' options={{
				title: 'Settings',
				tabBarStyle: {backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.onSecondaryContainer},
				tabBarLabelStyle: {fontSize: theme.fonts.bodyMedium.fontSize, fontFamily: 'DefaultCustomFont'},
				tabBarIcon: () => <Icon source='cog' size={25} />
			}} />
		</Tabs>
	)
}

export default TabLayout