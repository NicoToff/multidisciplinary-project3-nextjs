// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import type { InsertReqData, InsertResData } from "../../types/api/insert";

export default async function handler(req: NextApiRequest, res: NextApiResponse<InsertResData>) {
    const { epc, firstName, lastName, itemName } = req.body as InsertReqData;
    const mandatoryString = validateAndFixMandatory((req.body as InsertReqData).mandatory);
    const mandatory = parseInt(mandatoryString);

    console.log(`firstName: ${firstName}`);
    console.log(`lastName: ${lastName}`);
    console.log(`itemName: ${itemName}`);
    console.log(`epc: ${epc}`);

    if (!(isOk(firstName) && isOk(lastName) && isOk(itemName) && isOk(epc))) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    let employee = await prisma.employee.findFirst({
        where: {
            firstName,
            lastName,
        },
    });

    if (!employee) {
        console.log("Creating new employee");
        employee = await prisma.employee.create({
            data: {
                firstName,
                lastName,
            },
        });
    }

    console.log(employee);

    // Find the RfidTag id in the database
    const { id: rfidTagId } = (await prisma.rfidTag.findFirst({
        where: {
            epc,
        },
        select: {
            id: true,
        },
    })) as { id: number };

    // Create a new item with itemName, or fetch the existing one
    // TODO: Check if the item is already assigned to another employee

    let item = await prisma.item.findFirst({
        where: {
            rfidTagId,
        },
    });

    if (!item) {
        console.log("Creating new item");
        item = await prisma.item.create({
            data: {
                rfidTagId,
                name: itemName,
                employeeId: employee.id,
                mandatory,
                timestamp: new Date(),
            },
        });
    } else {
        console.log("Updating existing item");
        item = await prisma.item.update({
            where: {
                id: item.id,
            },
            data: {
                rfidTagId,
                name: itemName,
                employeeId: employee.id,
                mandatory,
                timestamp: new Date(),
            },
        });
    }

    console.log(item);

    res.status(200).json({ message: "OK", item, employee });
}

function isOk(str: string | null) {
    // This tests for alphanumeric characters, spaces, and the following special characters: _+-
    return str ? /^[a-zA-Z0-9 _+-]+$/.test(str) : false;
}

function validateAndFixMandatory(num: string | undefined) {
    return num && (num === "0" || num === "1") ? num : "0";
}
