export type  tenantProps = {
    id: number
    houseId: number
    tenantName: string
    contactInfo: string
    moveInDate: Date
    occupation: string
    rentOwed: number
    depositOwed: number
}

export type tenantFormProps = tenantProps & {
    firstName: string
    lastName: string
}

export type tenantsColumns = {
    id: 'Id',
    houseId: 'House Id',
    tenantName: 'Name',
    contactInfo: 'Contacts',
    moveInDate: 'Date Entered',
    occupation: 'Occupation'
    rentOwed: 'Dept'
}

// Create a mapping object for easy reference.
export const tenantsColumns = {
    id: { title: 'Id', flexBasisNo: 7 },
    houseId: { title: 'House No.', flexBasisNo: 20 },
    tenantName: { title: 'Name', flexBasisNo: 25 },
    contactInfo: { title: 'Contacts', flexBasisNo: 25 },
    moveInDate: { title: 'Date Entered', flexBasisNo: 23 },
    occupation: {title: 'Occupation', flexBasisNo: 0},
    rentOwed: {title: 'Debt', flexBasisNo: 0}
}