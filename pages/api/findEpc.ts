// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import { RfidTag } from "@prisma/client";

import type { FindEpcReqData, FindEpcResData } from "../../types/api/findEpc";
import type { ItemRecord } from "../../types/itemRecord";

export default async function handler(req: NextApiRequest, res: NextApiResponse<FindEpcResData>) {
    const { epc } = req.body as FindEpcReqData;
    const itemRecords: ItemRecord[] = [];

    if (!epc) {
        res.status(204).json({ message: "No Content", itemRecords });
        return;
    }

    console.log(`Received ${epc.length} epc(s).`);

    // Add the epc to the database if it doesn't exist
    const promises = epc.map((epc) => {
        itemRecords.push({ epc });
        return prisma.rfidTag.upsert({
            where: {
                epc,
            },
            update: {}, // We only update the timestamp (automatically)
            create: {
                epc,
            },
        });
    });

    const rfidTagsInDB: RfidTag[] = await Promise.all(promises);

    const items = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: rfidTagsInDB.map((rfidTag) => rfidTag.id),
            },
        },
    });

    // Add the item.name to the appropriate itemRecord, find it thanks to id found in rfidTagsInDB
    items.forEach((item) => {
        const itemRecord = itemRecords.find(
            (itemRecord) => itemRecord.epc === rfidTagsInDB.find((rfidTag) => rfidTag.id === item.rfidTagId)?.epc
        );
        if (itemRecord) {
            itemRecord.itemName = item.name;
        }
    });

    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: items.map((item) => item.employeeId),
            },
        },
    });

    // Add the employee.firstName and employee.lastName to the appropriate itemRecord, find it thanks to id found in items
    employees.forEach((employee) => {
        const itemRecord = itemRecords.find(
            (itemRecord) =>
                itemRecord.epc ===
                rfidTagsInDB.find(
                    (rfidTag) => rfidTag.id === items.find((item) => item.employeeId === employee.id)?.rfidTagId
                )?.epc
        );
        if (itemRecord) {
            itemRecord.firstName = employee.firstName;
            itemRecord.lastName = employee.lastName;
        }
    });

    res.status(200).json({ message: "OK", itemRecords });
}
