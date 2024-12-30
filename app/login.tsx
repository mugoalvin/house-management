import CustomizedText from '@/component/CustomizedText';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, useColorScheme, StatusBar } from 'react-native';
import { ActivityIndicator, Button, MD3Theme, Snackbar, useTheme } from 'react-native-paper';
import { getHousePageStyles } from './housePage';
import { firebaseAuth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
	const onOpenSnackBar = () => setSnackBarVisibility(true)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	const openRegister = () => {
		router.push({
			pathname: '/register'
		})
	}

	const handleLogin = () => {
		setLoginButtonPressed(true)
		if(email == undefined || password == undefined) {
			setSnackbarMsg('Fill in both Input Fields')
			setSnackBarVisibility(true)
			setLoginButtonPressed(false)
			return
		}

		signInWithEmailAndPassword(firebaseAuth, email, password)
			.then( async (userCred) => {
				await AsyncStorage.setItem('userId', userCred.user.uid)
				router.push({
					pathname: '/dashboard',
				})
			})
			.catch((error) => {
				console.error('Failed to sign in: ' + error)
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
				<TouchableOpacity style={styles.googleButton} onPress={() => {setSnackbarMsg('Still Under Development'); onOpenSnackBar()} }>
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
			<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} style={getHousePageStyles(theme).snackBar} children={<Text style={{fontFamily: 'DefaultCustomFont'}} children={snackbarMsg} />} duration={Snackbar.DURATION_SHORT} />
		</>
	);
};

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
		fontFamily: 'DefaultCustomFont-Bold'
	},
	orText: {
		marginVertical: 20,
		fontSize: 16,
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