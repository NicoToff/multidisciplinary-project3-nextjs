"use strict";
import prisma from "../prisma/prisma.js";

export async function validateEntry(epcs) {
    /** All RFID tags in the database found from the `epc` string array */
    const scannedRfidTags = await prisma.rfidTag.findMany({
        where: {
            epc: {
                in: epcs,
            },
        },
    });
    /** All items that contain a tag included in the `scannedRfidTags` RfidTag[] array */
    const itemsScanned = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: scannedRfidTags.map(tag => tag.id),
            },
        },
    });

    /** All employees whose id appear in the `itemsScanned` Item[] array */
    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: itemsScanned.map(item => item.employeeId),
            },
        },
    });

    /** All Items in the database (Item[] array) */
    const itemsFromDB = await prisma.item.findMany({});

    /**
     * An array of JS object containing each employee and their items.
     * We determine if an employee can enter or not by checking if all mandatory their items are scanned.
     * For reference, the Typescript type for each object in the array is:
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
            canEnter: allItems.every(item =>
                item.isMandatory ? itemsScanned.find(scannedItem => scannedItem.id === item.id) : true
            ),
        };
    });

    return employeesWithItems;
}
