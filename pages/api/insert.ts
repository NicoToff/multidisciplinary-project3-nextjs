// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import type { InsertReqData, InsertResData } from "../../types/api/insert";

export default async function handler(req: NextApiRequest, res: NextApiResponse<InsertResData>) {
    const { epc, firstName, lastName, itemName } = req.body as InsertReqData;

    if (!(isOk(firstName) && isOk(lastName) && isOk(itemName) && isOk(epc))) {
        res.status(400).json({ name: "Bad Request" });
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

    // Create a new item with itemName, or fetch the existing one
    let item = await prisma.item.findFirst({
        where: {
            name: itemName,
            employeeId: employee.id,
        },
    });

    if (!item) {
        console.log("Creating new item");
        item = await prisma.item.create({
            data: {
                epc,
                name: itemName,
                employeeId: employee.id,
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
                epc,
                name: itemName,
                employeeId: employee.id,
                timestamp: new Date(),
            },
        });
    }

    console.log(item);

    res.status(200).json({ name: "John Doe" });
}

function isOk(str: string | null) {
    return str ? str.trim() !== "" : false;
}
