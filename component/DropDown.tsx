import { Appearance, StyleProp, StyleSheet, useColorScheme, ViewProps } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'
import { SelectList, SelectListProps } from 'react-native-dropdown-select-list'
import { FontAwesome } from '@expo/vector-icons'
import { MD3Theme, useTheme } from 'react-native-paper'

export interface DropDownProps {
	data: {key: number | undefined, value: string}[] | string[]
	placeholder?: string
	search?: boolean
	searchPlaceholder?: string
	notFoundText?: string
	onSelect: (value: number) => void
}


const DropDown = ({data, placeholder: placeholder, search, searchPlaceholder, notFoundText, onSelect} : DropDownProps) => {
	const colorScheme = useColorScheme() || 'dark'
	const theme = useTheme()
	
	return (
		<SelectList
			data={data}
			setSelected={(value : any) => onSelect(value)}
			boxStyles={getDropDownStyle(colorScheme, theme).dropDown}

			placeholder={placeholder}
			inputStyles={getDropDownStyle(colorScheme, theme).inputStyles}
			dropdownStyles={getDropDownStyle(colorScheme, theme).dropdownStyles}
			dropdownItemStyles={getDropDownStyle(colorScheme, theme).dropdownItemStyles}
			dropdownTextStyles={getDropDownStyle(colorScheme, theme).dropdownTextStyles}
			searchicon={<FontAwesome name="search" size={16} color={theme.colors.secondary} style={{marginRight: 10}} />}
			arrowicon={<FontAwesome name="chevron-down" size={14} color={theme.colors.secondary} style={{marginTop: 2}} />}
			search={search}
			searchPlaceholder={searchPlaceholder}
			fontFamily='DefaultCustomFont'
			notFoundText={notFoundText}
			closeicon={<FontAwesome name="close" size={16} color={theme.colors.secondary} />}
		/>
	)
}

export default DropDown


const getDropDownStyle = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	dropDown: {
		borderWidth: 0,
		marginTop: 20,
		alignItems: 'center',
		height: 50,
		backgroundColor: theme.colors.onSecondary
		// backgroundColor: theme.colors.surface
	},
	inputStyles: {
		color: theme.colors.secondary
	},
	dropdownStyles: {
		borderWidth: 0,
		backgroundColor: theme.colors.onSecondary
	},
	dropdownItemStyles: {
	},
	dropdownTextStyles: {
		color: theme.colors.secondary
	},
})