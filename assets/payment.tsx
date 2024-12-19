export interface paymentFormProps {
	id?: number,
	tenantId: number
	month: string
	amount: number
	year: number
	transactionDate: Date
}


export const getMonths = () => {
    return [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}