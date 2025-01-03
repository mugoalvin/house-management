import React, { useRef, useState } from "react";
import { PaperProvider, Text, ActivityIndicator, MD3LightTheme, MD3DarkTheme, Icon } from "react-native-paper";
import { Stack } from "expo-router";
// import { SQLiteProvider } from "expo-sqlite/next";
import { SQLiteProvider } from "expo-sqlite"
import { DrawerLayoutAndroid, Pressable, useColorScheme, View } from "react-native";
import { Colors } from "@/constants/Colors";
import DrawerDash from "@/component/DrawerDash"
import { useFonts } from "expo-font";
import Fallback from "./fallback";
import Dashboard from "./dashboard";


import { createDrawerNavigator } from '@react-navigation/drawer';
import Index from "./index";
import Plots from "./plots";
import Houses from "./houses";
import TenantPage from "./tenantPage";
import Register from "./register";
import Login from "./login";
import PlotPage from "./plotPage";
import HousePage from "./housePage";
import Tenants from "./tenants";

export default function RootLayout() {
	const drawer = useRef<DrawerLayoutAndroid>(null)
	const Drawer = createDrawerNavigator()
	const colorScheme = useColorScheme() || 'dark'


	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
	const [drawerPosition, setDrawerPosition] = useState<'left' | 'right'>('left')

	const [fontsLoaded] = useFonts({
		'DefaultCustomFont': require('../assets/fonts/Barlow-Regular.ttf'),
		'DefaultCustomFont-Bold': require('../assets/fonts/Barlow-Bold.ttf'),
		'DefaultCustomFont-ExtraBold': require('../assets/fonts/Barlow-ExtraBold.ttf')
	})

	const changeDrawerPosition = () => {
		if (drawerPosition === 'left') {
			setDrawerPosition('right');
		} else {
			setDrawerPosition('left');
		}
	}

	const toggleDrawer = () => {
		setIsDrawerOpen(isDrawerOpen => {
			if (isDrawerOpen) {
				drawer.current?.closeDrawer()
			} else {
				drawer.current?.openDrawer()
			}
			return !isDrawerOpen
		})
	}

	const theme = {
		...(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme),
		...(colorScheme == 'dark' ? Colors.dark : Colors.light)

		// custom: {
		// 	...(colorScheme == 'dark' ? Colors.dark : Colors.light)
		// }
	}

	const screenOptions = {
		headerShown: true,
		headerStyle: {
			backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.onSecondaryContainer
		},
		headerTitleStyle: {
			fontSize: theme.fonts.titleLarge.fontSize,
			fontFamily: 'DefaultCustomFont-Bold',
		},
		headerTitleAlign: 'center' as const,
		headerTintColor: colorScheme == 'dark' ? theme.colors.onSurface : theme.colors.secondaryContainer,
		// headerTintColor: theme.colors.secondaryContainer,

		gestureEnabled: true,
		// animation: "slide_from_right" as const,
		animation: "ios_from_right" as const,
		headerShadowVisible: true,

		// iOS
		headerBackTitle: 'Back',
		headerBackTitleStyle: {
			fontFamily: 'DefaultCustomFont-Bold',
		}
	}

	if (fontsLoaded)
		return (
			<React.Suspense fallback={<Fallback />}>
				<SQLiteProvider databaseName={"rentals.db"} useSuspense>
					<PaperProvider theme={theme} key={1}>
						<DrawerLayoutAndroid
							ref={drawer}
							drawerWidth={300}
							drawerPosition={drawerPosition}

							renderNavigationView={() => <DrawerDash changeDrawerPosition={changeDrawerPosition} toggleDrawer={toggleDrawer} />}

							onDrawerClose={() => setIsDrawerOpen(false)}
							// drawerBackgroundColor={colorScheme == 'dark' ? theme.colors.surface : theme.colors.secondaryContainer}>
							drawerBackgroundColor={colorScheme == 'dark' ? theme.colors.surface : '#e6e6e6'}>

							<Stack screenOptions={screenOptions}>
								<Stack.Screen name="index" options={{
									headerShown: false,
									headerLeft: () => (
										<Pressable style={{ height: '100%', marginRight: 30 }} onPress={toggleDrawer}>
											<Icon source='menu' size={25} color={colorScheme == 'dark' ? theme.colors.onSurface : theme.colors.secondaryContainer} />
										</Pressable>
									)
								}} />
								<Stack.Screen name="dashboard" options={{
									headerLeft: () => (
										<Pressable style={{ height: '100%', marginRight: 30 }} onPress={toggleDrawer}>
											<Icon source='menu' size={25} color={colorScheme == 'dark' ? theme.colors.onSurface : theme.colors.secondaryContainer} />
										</Pressable>
									)
								}} />
								<Stack.Screen name="plots" />
								<Stack.Screen name="houses" />
								<Stack.Screen name="tenantPage" />
								<Stack.Screen name="register" />
								<Stack.Screen name="login"/>
								<Stack.Screen name="(tabs)" />
							</Stack>
						</DrawerLayoutAndroid>
					</PaperProvider>
				</SQLiteProvider>
			</React.Suspense>


			// <React.Suspense fallback={<Fallback />}>
			// 	<SQLiteProvider databaseName={"rentals.db"} useSuspense>

			// 		<PaperProvider theme={theme} key={1}>
			// 			{/* <Drawer.Navigator drawerContent={props => <DrawerDash changeDrawerPosition={changeDrawerPosition} toggleDrawer={toggleDrawer} />}> */}
			// 			<Drawer.Navigator backBehavior="history" initialRouteName="index">
			// 				<Drawer.Screen name="index" component={Index} options={{ headerShown: false }} />
			// 				<Drawer.Screen name="login" component={Login} />
			// 				<Drawer.Screen name="register" component={Register} />
			// 				<Drawer.Screen name="dashboard" component={Dashboard} />
			// 				<Drawer.Screen name="plots" component={Plots} />
			// 				<Drawer.Screen name="plotPage" component={PlotPage} />
			// 				<Drawer.Screen name="housePage" component={HousePage} />
			// 				<Drawer.Screen name="houses" component={Houses} />
			// 				<Drawer.Screen name="tenant" component={Tenants} />
			// 				<Drawer.Screen name="tenantPage" component={TenantPage} />
			// 			</Drawer.Navigator>
			// 		</PaperProvider>
			// 	</SQLiteProvider>
			// </React.Suspense>
		)
}