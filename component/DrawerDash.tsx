import { Alert, Appearance, Linking, StatusBar, View, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Checkbox, Drawer, Icon, Switch, useTheme } from 'react-native-paper'
import CustomizedText from './CustomizedText'
import { Divider } from 'react-native-paper'
import { signOut } from 'firebase/auth' 
import { firebaseAuth } from '@/firebaseConfig'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface DrawerDashProps {
	changeDrawerPosition: () => void
	toggleDrawer: () => void
}

function DrawerDash ({changeDrawerPosition, toggleDrawer} : DrawerDashProps) {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const [isSwitchOn, setIsSwitchOn] = useState(colorScheme == 'dark' ? true : false)

	const [switchStatus, setSwitchStatus] = useState<'unchecked' | 'checked' | 'indeterminate'>('unchecked')

	const onToggleSwitch = () => {
		Appearance.setColorScheme(isSwitchOn ? 'light' : 'dark')
		setIsSwitchOn(!isSwitchOn)
	}

	const logOut = () => {
		toggleDrawer()
		signOut(firebaseAuth)
			.then( async () => {
				await AsyncStorage.removeItem('userId')
				router.dismissAll()
			})
			.catch(error => {
				console.error('Failed to log out: ' + error)
			})
	}

	return (
		<SafeAreaView style={{ marginTop: StatusBar.currentHeight, justifyContent: 'space-between', flex: 1 }}>
			<View>
				<CustomizedText textStyling={{fontFamily: 'DefaultCustomFont-Bold', marginLeft: 20, marginBottom: 10, fontSize: theme.fonts.headlineSmall.fontSize, color: theme.colors.tertiary}}>Settings</CustomizedText>
				<Divider/>
				<CustomizedText textStyling={{fontFamily: 'DefaultCustomFont', marginLeft: 15, marginTop: 10, fontSize: theme.fonts.bodySmall.fontSize, color: theme.colors.onSurfaceDisabled}}>Preferences</CustomizedText>
				<Drawer.Item
					icon={isSwitchOn ? 'moon-waxing-crescent' : 'weather-sunny'}
					label='Dark Mode'
					right={() => (
						<Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
					)}
					theme={theme}
				/>
				<Drawer.Item
					icon='arrow-right-bold-box'
					label='Right Drawer'
					right={() => 
						<Checkbox status={switchStatus} onPress={() => {setSwitchStatus(switchStatus == 'checked' ? 'unchecked' : 'checked'); changeDrawerPosition()}} />
					}
				/>
				<Drawer.Item
					icon='logout'
					label='Log Out'
					onPress={logOut}
				/>
			</View>
			<View style={{margin: 20, alignItems: 'center'}}>
				<CustomizedText textStyling={{fontSize: theme.fonts.bodySmall.fontSize, color: theme.colors.onSurface}}>Delevoped By</CustomizedText>
				<CustomizedText textStyling={{fontSize: theme.fonts.bodyLarge.fontSize, color: theme.colors.onSurface, fontFamily: 'DefaultCustomFont-ExtraBold', marginVertical: 10}}>ALVIN MUGO</CustomizedText>
				<View style={{flexDirection: 'row', alignItems: 'center',gap: 10}}>
					<Icon source='phone' size={15} />
					<CustomizedText textStyling={{fontSize: theme.fonts.bodyLarge.fontSize, color: theme.colors.onSurface, fontFamily: 'DefaultCustomFont'}} onPress={() => Linking.openURL(`tel: 0790136170`)}>0790136170</CustomizedText>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default DrawerDash