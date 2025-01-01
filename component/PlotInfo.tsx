import React, { useEffect, useState } from 'react'
import { View, useColorScheme, StyleSheet } from 'react-native'
import { MD3Theme, useTheme } from 'react-native-paper'
import { collection, getDocs } from 'firebase/firestore'

import { appFontSize } from '@/assets/values'
import { getCardStyle } from './Card'
import CustomizedText from './CustomizedText'
import { plotsProps } from '@/assets/plots'
import BigBold from './BigBold'
import { CombinedHouseTenantData } from '@/app/plotPage'
import { tenantProps } from '@/assets/tenants'
import { transactionDBProp } from '@/assets/transactions'
import { getMonths } from '@/assets/payment'
import { houseProps } from '@/app/houses'
import { firestore } from '@/firebaseConfig'

type PlotInfoProps = {
	userId: string
	plotData: plotsProps
	housesTenants: Partial<CombinedHouseTenantData[]>
}

const PlotInfo = ({ userId, plotData, housesTenants }: PlotInfoProps) => {
	const theme = useTheme()
	const colorScheme = useColorScheme() || 'dark'
	const plotInfoStyles = getPlotInfoStyles(colorScheme, theme)

	const [totalToBePaid, setTotalToBePaid] = useState<number>(0)
	const [paidAmount, setPaidAmount] = useState<number>(0)
	const [monthlyPending, setMonthlyPending] = useState<number>(0)
	const [monthTransactions, setMonthTransactions] = useState<transactionDBProp[]>([])

	const [tenantsInPlot, setTenantsInPlot] = useState<tenantProps[]>([])
	const [tenantsWithPendingPayments, setTenantsWithPendingPayments] = useState<CombinedHouseTenantData[]>([])

	const fetchTenantsInPlots = async (userId: string, plotId: string) => {
		try {
			const tenants: tenantProps[] = []
			const plotRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses`)
			await getDocs(plotRef).then((snapshot) => {
				snapshot.forEach((doc) => {
					const house = { id: doc.id, ...doc.data() as houseProps }
					const tenantRef = collection(firestore, `/users/${userId}/plots/${plotId}/houses/${house.id}/tenants`)
					getDocs(tenantRef).then((snapshot) => {
						snapshot.forEach((doc) => {
							const tenant = { ...doc.data() as tenantProps, id: doc.id }
							tenants.push(tenant)
						})
					})
				})
			})
			setTenantsInPlot(tenants)
		}
		catch (e) {
			throw e
		}
	}

	const calculateTotalPending = () => {
		const pendingAmount = tenantsInPlot.reduce((previousTotal, tenant) => previousTotal + tenant.depositOwed + tenant.rentOwed, 0)
		setTotalToBePaid(pendingAmount)
	}

	const calculateTotalPaid = () => {
		const paidTotal = monthTransactions.reduce((prevPaid, transaction) => prevPaid + transaction.amount, 0)
		setPaidAmount(paidTotal)
	}

	const calculateMonthlyPending = () => {
		// @ts-ignore
		const monthlyPending = tenantsWithPendingPayments.reduce((prevPending, transactionTenant) => prevPending + (transactionTenant.tenants[0]?.rentOwed > transactionTenant.house?.rent ? transactionTenant.house?.rent : transactionTenant.tenants?.[0]?.rentOwed ?? 0), 0)
		setMonthlyPending(monthlyPending)
	}

	const getThisMonthTransactions = async () => {
		const transactions: transactionDBProp[] = []
		for (const houseData of housesTenants) {
			if (!houseData?.tenants[0]?.id) continue
			const transactionRef = collection(firestore, `/users/${userId}/plots/${plotData.id}/houses/${houseData?.house.houseId}/tenants/${houseData.tenants[0].id}/transactions`)
			try {
				const snapShot = await getDocs(transactionRef);
				if (!snapShot.empty) {
					snapShot.docs.forEach((doc) => {
						transactions.push(doc.data() as transactionDBProp);
					})
				}
			} catch (error) {
				console.error("Error fetching transactions:", error);
			}
		}
		setMonthTransactions(transactions.filter(transaction => transaction.month == getMonths()[new Date().getMonth()] && transaction.year == new Date().getFullYear()))
	}

	const getThisMonthTransAndTenant = (housesTenants: Partial<CombinedHouseTenantData[]>) => {
		if (!housesTenants) return
		const filteredTenants = housesTenants.filter(
			(houseTenant) =>
				houseTenant?.tenants &&
				houseTenant.tenants.length > 0 &&
				houseTenant.tenants.some((tenant) => tenant.rentOwed && tenant.rentOwed > 0)
		)

		console.log(filteredTenants)
		setTenantsWithPendingPayments(filteredTenants.filter((tenant): tenant is CombinedHouseTenantData => tenant !== undefined))
	}

	useEffect(() => {
		if (userId && plotData.id !== undefined) {
			fetchTenantsInPlots(userId, plotData.id as string)
		}
		getThisMonthTransactions()
	}, [plotData])

	useEffect(() => {
		tenantsInPlot.length > 0 && calculateTotalPending()
	}, [tenantsInPlot])

	useEffect(() => {
		monthTransactions.length > 0 && calculateTotalPaid()
	}, [monthTransactions])

	useEffect(() => {
		getThisMonthTransAndTenant(housesTenants)
	}, [housesTenants, monthTransactions])


	useEffect(() => {
		tenantsWithPendingPayments.map(transactionTenant => {
			// @ts-ignore
			transactionTenant.tenants[0].rentOwed > 0 && calculateMonthlyPending()
		})
	}, [tenantsWithPendingPayments])

	return (
		<>
			<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Plot Information</CustomizedText>

			<View>
				<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>{`${getMonths()[new Date().getMonth()]}'s Income`}</CustomizedText>
				<BigBold children={`Ksh ${new Intl.NumberFormat('en-US').format(paidAmount)}`} customStyle={{ fontSize: theme.fonts.displaySmall.fontSize, color: theme.colors.onSurface }} />
			</View>

			<View style={plotInfoStyles.housesAndCash}>
				<View style={getPlotInfoStyles(colorScheme, theme).lineContainer}>
					<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>Monthly Pending</CustomizedText>
					<BigBold children={`Ksh ${new Intl.NumberFormat('en-US').format(monthlyPending)}`} customStyle={{ fontSize: appFontSize + 5, color: monthlyPending != 0 ? theme.colors.error : theme.colors.secondary }} />
				</View>

				<View style={getPlotInfoStyles(colorScheme, theme).lineContainer}>
					<CustomizedText textStyling={getPlotInfoStyles(colorScheme, theme).title}>Total Pending</CustomizedText>
					<BigBold children={`Ksh ${new Intl.NumberFormat('en-US').format(totalToBePaid)}`} customStyle={{ fontSize: appFontSize + 5, color: totalToBePaid != 0 ? theme.colors.error : theme.colors.secondary }} />
				</View>
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