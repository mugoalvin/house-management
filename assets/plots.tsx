export type plotsProps = {
	id?: number | string
	plotName: string
	numberOfHouses: number
	amountPaid: number
	numberOccupiedHouses: number
	paidHouses: number
	details: string
	houseType: string
	rentPrice: number
}

export type addPlotFormDataProps = {
	id: number
	plotName: string
	numberOfHouses: number
	paidHouses: number
	details: string
	amountPaid: number
	numberOccupiedHouses: number
}