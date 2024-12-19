import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import React from 'react'
import CustomizedText from './CustomizedText'
import { tableRowStyle } from './TableRow'
import TableCell from './TableCell'
import { Colors } from '@/constants/Colors'

export interface TableHeaderCellProps {
	title: string
	flexBasisNo?: number
}

export interface TableHeaderProps {
	headerTexts: TableHeaderCellProps[]
}

const TableHeader = ({ headerTexts }: TableHeaderProps) => {

	const colorScheme = useColorScheme() || 'dark'

	return (
		<View style={[tableRowStyle.row, { backgroundColor: colorScheme == 'light' ? Colors.light.tableHeaderBackground : Colors.dark.tableHeaderBackground }]}>
			{
				headerTexts.map(headerText => (
					<TableCell key={headerText.title} isHeader cellStyle={{ flexBasis: `${headerText.flexBasisNo}%` }}>{headerText.title}</TableCell>
				))
			}
		</View>
	)
}

export default TableHeader