import CustomizedText from '@/component/CustomizedText'
import { Redirect, router, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, StatusBar } from 'react-native'
import { ActivityIndicator, MD3Theme, Snackbar, useTheme } from 'react-native-paper'
import { getAuthStyle } from './login'
import { getHousePageStyles } from './housePage'

import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, onAuthStateChanged } from 'firebase/auth'
import { firestore, firebaseAuth } from '@/firebaseConfig'
import { doc, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Register = () => {
	const auth = firebaseAuth
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'light'
	const styles = getAuthStyle(colorScheme, theme)
	const navigation = useNavigation()

	const [firstName, setFirstName] = useState<string>('')
	const [lastName, setLastName] = useState<string>('')
	const [phoneNumber, setPhoneNumber] = useState<number>()
	const [occupation, setOccupation] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')

	const [snackbarMsg, setSnackbarMsg] = useState<string>()
	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const onOpenSnackBar = () => setSnackBarVisibility(true)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	const [buttonPressed, setButtonPressed] = useState<boolean>(false)

	const [user, setUser] = useState(null)

	const openLogin = () => {
		router.push({
			pathname: '/login'
		})
	}


	const saveUserData = async (userId: string) => {
		// const docRef = await addDoc(collection(firestore, '/users'), {
		await setDoc(doc(firestore, '/users', userId), {
			firstName: firstName,
			lastName: lastName,
			contactInfo: phoneNumber,
			email: email,
			occupation: occupation
		})
		.then(() => {})
		.catch((error) => {
			console.error("Error adding document " + error)
		})
	}

	const createUserByEmail = async() => {
		setButtonPressed(true)
		let userId

		const fields = [firstName, lastName, phoneNumber, occupation, email, password]

		if (fields.some((field) => !field)) {
			setSnackbarMsg(`Each field must have a value.`)
			onOpenSnackBar()
			setButtonPressed(false)
			return
		}

		const signInMethods = await fetchSignInMethodsForEmail(auth, email)

		if (signInMethods.length > 0) {
			setSnackbarMsg(`${email} is already in use`)
			onOpenSnackBar()
			setButtonPressed(false)
			return
		}

		createUserWithEmailAndPassword(auth, email, password)
			.then( async(userCred) => {
				userId = userCred.user.uid
				saveUserData(userId)
				await AsyncStorage.setItem('userId', userId)
				router.push({
					pathname: '/dashboard',
				})
			})
			.catch((error) => {
				console.error("Creating account failed: " + error)
				setButtonPressed(false)
				return
			})
			setButtonPressed(false)
	}

	useEffect(() => {
		navigation.setOptions({
			headerShown: false
		})

		const unsubscribe = auth.onAuthStateChanged(user => {
			if (user) {
				router.push({
					pathname: '/dashboard',
					params: {
						// currentUser: user
					}
				})
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
				<CustomizedText textStyling={styles.title}>Create An Account!</CustomizedText>

				<TextInput
					placeholder="First Name"
					placeholderTextColor="#999"
					onChangeText={(text) => setFirstName(text)}
					style={styles.input}
					keyboardType="default"
				/>

				<TextInput
					placeholder="Last Name"
					placeholderTextColor="#999"
					onChangeText={(text) => setLastName(text)}
					style={styles.input}
					keyboardType="default"
				/>

				<TextInput
					placeholder="Phone Number"
					placeholderTextColor="#999"
					onChangeText={(text) => setPhoneNumber(parseInt(text))}
					style={styles.input}
					keyboardType="numeric"
				/>

				<TextInput
					placeholder="Occupation"
					placeholderTextColor="#999"
					onChangeText={(text) => setOccupation(text)}
					style={styles.input}
					keyboardType="default"
				/>

				{/* Email Input */}
				<TextInput
					placeholder="Email"
					placeholderTextColor="#999"
					onChangeText={(text) => setEmail(text)}
					style={styles.input}
					keyboardType="email-address"
				/>

				{/* Password Input */}
				<TextInput
					placeholder="Password"
					placeholderTextColor="#999"
					onChangeText={(text) => setPassword(text)}
					style={styles.input}
					secureTextEntry
				/>

				{/* Register Button */}
				<TouchableOpacity style={styles.loginButton} onPress={createUserByEmail}>
					{
						buttonPressed ? <ActivityIndicator /> : <CustomizedText textStyling={styles.loginText}>Register</CustomizedText>
					}
				</TouchableOpacity>

				{/* OR Separator */}
				<CustomizedText textStyling={styles.orText}>OR</CustomizedText>

				{/* Google Login Button */}
				<TouchableOpacity style={styles.googleButton} onPress={() => {setSnackbarMsg('Still Under Development'); onOpenSnackBar()} }>
					<Image
						source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} // Google Icon
						style={styles.googleIcon}
					/>
					<CustomizedText textStyling={styles.googleText}>Sign up with Google</CustomizedText>
				</TouchableOpacity>

				{/* Sign Up Option */}
				<View style={styles.footer}>
					<CustomizedText textStyling={styles.footerText}>Have an existing account?</CustomizedText>
					<TouchableOpacity onPress={openLogin}>
						<CustomizedText textStyling={styles.signupText}>Sign In</CustomizedText>
					</TouchableOpacity>
				</View>
			</View>
			<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} style={getHousePageStyles(theme).snackBar} children={<Text style={{fontFamily: 'DefaultCustomFont'}} children={snackbarMsg} />} duration={Snackbar.DURATION_SHORT} />
		</>
	);
};

export default Register