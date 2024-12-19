import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import React, { Children } from 'react'
import CustomizedText from './CustomizedText'

type TableCellProps = {
	children?: React.ReactNode
	isHeader?: boolean
	cellStyle?: object | object[]
	// cellStyle?: StyleProp<ViewStyle>
}

const TableCell = ({ children, cellStyle, isHeader = false }: TableCellProps) => {
	return (
		<View style={[TableCellStyle.cell, cellStyle]}>
			<CustomizedText textStyling={isHeader ? TableCellStyle.header : undefined} >{children}</CustomizedText>
		</View>
	)
}

export default TableCell

const TableCellStyle = StyleSheet.create({
	cell: {
		paddingVertical: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	header: {
		fontSize: 20,
		fontFamily: 'DefaultCustomFont-Bold'
	}
})