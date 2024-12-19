import { View, useColorScheme, ScrollView, StyleSheet, ToastAndroid, Linking, Pressable } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import Card, { getCardStyle } from '@/component/Card'
import CustomizedText from '@/component/CustomizedText'
import { appFontSize, bigNumberFontSize, getMonthsBetween } from '@/assets/values'
import { PieChart, PieChartPro  } from 'react-native-gifted-charts'
import { useSQLiteContext } from 'expo-sqlite'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FAB, Icon, MD3Theme, Modal, Portal, Snackbar, useTheme } from 'react-native-paper'
import AddTenant from '@/component/AddTenant'
import DeleteTenant from '@/component/DeleteTenant'
import Payment from '@/component/Payment'
import { transactionDBProp } from "@/assets/transactions"
import PaymentProgress from "@/component/PaymentProgress"
import { tenantProps } from "@/assets/tenants"
import EditTenant from '@/component/EditTenant'


interface houseDataProps {
	houseId: number
	houseNumber: string
	houseType: string
	occupancy: string
	rent: number
	tenantId: number
	tenantName: string
	time: string
}

const housePage = () => {
	const db = useSQLiteContext()
	const theme = useTheme()
	const navigation = useNavigation()
	const colorScheme = useColorScheme() || 'dark'
	const style = getHousePageStyles(theme)
	const { plotName, house, plotId } = useLocalSearchParams()
	const houseData: houseDataProps = house ? JSON.parse(house as string) : {}
	const [tenantInfo, setTenantInfo] = useState<tenantProps>({} as tenantProps)
	const [loading, setLoading] = useState<boolean>(true)
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [houseId, setHouseId] = useState<number>(0)
	const [transactionData, setTransactionData] = useState<transactionDBProp[]>([])
	const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete' | 'payment' | null>(null)
	const [snackbarMsg, setSnackbarMsg] = useState<string>()
	const [monthlyExpected, setMonthlyExpected] = useState<number>(0)
	const [totalOverDue, setTotalOverDue] = useState<number>(0)

	const [newTenantId, setNewTenantId] = useState<number>(0)

	const [fabOpen, setFabOpen] = useState({ open: false })
	const onStateChange = ({ open }: any) => setFabOpen({ open })
	const { open } = fabOpen

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const onOpenSnackBar = () => setSnackBarVisibility(true)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	async function fetchHouseId() {
		const house: any = await db.getFirstAsync("SELECT id FROM houses WHERE plotId = ? AND houseNumber = ? ", [Number(plotId), houseData.houseNumber])
		setHouseId(house?.id)
	}

	async function getTenantInfo() {
		try {
			const result: tenantProps = await db.getFirstAsync(`SELECT * FROM tenants WHERE id = ?`, [houseData.tenantId || newTenantId]) || {} as tenantProps
			setTenantInfo(result)
		} catch (error) {
			console.error('Failed to fetch tenant info:', error)
		} finally {
			setLoading(false)
		}
	}

	function getMonthlyExpected(): number {
		let monthExpected = tenantInfo.rentOwed
		while (monthExpected > houseData.rent) {
			monthExpected -= houseData.rent
		}
		return monthExpected
	}

	function getTotalOverDue(): number {
		return tenantInfo.depositOwed + tenantInfo.rentOwed
	}

	const openModal = (action: 'add' | 'edit' | 'delete' | 'payment') => {
		setModalAction(action)
		setModalVisibility(true)
	}

	const closeModal = () => {
		setModalVisibility(false)
	}

	const getTenantsPayment = async () => {
		if (tenantInfo) {
			try {
				const transactions: transactionDBProp[] = await db.getAllAsync("SELECT * FROM transactions WHERE tenantId = ?", [tenantInfo.id])
				setTransactionData(transactions)
			}
			catch (e) {
				ToastAndroid.show('Failed To Fetch Transactions', ToastAndroid.SHORT)
			}
		}
	}

	const monthsLivedInHouse = Number(houseData.time.split(' ')[0])
	const durationLabel = houseData.time.split(' ')[1] as 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months' | 'year' | 'years'

	const valueToCalc =
		(durationLabel == 'year' || durationLabel == 'years') ? 5 :
			(durationLabel == 'month' || durationLabel == 'months') ? 12 :
				(durationLabel == 'day' || durationLabel == 'days') ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() : 0

	const pieData = [
		{ value: monthsLivedInHouse, color: theme.colors.primary },
		{ value: valueToCalc - monthsLivedInHouse, color: colorScheme == 'dark' ? theme.colors.surface : theme.colors.primary }
	]

	useEffect(() => {
		navigation.setOptions({
			title: plotName + ' - House ' + houseData.houseNumber,
		})
		fetchHouseId()
		getTenantInfo()
	}, [])

	useEffect(() => {
		setMonthlyExpected(getMonthlyExpected())
		setTotalOverDue(getTotalOverDue())
	}, [tenantInfo])

	useEffect(() => {
		if (!modalVisibility)
		getTenantInfo()
	}, [modalVisibility])

	useEffect(() => {
		getTenantsPayment()
	}, [tenantInfo])

	const renderActions = () => {
		if (Object.keys(tenantInfo).length === 0) {
			return [{ icon: 'plus', label: 'Add Tenant', onPress: () => openModal('add') }]
		} else {
			return [
				{ icon: 'cash', label: 'Payment', onPress: () => openModal('payment') },
				{ icon: 'email', label: 'Edit', onPress: () => openModal('edit') },
				{ icon: 'delete', label: 'Delete', onPress: () => openModal('delete') }
			]
		}
	}

	loading || tenantInfo == undefined &&
		(
			<View>
				<CustomizedText>Loading...</CustomizedText>
				<ActivityIndicator size='large' />
			</View>
		)

	const handlePhoneClick = (phoneNumber: string) => {
		Linking.openURL(`tel: ${phoneNumber}`)
	}

	return (
		<>
			<ScrollView style={style.scrollView}>
				<View style={style.view}>
					<Card>
						<Pressable onPress={() => router.push({pathname: '/tenantPage', params: {tenantName: tenantInfo.tenantName}}) }>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
								<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>{Object.keys(tenantInfo).length != 0 ? 'Current Tenant' : 'Vacant House'}</CustomizedText>
								<CustomizedText>{houseData.houseType}</CustomizedText>
							</View>

							{
								Object.keys(tenantInfo).length != 0 &&
								<View style={style.tenantInfoView}>
									<View style={style.nameNumberView}>
										<CustomizedText textStyling={style.name}>{tenantInfo.tenantName}</CustomizedText>
										<CustomizedText textStyling={style.occupation}>{tenantInfo.occupation}</CustomizedText>
										<Pressable style={{flexDirection: 'row', gap: 10, alignItems: 'center'}} onPress={() => handlePhoneClick(tenantInfo.contactInfo)}>
											<Icon source='phone' size={16} />
											<CustomizedText textStyling={style.number}>{tenantInfo.contactInfo}</CustomizedText>
										</Pressable>
									</View>
									<View style={style.pieView}>
										<PieChart
											donut
											radius={60}
											innerRadius={55}
											innerCircleColor={theme.colors.elevation.level1}
											data={pieData}
											centerLabelComponent={() => (
												<CustomizedText textStyling={{ textAlign: 'center' }}>
													<CustomizedText textStyling={{ fontSize: 24 }} >{monthsLivedInHouse}</CustomizedText>
													{'\n'}
													{durationLabel}
												</CustomizedText>
											)}
										/>
									</View>
								</View>
							}
						</Pressable>
					</Card>

					{
						tenantInfo && (
							<Card>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText} >Deposit</CustomizedText>

									{
										tenantInfo.depositOwed == 0 && (
											<View style={{ flexDirection: 'row', gap: 10 }}>
												<Icon size={20} source='check-all' color='#4caf50' />
												<CustomizedText>Paid</CustomizedText>
											</View>
										)
									}
								</View>
								{
									Object.keys(tenantInfo).length != 0 && tenantInfo.depositOwed != 0 &&
									<PaymentProgress currentAmount={houseData.rent - tenantInfo.depositOwed} finalPrice={houseData.rent} />
								}
							</Card>
						)
					}

					{
						tenantInfo && (
							<Card>
								<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Payment</CustomizedText>
								{
									getMonthsBetween(tenantInfo.moveInDate).map((month, index, months) => {
										const matchingTransactions = transactionData.filter(transaction => transaction.month === month)
										const totalAmount = matchingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
										let carryover = 0
										let displayedAmount = totalAmount

										if (totalAmount > houseData.rent) {
											carryover = totalAmount - houseData.rent;
											displayedAmount = houseData.rent;
										}

										if (carryover > 0 && index + 1 < months.length) {
											const nextMonth = months[index + 1];
											db.runAsync('INSERT INTO transactions (tenantId, month, amount, year) VALUES(?, ?, ?, ?)', [tenantInfo.id, nextMonth, carryover, 2024])
											tenantInfo.rentOwed = (tenantInfo.rentOwed || 0) + carryover;
										}

										if (displayedAmount >= houseData.rent) {
											return null;
										}

										return (
											<Fragment key={index}>
												<CustomizedText>Month of {month}</CustomizedText>
												<PaymentProgress currentAmount={displayedAmount} finalPrice={houseData.rent} />
												{carryover > 0 && <CustomizedText>Carryover to next month: {carryover}</CustomizedText>}
											</Fragment>
										)
									})
								}
							</Card>
						)
					}

					{
						Object.keys(tenantInfo).length !== 0 && (
							<Card>
								<View style={{ flexDirection: 'row' }}>
									<View style={ style.viewHead }>
										<CustomizedText textStyling={style.expected}>Monthly Expected</CustomizedText>
										<CustomizedText textStyling={style.amount}>Ksh {new Intl.NumberFormat().format(monthlyExpected)}</CustomizedText>
									</View>
									<View style={[style.viewHead, { alignItems: 'flex-end'}]}>
										<CustomizedText textStyling={style.expected}>Total Overdue</CustomizedText>
										<CustomizedText textStyling={style.amount}>{`Ksh ${new Intl.NumberFormat().format(totalOverDue)}`}</CustomizedText>
									</View>
								</View>
							</Card>
						)
					}
				</View >
			</ScrollView >

			<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} duration={Snackbar.DURATION_SHORT} children={snackbarMsg} style={style.snackBar} />

			<Portal>
				<Modal visible={modalVisibility} onDismiss={closeModal} style={{ margin: 20 }}>
					{modalAction == 'add' && <AddTenant houseId={houseId} plotId={Number(plotId)} houseRent={houseData.rent} closeAddTenantModal={closeModal}  setSnackbarMsg={setSnackbarMsg} onOpenSnackBar={onOpenSnackBar} setTenantId={setNewTenantId}/>}
					{modalAction == 'edit' && <EditTenant tenantId={tenantInfo.id} openSnackBar={onOpenSnackBar} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} />}
					{modalAction == 'delete' && <DeleteTenant tenantInfo={tenantInfo} plotId={Number(plotId)} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} onOpenSnackBar={onOpenSnackBar} />}
					{modalAction == 'payment' && <Payment tenantInfo={tenantInfo} plotId={Number(plotId)} openSnackBar={onOpenSnackBar} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} />}
				</Modal>
			</Portal>

			<FAB.Group
				open={open}
				visible={snackBarVisibility ? false : true}
				icon={open ? 'cancel' : 'arrow-up'}
				actions={renderActions()}
				onStateChange={onStateChange}
			/>
		</>
	)
}

export default housePage


export const getHousePageStyles = (theme: MD3Theme) => StyleSheet.create({
	view: {
		flex: 1,
		gap: 10,
	},
	scrollView: {
		padding: 10,
		backgroundColor: theme.colors.surface
	},
	tenantInfoView: {
		flexDirection: 'row',
	},
	nameNumberView: {
		flex: 1,
		justifyContent: 'center'
	},
	name: {
		fontSize: bigNumberFontSize - 30,
	},
	occupation: {
		fontSize: theme.fonts.bodyMedium.fontSize,
		color: theme.colors.onSurfaceDisabled,
		marginTop: 5,
		marginBottom: 15,
	},
	number: {
		fontSize: appFontSize,
	},
	pieView: {
		flex: 1,
		alignItems: 'flex-end',
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
	snackBar: {
		margin: 20,
		backgroundColor: theme.colors.secondary
	},

	viewHead: {
		flex: 1,
		paddingVertical: 10,
		gap: 5
	},
	expected: {
		fontSize: theme.fonts.bodySmall.fontSize,
		color: theme.colors.onSurfaceDisabled,
	},
	amount: {
		fontFamily: 'DefaultCustomFont-Bold',
		fontSize: theme.fonts.headlineSmall.fontSize,
	},
})