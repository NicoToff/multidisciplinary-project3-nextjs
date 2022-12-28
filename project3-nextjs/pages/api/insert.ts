// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";
import type { InsertReqData, InsertResData } from "../../types/api/insert";

export default async function handler(req: NextApiRequest, res: NextApiResponse<InsertResData>) {
    // Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }

    const { epc, firstName, lastName, itemName } = req.body as InsertReqData;
    const mandatoryString = validateAndFixMandatory((req.body as InsertReqData).isMandatory);
    const isMandatory = parseInt(mandatoryString);

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
                isMandatory,
                lastModified: new Date(),
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
                isMandatory,
                lastModified: new Date(),
            },
        });
    }

    console.log(item);

    res.status(200).json({ message: "OK", item, employee });
}

function isOk(str: string | null) {
    // This tests for alphanumeric characters, spaces, and the following special characters: _+-
    return str ? /^[a-zA-Z0-9 _àéèç'Œœ+-]+$/.test(str) : false;
}

function validateAndFixMandatory(num: string | undefined) {
    return num && (num === "0" || num === "1") ? num : "0";
}
