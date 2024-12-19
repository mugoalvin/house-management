import { StyleSheet, View } from 'react-native'
import React, { useState } from 'react'
import { Button, MD3Theme, Modal, Portal, useTheme } from 'react-native-paper'
import { titleFontSize, appFontSize } from '@/assets/values'

interface CustomModalProps {
	visibility: boolean
	children: any
	closeModal: () => void
}

const CustomModal = ({children, visibility, closeModal}: CustomModalProps) => {
	const modalStyle = StyleSheet.create({
		modal: {
			margin: 20,
			
		},
	})

	return (
		<Portal>
			<Modal visible={visibility} onDismiss={closeModal} style={modalStyle.modal}>
				{children}
			</Modal>
		</Portal>
	)
}

export default CustomModal


export const getModalStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	main: {
		padding: 30,
		borderRadius: 20,
		// backgroundColor: colorScheme == 'light' ? Colors.light.card : Colors.dark.tabIconDefault
		backgroundColor: colorScheme == 'dark' ? theme.colors.surface : theme.colors.elevation.level3
	},
	title: {
		textAlign: 'center',
		fontSize: titleFontSize,
		fontFamily: 'DefaultCustomFont-Bold',
		marginBottom: 10
	},
	step: {
		fontSize: appFontSize,
	},
	textInput: {
		marginTop: 20,
		fontFamily: 'DefaultCustomFont'
	}
})