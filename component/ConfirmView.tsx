import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { appFontSize } from '@/assets/values'
import CustomizedText from './CustomizedText'

interface ConfirmViewProps {
	keyHolder: string
	value: string | number
}

const ConfirmView = ({keyHolder, value}: ConfirmViewProps) => {
	return (
		<View style={styles.conf_view}>
			<CustomizedText textStyling={styles.keyHolder}>{keyHolder}</CustomizedText>
			<CustomizedText textStyling={styles.value} numberOfLines={2} ellipsizeMode='tail'>{value}</CustomizedText>
		</View>	)
}

export default ConfirmView

const styles = StyleSheet.create({
	conf_view: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 30,
		// flexWrap: 'wrap'
	},
	keyHolder: {
		fontSize: appFontSize,
		fontFamily: 'DefaultCustomFont-Bold'
	},
	value: {
		maxWidth: '70%',
		alignContent: 'flex-end',
		textAlign: 'right'
	}
})