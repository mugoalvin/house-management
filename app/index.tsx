import { useEffect, useMemo, useState } from "react"
import { useNavigation } from "expo-router"
import Fallback from "./fallback"
import { useTheme } from "react-native-paper"
import Login from "./login"


export default function Index() {
	const navigation = useNavigation()
	const [isDbLoaded, setDbLoaded] = useState<boolean>(false)
	const stableNavigation = useMemo(() => navigation, [navigation])

	useEffect(() => {
		setDbLoaded(true)
	}, [])

	useEffect(() => {
		stableNavigation.reset({
			index: 0,
			routes: [{ name: 'dashboard' as never }],
		});
	}, [stableNavigation]);

	if (!isDbLoaded) {
		return (
			<Fallback />
		)
	}

	return <Login />
}