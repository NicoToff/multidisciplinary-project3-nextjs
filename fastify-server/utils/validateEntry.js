export async function validateEntry(epcs) {
    // Add the epc to the database if it doesn't exist
    const promises = epcs.map(epc => {
        return prisma.rfidTag.upsert({
            where: {
                epc,
            },
            update: { lastScanned: new Date() },
            create: {
                epc,
            },
        });
    });

    const scannedRfidTags = await Promise.all(promises);

    /** All items that contain a tag from `scannedRfidTags` */
    const itemsScanned = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: scannedRfidTags.map(tag => tag.id),
            },
        },
    });

    /** All employees whose id appear in `itemsScanned` */
    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: itemsScanned.map(item => item.employeeId),
            },
        },
    });

    // Fetches all items in the database
    const itemsFromDB = await prisma.item.findMany({});

    /**
     * We create a JS object for each employee and their items.
     * We determine if they can enter or not by checking if all mandatory items are scanned.
     * The equivalent Typescript type for this object is:
        ```
        type EmployeeWithItems = {
            employee: Employee;
            itemsScanned: Item[];
            allItems: Item[];
            canEnter: boolean;
        }
        ```
     */
    const employeesWithItems /* : EmployeeWithItems[] */ = employees.map(employee => {
        const allItems = itemsFromDB.filter(item => item.employeeId === employee.id);

        return {
            employee,
            itemsScanned: itemsScanned.filter(item => item.employeeId === employee.id),
            allItems,
            canEnter: allItems.every(item => {
                if (item.isMandatory) {
                    return itemsScanned.find(scannedItem => scannedItem.id === item.id);
                }
                return true;
            }),
        };
    });

    return employeesWithItems;
}
