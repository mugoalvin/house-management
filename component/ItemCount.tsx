import {  StyleSheet, TouchableOpacity, View } from 'react-native'
import { Icon, MD3Theme, useTheme } from 'react-native-paper'
import { appFontSize } from '@/assets/values'
import CustomizedText from './CustomizedText'
import BigBold from './BigBold'

type counterObj = {
	number?: number
	label?: string
}


type ItemCountProps = {
	ItemCountObj?: counterObj
	onPress?: () => void
}

export default function ItemCount({ ItemCountObj, onPress }: ItemCountProps) {
	const theme = useTheme()
	const style = getItemCountObjStyle(theme)

	return (
		<TouchableOpacity style={style.TouchableOpacity} onPress={onPress}>
			<View style={style.view}>
				<BigBold children={ItemCountObj?.number || 0}/>
				<CustomizedText textStyling={style.text}>{ItemCountObj?.label}</CustomizedText>
			</View>
			<Icon source='menu-right' size={40} color={theme.colors.onSurfaceDisabled} />
		</TouchableOpacity>
	)
}

const getItemCountObjStyle = (theme: MD3Theme) => StyleSheet.create({
	TouchableOpacity: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	view: {
		flexDirection: 'row',
		alignItems: 'baseline',
		gap: 10
	},
	text: {
		fontSize: appFontSize,
		color: theme.colors.onSecondaryContainer
	}
})