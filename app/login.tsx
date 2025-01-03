import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, StatusBar } from 'react-native'
import { ActivityIndicator, MD3Theme, Snackbar, useTheme } from 'react-native-paper'
import { router, useNavigation } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomizedText from '@/component/CustomizedText'
import { getHousePageStyles } from './housePage'
import { firebaseAuth, firestore } from '@/firebaseConfig'
import { getDocs, collection, doc, updateDoc, getDoc } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'

const Login = () => {
	const auth = firebaseAuth
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'light'
	const styles = getAuthStyle(colorScheme, theme)
	const navigation = useNavigation()

	// const [email, setEmail] = useState<string>('niawai@gmail.com')
	// const [password, setPassword] = useState<string>('Asdfghjkl')

	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')

	const [loginButtonPressed, setLoginButtonPressed] = useState<boolean>(false)


	const [snackbarMsg, setSnackbarMsg] = useState<string>()
	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const openSnackBar = () => setSnackBarVisibility(true)
	const dismissSnackBar = () => setSnackBarVisibility(false)


	const [snackBarUpdateVisibility, setSnackBarBarUpdateVisibility] = useState(false)
	const openUpdateSnackBar = () => setSnackBarBarUpdateVisibility(true)
	const dismissUpdateSnackBar = () => setSnackBarBarUpdateVisibility(false)

	const openRegister = () => {
		router.push({
			pathname: '/register'
		})
	}

	const getFriendlyErrorMessage = (error: FirebaseError): string => {
		switch (error.code) {
			case "auth/invalid-email":
				return "Please enter a valid email address."
			case "auth/invalid-credential":
				return "invalid-credential."
			case "auth/user-disabled":
				return "This account has been disabled. Please contact support."
			case "auth/user-not-found":
				return "No account found with this email. Please sign up."
			case "auth/wrong-password":
				return "Incorrect password. Please try again."
			case "auth/email-already-in-use":
				return "This email is already in use. Please use a different email."
			case "auth/weak-password":
				return "Your password is too weak. Please use a stronger password."
			default:
				return "An unexpected error occurred. Please try again."
		}
	};

	const updatePaidHousesAndRentOwed = async (userId: string) => {
		try {
			const plotsSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots`));
			const plots = plotsSnapshot.docs.map(doc => doc.id)

			for (const plotId of plots) {
				const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
				await updateDoc(plotRef, { paidHouses: 0 })

				const housesSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses`));
				const houses = housesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

				for (const house of houses) {
					const houseId = house.id  // @ts-ignore
					const houseRent = house.rent

					const tenantsSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants`));
					const tenants = tenantsSnapshot.docs.map(doc => doc.id);

					for (const tenantId of tenants) {
						const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${tenantId}`)
						const tenantDoc = await getDoc(tenantRef)
						if (tenantDoc.exists()) {
							await updateDoc(tenantRef, { rentOwed: houseRent + tenantDoc.data().rentOwed })
						}
					}
				}
			}
			console.log('Successfully updated paidHouses to 0 and rentOwed for all tenants.')
		} catch (error) {
			console.error('Error updating paidHouses and rentOwed:', error)
		}
	}
	const handleLogin = async () => {
		setLoginButtonPressed(true);

		if (email === undefined || password === undefined) {
			setSnackbarMsg('Fill in both Input Fields')
			setSnackBarVisibility(true);
			setLoginButtonPressed(false);
			return;
		}

		await signInWithEmailAndPassword(firebaseAuth, email, password)
			.then(async (userCred) => {
				const userId = userCred.user.uid
				const today = new Date()
				const currentDate = today.getDate()
				const currentMonth = today.getMonth()
				const lastRunDate = await AsyncStorage.getItem('lastRunDate')

				if (currentDate === 1 && (!lastRunDate || lastRunDate !== `${currentMonth}-1`)) {
					openUpdateSnackBar()
					await updatePaidHousesAndRentOwed(userId)
					await AsyncStorage.setItem('lastRunDate', `${currentMonth}-1`)
					dismissUpdateSnackBar()
				}

				await AsyncStorage.setItem('userId', userId)
				router.push({
					pathname: '/dashboard',
				});
			})
			.catch((error) => {
				setSnackbarMsg(getFriendlyErrorMessage(error))
				setSnackBarVisibility(true)
			})
			.finally(() => {
				setLoginButtonPressed(false)
			})
	}


	useEffect(() => {
		navigation.setOptions({
			headerShown: false
		})
		const unsubscribe = auth.onAuthStateChanged(user => {
			if (user) {
				router.push('/dashboard')
			}
		})
		return unsubscribe
	}, [])

	return (
		<>
			<StatusBar barStyle={colorScheme == 'light' ? 'dark-content' : 'light-content'} backgroundColor={colorScheme == 'light' ? theme.colors.surfaceVariant : theme.colors.surface} />
			<View style={styles.container}>
				{/* App Logo */}
				<Image
					// source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732200.png' }}
					source={require('../assets/images/user.png')}
					style={styles.logo}
				/>

				{/* Title */}
				<CustomizedText textStyling={styles.title}>Welcome Back!</CustomizedText>

				{/* Email Input */}
				<TextInput
					placeholder="Email"
					placeholderTextColor="#999"
					onChangeText={(text) => setEmail(text)}
					style={styles.input}
					keyboardType="email-address"

					value={email}
				/>

				{/* Password Input */}
				<TextInput
					placeholder="Password"
					placeholderTextColor="#999"
					onChangeText={(text) => setPassword(text)}
					style={styles.input}
					secureTextEntry

					value={password}
				/>

				{/* Login Button */}
				<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
					{
						loginButtonPressed ? <ActivityIndicator /> : <CustomizedText textStyling={styles.loginText}>Login</CustomizedText>
					}
				</TouchableOpacity>

				{/* OR Separator */}
				<CustomizedText textStyling={styles.orText}>OR</CustomizedText>

				{/* Google Login Button */}
				<TouchableOpacity style={styles.googleButton} onPress={() => { setSnackbarMsg('Still Under Development'); openSnackBar() }}>
					<Image
						source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} // Google Icon
						style={styles.googleIcon}
					/>
					<CustomizedText textStyling={styles.googleText}>Sign in with Google</CustomizedText>
				</TouchableOpacity>

				{/* Sign In Option */}
				<View style={styles.footer}>
					<CustomizedText textStyling={styles.footerText}>Don't have an account?</CustomizedText>
					<TouchableOpacity onPress={openRegister}>
						<CustomizedText textStyling={styles.signupText}>Sign Up</CustomizedText>
					</TouchableOpacity>
				</View>
			</View>

			<Snackbar visible={snackBarVisibility} onDismiss={dismissSnackBar} style={getHousePageStyles(theme).snackBar} children={<Text style={{ fontFamily: 'DefaultCustomFont' }} children={snackbarMsg} />} duration={Snackbar.DURATION_SHORT} />

			<Snackbar visible={snackBarUpdateVisibility} onDismiss={dismissUpdateSnackBar} style={getHousePageStyles(theme).snackBar} duration={Snackbar.DURATION_SHORT}>
				<Text style={{ fontFamily: 'DefaultCustomFont', fontSize: theme.fonts.bodyMedium.fontSize }}>Updating New Months Rents...</Text>
				<Text style={{ fontFamily: 'DefaultCustomFont', fontSize: theme.fonts.bodySmall.fontSize }}>This may take a while</Text>
			</Snackbar>
		</>
	)
}

