import { TableHeaderCellProps } from "@/component/TableHeader";

export const tableTransactionsHeadertexts : TableHeaderCellProps[] = [
	{ title: 'Name', flexBasisNo: 25 },
	{ title: 'House No', flexBasisNo: 20 },
	{ title: 'Price', flexBasisNo: 15 },
	{ title: 'Balance', flexBasisNo: 20 },
	{ title: 'Date', flexBasisNo: 20 }
]




export const allTransactionsData = [
    { name: 'Jane Doe', houseNo: '#2', price: 3000, balance: 2000,  date: '01/01/2024' },
    { name: 'John Smith', houseNo: '#3', price: 3000, balance: 2000,  date: '02/01/2024' },
    { name: 'Mary Johnson', houseNo: '#4', price: 3000, balance: 2000,  date: '03/01/2024' },
    { name: 'Michael Brown', houseNo: '#5', price: 3000, balance: 2000,  date: '04/01/2024' },
    { name: 'Patricia Taylor', houseNo: '#6', price: 3000, balance: 2000,  date: '05/01/2024' },
    { name: 'Robert Wilson', houseNo: '#7', price: 3000, balance: 2000,  date: '06/01/2024' },
    { name: 'Linda Martinez', houseNo: '#8', price: 3000, balance: 2000,  date: '07/01/2024' },
    { name: 'James Anderson', houseNo: '#9', price: 3000, balance: 2000,  date: '08/01/2024' },
    { name: 'Barbara Thomas', houseNo: '#10', price: 3000, balance: 2000,  date: '09/01/2024' },
    { name: 'William Jackson', houseNo: '#11', price: 3000, balance: 2000,  date: '10/01/2024' },
    { name: 'Elizabeth Harris', houseNo: '#12', price: 3000, balance: 2000,  date: '11/01/2024' },
    { name: 'David White', houseNo: '#13', price: 3000, balance: 2000,  date: '12/01/2024' },
    { name: 'Susan Clark', houseNo: '#14', price: 3000, balance: 2000,  date: '13/01/2024' },
]


export interface transactionDBProp {
    id: number
    tenantId: number
    amount: number
    month: string
    year: number
}