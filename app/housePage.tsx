import { View, useColorScheme, ScrollView, StyleSheet, ToastAndroid, Linking, Pressable } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import Card, { getCardStyle } from '@/component/Card'
import CustomizedText from '@/component/CustomizedText'
import { appFontSize, bigNumberFontSize, calculateTimeDuration, getMonthsBetween } from '@/assets/values'
import { PieChart, PieChartPro } from 'react-native-gifted-charts'
import { useSQLiteContext } from 'expo-sqlite'
import { Fragment, useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import { ActivityIndicator, FAB, Icon, MD3Theme, Modal, Portal, Snackbar, useTheme } from 'react-native-paper'
import AddTenant from '@/component/AddTenant'
import DeleteTenant from '@/component/DeleteTenant'
import Payment from '@/component/Payment'
import { transactionDBProp } from "@/assets/transactions"
import PaymentProgress from "@/component/PaymentProgress"
import EditTenant from '@/component/EditTenant'
import { CombinedHouseTenantData } from './plotPage'
import { collection, doc, getDocs, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { firestore } from '@/firebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ConfirmView from '@/component/ConfirmView'
import { tenantProps } from '@/assets/tenants'


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
	const { houseId, plotName, house, plotid } = useLocalSearchParams()
	const plotId = plotid as string
	const houseData = house ? JSON.parse(house as string) : {}
	const [houseDataDB, setHouseDataDB] = useState<CombinedHouseTenantData>(houseData)
	const [modalVisibility, setModalVisibility] = useState<boolean>(false)
	const [transactionData, setTransactionData] = useState<transactionDBProp[]>([])
	const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete' | 'payment' | null>(null)
	const [snackbarMsg, setSnackbarMsg] = useState<string>()
	const [monthlyExpected, setMonthlyExpected] = useState<number>(0)
	const [totalOverDue, setTotalOverDue] = useState<number>(0)
	const [userId, setUserId] = useState<string>()
	const [monthsLivedInHouse, setMonthsLivedInHouse] = useState<number>(0)
	const [durationLabel, setDurationLabel] = useState<string>()
	const [pieData, setPieData] = useState<{ value: number, color: string }[]>([])
	const [tenantAdded, setTenantAdded] = useState<boolean>(false)


	const [fabOpen, setFabOpen] = useState({ open: false })
	const onStateChange = ({ open }: any) => setFabOpen({ open })
	const { open } = fabOpen

	const [snackBarVisibility, setSnackBarVisibility] = useState(false)
	const onOpenSnackBar = () => setSnackBarVisibility(true)
	const onDismissSnackBar = () => setSnackBarVisibility(false)

	async function updateHouseData() {
		try {
			if (userId && plotId && houseId && houseData.tenants.length > 0) {
				const houseRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}`);
				const tenantRef = doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${houseData.tenants[0].id}`);

				const houseDoc = await getDoc(houseRef);
				const tenantDoc = await getDoc(tenantRef);

				if (houseDoc.exists() && tenantDoc.exists()) {
					const mergedData: CombinedHouseTenantData = {
						// @ts-ignore
						house: { houseId: houseDoc.id, ...(houseDoc.data() as Partial<houseDataProps>) },
						// @ts-ignore
						tenants: [{ id: tenantDoc.id, ...(tenantDoc.data() as Partial<tenantProps>) }]
					}

					setHouseDataDB(mergedData)
				} else {
					console.error('Document does not exist');
				}
			}
		} catch (error) {
			console.error('Error updating house data:', error);
		}
	}

	function getMonthlyExpected(): number {
		if (houseDataDB.tenants[0] == undefined) {
			return 0
		}
		else {
			let monthExpected = houseDataDB.tenants[0].rentOwed || 0
			while (monthExpected > houseDataDB.house.rent) {
				monthExpected -= houseDataDB.house.rent
			}
			return monthExpected
		}
	}

	function getTotalOverDue(): number {
		if (houseDataDB.tenants[0] == undefined) {
			return 0
		}
		return (houseDataDB.tenants[0].depositOwed as number) + (houseDataDB.tenants[0].rentOwed as number)
	}

	const openModal = (action: 'add' | 'edit' | 'delete' | 'payment') => {
		setModalAction(action)
		setModalVisibility(true)
	}

	const closeModal = () => {
		setModalVisibility(false)
	}

	const getUserId = async () => {
		await AsyncStorage.getItem('userId')
			.then((id) => {
				setUserId(id?.toString())
			})
	}


	const getTenantsPayment = async () => {
		if (houseDataDB.tenants[0]) {
			try {
				const transactions: transactionDBProp[] = []
				if (userId)
					await getDocs(collection(firestore, `/users/${userId}/plots/${plotId as string}/houses/${houseId}/tenants/${houseDataDB.tenants[0].id}/transactions`))
						.then(transactionsSnapShot => {
							// @ts-ignore
							transactionsSnapShot.forEach(doc => {
								// @ts-ignore
								transactions.push({ id: doc.id, ...doc.data() })
							})
							setTransactionData(transactions)
						})
			}
			catch (e) {
				// ToastAndroid.show('Failed To Fetch Transactions', ToastAndroid.SHORT)
				setSnackbarMsg('Failed To Fetch Transactions')
				onOpenSnackBar()
			}
		}
	}

	const getTenantsData = () => {
		if (houseDataDB.tenants[0]) {
			const tenantDocRef = doc(firestore, `/users/${userId}/plots/${plotId as string}/houses/${houseId}/tenants/${houseDataDB.tenants[0].id}`)
			onSnapshot(tenantDocRef, (tenantDoc) => {
				if (tenantDoc.exists()) {
					const tenantData = tenantDoc.data() as tenantProps;
					setHouseDataDB(prevData => ({
						...prevData,
						tenants: [{ ...tenantData, id: tenantDoc.id }],
					}));
				}
			});
		}
	}

	useEffect(() => {
		navigation.setOptions({
			title: plotName + ' - House ' + houseDataDB.house.houseNumber,
		})
		getUserId()
	}, [])

	useEffect(() => {
		setMonthlyExpected(getMonthlyExpected())
		setTotalOverDue(getTotalOverDue())

		const time = houseDataDB.tenants.length > 0 && houseDataDB.tenants[0].moveInDate ? calculateTimeDuration(new Date(houseDataDB.tenants[0].moveInDate)) : "2 days"
		setMonthsLivedInHouse(Number(time.split(' ')[0]))
		setDurationLabel(time.split(' ')[1] as 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months' | 'year' | 'years')
	}, [houseDataDB])

	useEffect(() => {
		updateHouseData()
		getTenantsPayment()

		if (userId && plotId && houseId && houseDataDB.tenants.length > 0) {
			const houseDocRef = doc(firestore, `/users/${userId}/plots/${plotId as string}/houses/${houseId}`)
			const houseCollRef = collection(firestore, `/users/${userId}/plots/${plotId as string}/houses/${houseId}/tenants`)
			const tenantDocRef = doc(firestore, `/users/${userId}/plots/${plotId as string}/houses/${houseId}/tenants/${houseDataDB.tenants[0].id}`)

			const unsubscribeHouse = onSnapshot(houseDocRef, (doc) => {
				if (doc.exists()) {
					const houseData = doc.data() as houseDataProps
					setHouseDataDB(prevData => ({
						...prevData,
						house: { ...prevData.house, ...houseData, houseId: doc.id },
					}));
				}
			})

			const unsubscribeHouseColl = onSnapshot(houseCollRef, (snapshot) => {
				const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as tenantProps))
				setHouseDataDB(prevData => ({
					...prevData,
					tenants: tenants
				}))
			})

			const unsubscribeTenant = onSnapshot(tenantDocRef, (tenantDoc) => {
				if (tenantDoc.exists()) {
					const tenantData = tenantDoc.data() as tenantProps;
					setHouseDataDB(prevData => ({
						...prevData,
						tenants: [{ ...tenantData, id: tenantDoc.id }],
					}));
				}
			});
			return () => {
				unsubscribeHouse()
				unsubscribeHouseColl()
				unsubscribeTenant()
			}
		}
	}, [userId, plotId, houseId])

	useEffect(() => {
		const valueToCalc =
			(durationLabel == 'year' || durationLabel == 'years') ? 5 :
				(durationLabel == 'month' || durationLabel == 'months') ? 12 :
					(durationLabel == 'day' || durationLabel == 'days') ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() : 0

		setPieData([
			{ value: monthsLivedInHouse, color: theme.colors.primary },
			{ value: valueToCalc - monthsLivedInHouse, color: colorScheme == 'dark' ? theme.colors.surface : theme.colors.primary }
		])
	}, [monthsLivedInHouse, durationLabel])

	useFocusEffect(
		useCallback(() => {
			if (tenantAdded)
			getTenantsData()
			setTenantAdded(false)
		}, [tenantAdded])
	)

	const renderActions = () => {
		if (houseDataDB.tenants.length === 0) {
			return [{ icon: 'plus', label: 'Add Tenant', onPress: () => openModal('add') }]
		} else {
			return [
				{ icon: 'cash', label: 'Payment', onPress: () => openModal('payment') },
				{ icon: 'email', label: 'Edit', onPress: () => openModal('edit') },
				{ icon: 'delete', label: 'Delete', onPress: () => openModal('delete') }
			]
		}
	}

	(houseDataDB.tenants == undefined || houseDataDB.tenants.length == 0) &&
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
					<>
						<Card>
							{/* <Pressable> */}
						<Pressable onPress={() => router.push('/tenantPage') }>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
									<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>{houseDataDB.tenants.length != 0 ? 'Current Tenant' : 'Vacant House'}</CustomizedText>
									<CustomizedText>{houseDataDB.house.houseType}</CustomizedText>
								</View>

								{
									houseDataDB.tenants.length != 0 &&
									<View style={style.tenantInfoView}>
										<View style={style.nameNumberView}>
											<CustomizedText textStyling={style.name}>{`${houseDataDB.tenants[0].firstName} ${houseDataDB.tenants[0].lastName}`}</CustomizedText>
											<CustomizedText textStyling={style.occupation}>{houseDataDB.tenants[0].occupation}</CustomizedText>
											<Pressable style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }} onPress={() => houseDataDB.tenants[0].contactInfo && handlePhoneClick(houseDataDB.tenants[0].contactInfo)}>
												<Icon source='phone' size={16} />
												<CustomizedText textStyling={style.number}>{houseDataDB.tenants[0].contactInfo}</CustomizedText>
											</Pressable>
										</View>
										<View style={style.pieView}>
											<PieChart
												donut
												radius={60}
												innerRadius={55}
												innerCircleColor={theme.colors.elevation.level1}
												data={pieData || [{ value: 0, color: theme.colors.elevation.level1 }]}
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
							houseDataDB.tenants[0] && (
								<Card>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
										<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText} >Deposit</CustomizedText>

										{
											houseDataDB.tenants[0].depositOwed == 0 && (
												<View style={{ flexDirection: 'row', gap: 10 }}>
													<Icon size={20} source='check-all' color='#4caf50' />
													<CustomizedText>Paid</CustomizedText>
												</View>
											)
										}
									</View>
									{
										houseDataDB.tenants.length != 0 && houseDataDB.tenants[0].depositOwed != 0 &&
										<PaymentProgress currentAmount={houseDataDB.house.rent - (houseDataDB.tenants[0].depositOwed ? houseDataDB.tenants[0].depositOwed : 0) } finalPrice={houseDataDB.house.rent} />
									}
								</Card>
							)
						}

						{
							houseDataDB.tenants[0] && (
								<Card>
									<CustomizedText textStyling={getCardStyle(colorScheme, theme).cardHeaderText}>Payment</CustomizedText>
									{
										getMonthsBetween(houseDataDB.tenants[0].moveInDate || new Date()).map((month, index, months) => {
											const matchingTransactions = transactionData.filter(transaction => transaction.month === month)
											const totalAmount = matchingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
											let carryover = 0
											let displayedAmount = totalAmount

											if (totalAmount > houseDataDB.house.rent) {
												carryover = totalAmount - houseDataDB.house.rent;
												displayedAmount = houseDataDB.house.rent;
											}

											if (carryover > 0 && index + 1 < months.length) {
												const nextMonth = months[index + 1];
												setDoc(doc(firestore, `/users/${userId}/plots/${plotId}/houses/${houseId}/tenants/${houseDataDB.tenants[0].id}/transactions`), {
													month: nextMonth,
													amount: carryover,
													year: new Date().getFullYear()
												})

												houseDataDB.tenants[0].rentOwed = (houseDataDB.tenants[0].rentOwed || 0) + carryover;
											}

											if (displayedAmount >= houseDataDB.house.rent) {
												return null;
											}

											return (
												<Fragment key={index}>
													<CustomizedText>Month of {month}</CustomizedText>
													<PaymentProgress currentAmount={displayedAmount} finalPrice={houseDataDB.house.rent} />
													{carryover > 0 && <CustomizedText>Carryover to next month: {carryover}</CustomizedText>}
												</Fragment>
											)
										})
									}
								</Card>
							)
						}

						{
							houseDataDB.tenants.length !== 0 && (
								<Card>
									<View style={{ flexDirection: 'row' }}>
										<View style={style.viewHead}>
											<CustomizedText textStyling={style.expected}>Monthly Expected</CustomizedText>
											<CustomizedText textStyling={style.amount}>Ksh {new Intl.NumberFormat().format(monthlyExpected)}</CustomizedText>
										</View>
										<View style={[style.viewHead, { alignItems: 'flex-end' }]}>
											<CustomizedText textStyling={style.expected}>Total Overdue</CustomizedText>
											<CustomizedText textStyling={style.amount}>{`Ksh ${new Intl.NumberFormat().format(totalOverDue)}`}</CustomizedText>
										</View>
									</View>
								</Card>
							)
						}
					</>
				</View >
			</ScrollView >

			<Snackbar visible={snackBarVisibility} onDismiss={onDismissSnackBar} duration={Snackbar.DURATION_SHORT} children={snackbarMsg} style={style.snackBar} />

			<Portal>
				<Modal visible={modalVisibility} onDismiss={closeModal} style={{ margin: 20 }}>
					{modalAction == 'add' && 
					<AddTenant houseId={houseId as string} plotId={plotId as string} houseRent={houseDataDB.house.rent} closeAddTenantModal={closeModal} setSnackbarMsg={setSnackbarMsg} openSnackBar={onOpenSnackBar} tenantAdded={setTenantAdded} />}
					{modalAction == 'edit' && <EditTenant tenantId={houseDataDB.tenants[0].id || ''} openSnackBar={onOpenSnackBar} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} />}
					{modalAction == 'delete' && houseDataDB.tenants[0]?.id && <DeleteTenant tenantInfo={houseDataDB.tenants[0] as tenantProps} plotId={Number(plotId)} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} onOpenSnackBar={onOpenSnackBar} />}
					{modalAction == 'payment' && <Payment userId={userId || ''} plotId={plotId} houseData={houseData} openSnackBar={onOpenSnackBar} closeModal={closeModal} setSnackbarMsg={setSnackbarMsg} />}
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