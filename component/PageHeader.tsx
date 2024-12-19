import { Colors } from '@/constants/Colors'
import { StyleSheet, View, Text, Dimensions, useColorScheme, StatusBar, SafeAreaView, Appearance } from 'react-native'
import CustomizedText from './CustomizedText'
import { titleFontSize } from '@/assets/values'
import { router } from 'expo-router'
import { useTheme } from 'react-native-paper'

type PageHeaderProps = {
	pageTitle: string
}

const PageHeader = ({ pageTitle }: PageHeaderProps) => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'


	const PageHeaderStyle = StyleSheet.create({
		header: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: 10,
			height: Dimensions.get('window').height * 0.08,
			marginTop: StatusBar.currentHeight,
			borderBottomWidth: 1,
			borderBottomColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.secondaryContainer,
			backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.secondaryContainer
		},
		title: {
			fontFamily: 'DefaultCustomFont-Bold',
			fontSize: titleFontSize,
			color: theme.colors.onSurface
		}
	})

	return (
		<SafeAreaView style={PageHeaderStyle.header}>
			<CustomizedText textStyling={PageHeaderStyle.title} onPress={() => router.push('./zzz.tsx')}>{pageTitle}</CustomizedText>
			{/* <Ionicons name='ellipsis-vertical' color={useColorScheme() == 'light' : Color}/> */}
		</SafeAreaView>
	)
}

export default PageHeader