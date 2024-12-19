import { StyleSheet, FlatList } from 'react-native'
import { TableHeaderCellProps } from './TableHeader'
import { DataTable, useTheme } from 'react-native-paper'
import CustomizedText from './CustomizedText'

const tableStyle = StyleSheet.create({
	table: {
		width: '100%',
		overflow: 'scroll',
		height: 250,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 20
	},
	scrollView: {
		maxHeight: 200,
		overflow: 'scroll'
	}
})

type TableProps = {
	tableTitles: TableHeaderCellProps[]
	tableData: object[]
	onRowPress?: (data: any) => any
}


const Table = ({ tableData, tableTitles, onRowPress }: TableProps) => {

	const theme = useTheme()

	return (
		<>
			<DataTable>
				<DataTable.Header>
					{
						tableTitles.map(header => (
							<DataTable.Title key={header.title}>
								<CustomizedText textStyling={{ fontSize: theme.fonts.bodyMedium.fontSize, color: theme.colors.onSurfaceDisabled, fontFamily: 'DefaultCustomFont-Bold' }}>
									{header.title}
								</CustomizedText>
							</DataTable.Title>
						))
					}
				</DataTable.Header>


				{
					tableData.map((row, index) => (
						<DataTable.Row key={index} onPress={() => onRowPress && onRowPress(row)}>
							{
								Object.values(row).map((value, index) => (
									<DataTable.Cell key={index} style={{ paddingHorizontal: 2.5 }}>
										<CustomizedText textStyling={{fontSize: theme.fonts.bodySmall.fontSize}}>
											{value?.toString()}
										</CustomizedText>
									</DataTable.Cell>
								))
							}
						</DataTable.Row>
					))
				}
			</DataTable>
		</>
	)
}

export default Table