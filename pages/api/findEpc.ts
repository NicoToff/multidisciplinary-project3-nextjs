// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import { RfidTag } from "@prisma/client";

import type { FindEpcReqData, FindEpcResData } from "../../types/api/findEpc";
import type { ItemRecord } from "../../types/itemRecord";

export default async function findEpc(req: NextApiRequest, res: NextApiResponse<FindEpcResData>) {
    const { epc } = req.body as FindEpcReqData;

    if (!epc) {
        res.status(204).json({ message: "No Content", itemRecords: undefined });
        return;
    }

    // Add the epc to the database if it doesn't exist
    const promises = epc.map((epc) => {
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

    const scannedRfidTags: RfidTag[] = await Promise.all(promises);

    // Find all the items that are associated to the rfid tags
    const items = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: scannedRfidTags.map((tag) => tag.id),
            },
        },
    });

    // Find all employees whose id appear in "items" in their employeeId field
    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: items.map((item) => item.employeeId),
            },
        },
    });

    const itemsWithInfo: ItemRecord[] = items.map((item) => {
        const relatedEmployee = employees.find((employee) => employee.id === item.employeeId);
        return {
            epc: scannedRfidTags.find((rfidTag) => rfidTag.id === item.rfidTagId)?.epc || "Unknown",
            itemName: item.name,
            firstName: relatedEmployee?.firstName || "Unknown",
            lastName: relatedEmployee?.lastName || "Unknown",
        };
    });

    const completeItemRecords: ItemRecord[] = [
        ...itemsWithInfo,
        ...scannedRfidTags.filter((rfidTag) => {
            return !items.find((item) => item.rfidTagId === rfidTag.id);
        }),
    ];

    res.status(200).json({ message: "OK", itemRecords: completeItemRecords });
}
