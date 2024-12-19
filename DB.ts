const plotCommand : string = `CREATE TABLE IF NOT EXISTS plots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plotName TEXT NOT NULL,
    numberOfHouses INTEGER NOT NULL,
    houseType TEXT NOT NULL,
    rentPrice INTEGER NOT NULL,
    details TEXT,
    paidHouses INTEGER DEFAULT 0,
    amountPaid INTEGER DEFAULT 0,
    numberOccupiedHouses INTEGER DEFAULT 0
);`

const housesCommand : string = `CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plotId INTEGER,
    houseNumber TEXT,
    tenantId INTEGER,
    isOccupied BOOLEAN,
    houseType TEXT,
    rent INTEGER,
    FOREIGN KEY (plotId) REFERENCES plots (id),
    FOREIGN KEY (tenantId) REFERENCES tenants (id)
);`

const tenantsCommand : string = `CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    houseId INTEGER NOT NULL,
    tenantName TEXT NOT NULL,
    contactInfo TEXT,
    moveInDate DATE,
    occupation TEXT,
    rentOwed INTEGER DEFAULT 0,
    depositOwed INTEGER DEFAULT 0
);`

const transactionsCommand: string = `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tenantId INTEGER NOT NULL,
    month INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    year INTEGER NOT NULL,
    transactionDate DATE,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);`

export  const tableCreationCommands: string[] = [plotCommand, housesCommand, tenantsCommand, transactionsCommand]