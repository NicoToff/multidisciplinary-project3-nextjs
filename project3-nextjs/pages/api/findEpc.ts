// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import { Employee, Item, RfidTag } from "@prisma/client";

import type { FindEpcReqData, FindEpcResData } from "../../types/api/findEpc";
import type { ItemRecord } from "../../types/itemRecord";

export default async function findEpc(req: NextApiRequest, res: NextApiResponse<FindEpcResData>) {
    const { epc: epcs } = req.body as FindEpcReqData;

    if (!epcs) {
        res.status(204).json({ message: "No Content", itemRecords: undefined });
        return;
    }

    // Add the epc to the database if it doesn't exist
    const promises = epcs.map((epc) => {
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

    /** All items that contain a tag from `scannedRfidTags` */
    const itemsScanned = await prisma.item.findMany({
        where: {
            rfidTagId: {
                in: scannedRfidTags.map((tag) => tag.id),
            },
        },
    });

    /** All employees whose id appear in `itemsScanned` */
    const employees = await prisma.employee.findMany({
        where: {
            id: {
                in: itemsScanned.map((item) => item.employeeId),
            },
        },
    });

    const itemsWithInfo: ItemRecord[] = itemsScanned.map((item) => {
        const relatedEmployee = employees.find((employee) => employee.id === item.employeeId);
        return {
            epc: scannedRfidTags.find((rfidTag) => rfidTag.id === item.rfidTagId)?.epc || "Unknown",
            itemName: item.name,
            isMandatory: Boolean(item.isMandatory),
            firstName: relatedEmployee?.firstName || "Unknown",
            lastName: relatedEmployee?.lastName || "Unknown",
        };
    });

    const completeItemRecords: ItemRecord[] = [
        ...itemsWithInfo,
        ...scannedRfidTags
            .filter((rfidTag) => {
                return !itemsScanned.find((item) => item.rfidTagId === rfidTag.id);
            })
            .map((rfidTag) => ({ epc: rfidTag.epc } satisfies ItemRecord)),
    ];

    res.status(200).json({ message: "OK", itemRecords: completeItemRecords });
}
