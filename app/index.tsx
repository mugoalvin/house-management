import { useEffect, useState } from "react"
import { useNavigation } from "expo-router"
import { useSQLiteContext } from "expo-sqlite"
import { Fallback } from "./_layout"
import { useTheme } from "react-native-paper"
import Login from "./login"
import { firestore } from "@/firebaseConfig"
import { getDocs, collection, doc, updateDoc, getDoc } from "firebase/firestore"


export default function Index() {
	const theme = useTheme()
	const navigation = useNavigation()
	const todaysDate = new Date().getDate()
	const [isDbLoaded, setDbLoaded] = useState<boolean>(false)

	// const updatePaidHouses = async () => {
	// 	await db.runAsync('UPDATE plots SET paidHouses = 0')
	// }


	const updatePaidHousesAndRentOwed = async () => {
		try {
			const usersSnapshot = await getDocs(collection(firestore, 'users'));
			const users = usersSnapshot.docs.map(doc => doc.id)

			// Iterate over each user
			for (const userId of users) {
				// Fetch all plots for the current user
				const plotsSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots`));
				const plots = plotsSnapshot.docs.map(doc => doc.id)

				// Iterate over each plot
				for (const plotId of plots) {
					const plotRef = doc(firestore, `/users/${userId}/plots/${plotId}`)
					await updateDoc(plotRef, { paidHouses: 0 })

					// Fetch all houses for the current plot
					const housesSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses`));
					const houses = housesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

					// Iterate over each house
					for (const house of houses) {
						const houseId = house.id
						// @ts-ignore
						const houseRent = house.rent

						// Fetch all tenants for the current house
						const tenantsSnapshot = await getDocs(collection(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants`));
						const tenants = tenantsSnapshot.docs.map(doc => doc.id);

						// Iterate over each tenant and update the rentOwed field
						for (const tenantId of tenants) {
							const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${tenantId}`)
							const tenantDoc = await getDoc(tenantRef)
							if (tenantDoc.exists()) {
								await updateDoc(tenantRef, { rentOwed: houseRent + tenantDoc.data().rentOwed })
							}
						}
					}
				}
			}

			console.log('Successfully updated paidHouses to 0 and rentOwed for all tenants.');
		} catch (error) {
			console.error('Error updating paidHouses and rentOwed:', error);
		}
	};

	useEffect(() => {
		const checkDateAndRun = () => {
			const now = new Date();
			const todaysDate = now.getDate();
			const currentMonth = now.getMonth(); // Optional: To ensure it runs only once per month
			const lastRunDate = localStorage.getItem('lastRunDate');

			if (todaysDate === 1 && lastRunDate !== `${currentMonth}-1`) {
				updatePaidHousesAndRentOwed();
				localStorage.setItem('lastRunDate', `${currentMonth}-1`); // Store the last run date
			}
		};

		// Run immediately
		checkDateAndRun();

		// Optional: Set interval to re-check daily (runs every 24 hours)
		const interval = setInterval(checkDateAndRun, 24 * 60 * 60 * 1000);

		return () => clearInterval(interval); // Cleanup interval on unmount
	}, [])


	useEffect(() => {
		navigation.reset({
			index: 0,
			// @ts-ignore
			routes: [{ name: 'dashboard' }]
		})
	}, [navigation])

	if (!isDbLoaded) {
		return (
			<Fallback />
		)
	}

	return <Login />
}