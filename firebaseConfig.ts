// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence, initializeAuth, Persistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyClMPZs163y1--HLT5CGUFxEvwwhEeu8Cs",
	authDomain: "app-test-a98d4.firebaseapp.com",
	projectId: "app-test-a98d4",
	storageBucket: "app-test-a98d4.firebasestorage.app",
	messagingSenderId: "49781105614",
	appId: "1:49781105614:web:9e0c84ba2faddc23c6419f",
	measurementId: "G-WX91S7WBB5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)

export const firebaseAuth = getAuth(app)
// setPersistence(firebaseAuth, browserLocalPersistence)
// 	.then(() => {
// 		console.log('Persistence Managed')
	// })
	// .catch((error) => {
	// 	console.log("Error setting persistence:", error)
	// })