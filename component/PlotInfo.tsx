import { View, useColorScheme, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { appFontSize } from '@/assets/values'
import { getCardStyle } from './Card'
import CustomizedText from './CustomizedText'
import { plotsProps } from '@/assets/plots'
import { MD3Theme, useTheme } from 'react-native-paper'
import BigBold from './BigBold'
import { houseDataProps } from '@/app/plotPage'
import { tenantProps } from '@/assets/tenants'
import { useSQLiteContext } from 'expo-sqlite'
import { transactionDBProp } from '@/assets/transactions'
import { getMonths } from '@/assets/payment'
import { houseProps } from '@/app/houses'


type PlotInfoProps = {
	plotData: plotsProps
	houses: Partial<houseDataProps[]>
}

const PlotInfo = ({ plotData, houses }: PlotInfoProps) => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const plotInfoStyles = getPlotInfoStyles(colorScheme, theme)

	const [totalToBePaid, setTotalToBePaid] = useState<number>(0)
	const [paidAmount, setPaidAmount] = useState<number>(0)
	const [monthlyPending, setMonthlyPending] = useState<number>(0)
	const [monthTransactions, setMonthTransactions] = useState<transactionDBProp[]>([])

	const [tenantsInPlot, setTenantsInPlot] = useState<tenantProps[]>([])
	const [tenantsWithPendingPayments, setTenantsWithPendingPayments] = useState<(houseDataProps & tenantProps)[]>([])

	const fetchTenantsInPlots = async() => {
		try{
			const tenants : tenantProps[] = await db.getAllAsync('SELECT tenants.* FROM tenants JOIN houses ON tenants.houseId = houses.id WHERE houses.plotId = ? ', [plotData.id || 0])
			setTenantsInPlot(tenants)
		}
		catch(e) {
			throw e
		}
	}

	const calculateTotalPending = () => {
		const pendingAmount = tenantsInPlot.reduce((previousTotal, tenant) => previousTotal + tenant.depositOwed + tenant.rentOwed , 0)
		setTotalToBePaid(pendingAmount)
	}

	const calculateTotalPaid = () => {
		const paidTotal = monthTransactions.reduce((prevPaid, transaction) => prevPaid + transaction.amount, 0)
		setPaidAmount(paidTotal)
	}

	const calculateMonthlyPending = () => {
		const monthlyPending = tenantsWithPendingPayments.reduce((prevPending, transactionTenant) => prevPending + (transactionTenant.rentOwed > transactionTenant.rent ? transactionTenant.rent : transactionTenant.rentOwed) , 0)
		setMonthlyPending(monthlyPending)
	}

	const getThisMonthTransactions = async () => {
		const transactions: transactionDBProp[] = await db.getAllAsync(` SELECT transactions.* FROM transactions JOIN tenants ON transactions.tenantId = tenants.id JOIN houses ON tenants.houseId = houses.id JOIN plots ON houses.plotId = plots.id WHERE transactions.month = ? AND transactions.year = ? AND plots.id = ?`, [getMonths()[new Date().getMonth()], new Date().getFullYear(), Number(plotData?.id)])
		setMonthTransactions(transactions)
	}

	const getThisMonthTransAndTenant = async () => {
		const tenantsPending: (houseDataProps & tenantProps)[] = await db.getAllAsync(` SELECT tenants.*, houses.* FROM tenants JOIN houses ON tenants.houseId = houses.id JOIN plots ON houses.plotId = plots.id WHERE tenants.rentOwed > 0 AND plots.id = ? `, [Number(plotData.id)])
		setTenantsWithPendingPayments(tenantsPending)
	}

	useEffect(() => {
		fetchTenantsInPlots()
		getThisMonthTransactions()
	}, [plotData])

	useEffect(() => {
		tenantsInPlot.length > 0 && calculateTotalPending()
	}, [tenantsInPlot])

	useEffect(() => {
		monthTransactions.length > 0 && calculateTotalPaid()
		getThisMonthTransAndTenant()
	}, [monthTransactions])


	useEffect(() => {
		tenantsWithPendingPayments.map(transactionTenant => {
			transactionTenant.rentOwed > 0 && calculateMonthlyPending()
		})
	}, [tenantsWithPendingPayments])
	
	return (
		<>
			<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Plot Information</CustomizedText>

			<View>
				<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>{`${getMonths()[new Date().getMonth()]}'s Income`}</CustomizedText>
				<BigBold children={`Ksh ${ new Intl.NumberFormat('en-US').format(paidAmount) }`} customStyle={{fontSize: theme.fonts.displaySmall.fontSize, color: theme.colors.onSurface}}/>
			</View>

			<View style={plotInfoStyles.housesAndCash}>
				<View style={getPlotInfoStyles(colorScheme, theme).lineContainer}>
					<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>Monthly Pending</CustomizedText>
					<BigBold children={`Ksh ${new Intl.NumberFormat('en-US').format(monthlyPending)}`} customStyle={{fontSize: appFontSize+5, color: monthlyPending != 0 ? theme.colors.error : theme.colors.secondary}} />
				</View>

				<View style={getPlotInfoStyles(colorScheme, theme).lineContainer}>
					<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>Total Pending</CustomizedText>
					<BigBold children={`Ksh ${ new Intl.NumberFormat('en-US').format(totalToBePaid) }`} customStyle={{fontSize: appFontSize+5, color: totalToBePaid != 0 ? theme.colors.error : theme.colors.secondary}}/>
				</View>
			</View>

			<View>
				{/* <CustomizedText textStyling={plotInfoStyles.plotDetails}>{plotData?.details}</CustomizedText> */}
			</View>
		</>
	)
}

export default PlotInfo


export const getPlotInfoStyles = (colorScheme: string, theme: MD3Theme) => StyleSheet.create({
	view: {
		flex: 1,
		gap: 20,
	},
	scrollView: {
		rowGap: 0,
		padding: 10,
		// backgroundColor: theme.colors.secondary,
	},
	housesAndCash: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginVertical: 10
	},
	title: {
		fontSize: theme.fonts.titleMedium.fontSize,
		color: theme.colors.onSurfaceDisabled
	},

	lineContainer: {
		// justifyContent: 'space-between',
		// alignItems: 'center',
	},

	plotDetails: {
		marginTop: 10,
	},
	container: {
		position: 'relative'
	},
	details: {
		position: 'absolute',
		top: 20,
		right: 40,
		width: 140,
		zIndex: 2,
		padding: 12,
		backgroundColor: theme.colors.onSecondary,
		borderRadius: 8,

		flexDirection: 'row',
		gap: 10
	}
})