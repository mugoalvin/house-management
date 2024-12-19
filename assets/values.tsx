export const appFontSize = 16
export const titleFontSize = 24
export const bigNumberFontSize = 70
export const cardTitleFontSize = 24
export const plotNameFontSize = 24

export const ellipsisVerticalSize = 20
export const iconSize = 20

// export function calculateTimeDuration(date: Date): string {
// 	const dateString = new Date(date)

// 	if (date == null)
// 		return 'Invalid Date'

// 	// const [month, day, year] = dateString.split('/').map(Number);
// 	const [month, day, year] = [dateString.getMonth() + 1, dateString.getDay(), dateString.getFullYear()]
// 	const parsedDate = new Date(`${year}-${month}-${day}`);
// 	const currentDate = new Date()

// 	if (isNaN(parsedDate.getTime()))
// 		return 'Invalid Date'

// 	let years = currentDate.getFullYear() - parsedDate.getFullYear();
// 	let months = currentDate.getMonth() - parsedDate.getMonth();
// 	let days = currentDate.getDate() - parsedDate.getDate();

// 	// Adjust if the current day is earlier than the parsed day
// 	if (days < 0) {
// 		months--;
// 		days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate(); // Days in the previous month
// 	}

// 	// Adjust if the current month is earlier than the parsed month
// 	if (months < 0) {
// 		years--;
// 		months += 12;
// 	}

// 	let result = '';
// 	if (years > 0) {
// 		result += `${years} year${years > 1 ? 's' : ''} `;
// 	}
// 	if (months > 0) {
// 		result += `${months} month${months > 1 ? 's' : ''} `;
// 	}
// 	if (days > 0 && result === '') { // Only add days if no years or months
// 		result += `${days} day${days > 1 ? 's' : ''}`;
// 	}

// 	return result.trim() || '0 days'; // Return "0 days" if no time difference
// }

export function calculateTimeDuration(dateString: Date): string {
	const parsedDate = new Date(dateString);
	if (isNaN(parsedDate.getTime())) {
		return 'Invalid Date';
	}

	const currentDate = new Date();

	let years = currentDate.getFullYear() - parsedDate.getFullYear();
	let months = currentDate.getMonth() - parsedDate.getMonth();
	let days = currentDate.getDate() - parsedDate.getDate();

	if (days < 0) {
		months--;
		days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
	}

	if (months < 0) {
		years--;
		months += 12;
	}

	const totalDaysDifference = Math.floor(
		(currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	if (totalDaysDifference < 7) {
		return `${totalDaysDifference} day${totalDaysDifference > 1 ? 's' : ''}`;
	} else if (totalDaysDifference < 30) {
		const weeks = Math.floor(totalDaysDifference / 7);
		return `${weeks} week${weeks > 1 ? 's' : ''}`;
	} else {
		const totalMonths = years * 12 + months;
		return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
	}
}

export const getMonthsBetween = (moveInDate: Date | string): string[] => {
	try {
		const months: string[] = []
		const currentDate = new Date();
		const moveIn = new Date(moveInDate)

		// Loop through each month between moveInDate and the current month
		while (moveIn <= currentDate) {
			const monthName = moveIn.toLocaleString('default', { month: 'long' });
			months.push(monthName);
			moveIn.setMonth(moveIn.getMonth() + 1); // Increment to the next month
		}

		return months;
	}
	catch(e) {
		console.error(e)
		return []
	}
}