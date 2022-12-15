const prisma = require("../prisma/prisma.js");

module.exports = async function findEpc(epc) {
    // Add the epc to the database if it doesn't exist
    const promises = epc.map(epc => {
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
    console.log("🚀 ~ file: findEpc.js:18 ~ findEpc ~ scannedRfidTags", scannedRfidTags);

    // Find all the items that are associated to the rfid tags
    const items = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: scannedRfidTags.map(tag => tag.id),
            },
        },
    });
    console.log("🚀 ~ file: findEpc.js:29 ~ findEpc ~ items", items);

    // Find all employees whose id appear in "items" in their employeeId field
    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: items.map(item => item.employeeId),
            },
        },
    });
    console.log("🚀 ~ file: findEpc.js:39 ~ findEpc ~ employees", employees);

    const itemsWithInfo = items.map(item => {
        const relatedEmployee = employees.find(employee => employee.id === item.employeeId);
        return {
            epc: scannedRfidTags.find(rfidTag => rfidTag.id === item.rfidTagId)?.epc || "Unknown",
            itemName: item.name,
            firstName: relatedEmployee?.firstName || "Unknown",
            lastName: relatedEmployee?.lastName || "Unknown",
        };
    });
    console.log("🚀 ~ file: findEpc.js:49 ~ itemsWithInfo ~ itemsWithInfo", itemsWithInfo);

    // TODO: The return can be different from the NEXT.js app
    const completeItemRecords = [
        ...itemsWithInfo,
        ...scannedRfidTags.filter(rfidTag => {
            return !items.find(item => item.rfidTagId === rfidTag.id);
        }),
    ];
    console.log("🚀 ~ file: findEpc.js:57 ~ findEpc ~ completeItemRecords", completeItemRecords);

    return completeItemRecords;
};