export const getAuthStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		// backgroundColor: '#f5f5f5',
		backgroundColor: colorScheme == 'light' ? theme.colors.surfaceVariant : theme.colors.surface,
		paddingHorizontal: 20,
	},
	logo: {
		width: 100,
		height: 100,
		marginBottom: 20,
	},
	title: {
		fontSize: 28,
		fontFamily: 'DefaultCustomFont-Bold',
		color: theme.colors.onSurface,
		marginBottom: 20
	},
	subtitle: {
		fontSize: 16,
		color: '#777',
		marginBottom: 20,
	},
	input: {
		width: '100%',
		height: 50,
		backgroundColor: colorScheme == 'light' ? theme.colors.elevation.level1 : theme.colors.elevation.level2,
		borderRadius: 10,
		paddingHorizontal: 15,
		marginVertical: 10,
		fontSize: 16,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		color: theme.colors.onSurface,
	},
	loginButton: {
		width: '100%',
		height: 50,
		// backgroundColor: '#007BFF',
		backgroundColor: colorScheme == 'light' ? theme.colors.primary : theme.colors.inversePrimary,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 10,
	},
	loginText: {
		fontSize: 18,
		fontFamily: 'DefaultCustomFont-Bold',
		color: colorScheme == 'light' ? theme.colors.onPrimary : theme.colors.onPrimaryContainer
	},
	orText: {
		marginVertical: 20,
		// fontSize: 16,
		fontSize: theme.fonts.bodyMedium.fontSize,
		color: '#777',
	},
	googleButton: {
		flexDirection: 'row',
		width: '100%',
		height: 50,
		// backgroundColor: '#fff',
		backgroundColor: colorScheme == 'light' ? theme.colors.onPrimary : theme.colors.secondary,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	googleIcon: {
		width: 20,
		height: 20,
		marginRight: 10,
	},
	googleText: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
	},
	footer: {
		flexDirection: 'row',
		marginTop: 20,
	},
	footerText: {
		color: '#777',
		fontSize: 14,
	},
	signupText: {
		color: '#007BFF',
		fontSize: 14,
		marginLeft: 5,
		fontFamily: 'DefaultCustomFont-Bold'
	},
});

export default Login