import { Fragment, useEffect, useState } from "react"
import { Alert, View } from "react-native"
import { router, useNavigation } from "expo-router"
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite"
import { tableCreationCommands } from "@/DB"
import { Fallback } from "./_layout"
import Dashboard from "./dashboard"
import { Button, useTheme } from "react-native-paper"
import CustomizedText from "@/component/CustomizedText"
import Login from "./login"


export default function Index() {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const todaysDate = new Date().getDate()
	const [isDbLoaded, setDbLoaded] = useState<boolean>(false)

	const createTables = async () => {
		for (const command of tableCreationCommands) {
			await db.runAsync(command)
		}
		setDbLoaded(true)
	}

	const updatePaidHouses = async () => {
		await db.runAsync('UPDATE plots SET paidHouses = 0')
	}

	useEffect(() => {
		
		createTables()
			.catch((e) => Alert.alert('Error Creating Table: ', e))
			.finally(() => {
				todaysDate == 1 && updatePaidHouses()
			})
	}, [])

	const resetDatabase = async () => {
		setDbLoaded(false); // Indicate loading
		try {
			await dropAllTables(db)
			await createTables()
			router.push('/dashboard')
		} catch (error) {
			Alert.alert("Error Resetting Database", String(error))
		}
	}

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

	// if (isDbLoaded) {
	// 	return (
	// 		// <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10}}>
	// 		// 	{/* <Button mode="contained" theme={theme} onPress={() => router.push('/dashboard')} ><CustomizedText>Proceed</CustomizedText></Button> */}
	// 		// 	<Button mode="contained" theme={theme} onPress={() => router.push('./login')} ><CustomizedText>Proceed</CustomizedText></Button>
	// 		// 	<Button mode="contained" theme={theme} onPress={resetDatabase}><CustomizedText>Clear Database</CustomizedText></Button>
	// 		// </View>

	// 		// <Login />
	// 	)
	// }

	return <Login />
}

const dropAllTables = async (db: SQLiteDatabase) => {
	try {
		const result = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'")
		// @ts-ignore
		for (const { name } of result) {
			if (name !== 'sqlite_sequence') { // Exclude internal tables
				await db.execAsync(`DROP TABLE IF EXISTS ${name}`).then(() => console.info(`${name} dropped`))
			}
		}
	}
	catch (error) {
		console.error('Error Deleting Tables: ', error)
	}
}

const clearTables = async (db: SQLiteDatabase) => {
	const result = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'")
	// @ts-ignore
	for (const { name } of result) {
		if (name !== 'sqlite_sequence') { // Exclude internal tables
			await db.execAsync(`DELETE FROM ${name}`);
		}
	}
}