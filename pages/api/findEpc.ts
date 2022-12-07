// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import { RfidTag } from "@prisma/client";

import type { FindEpcReqData, FindEpcResData } from "../../types/api/findEpc";

export default async function handler(req: NextApiRequest, res: NextApiResponse<FindEpcResData>) {
    const { epc } = req.body as FindEpcReqData;

    if (!epc) {
        res.status(204).json({ message: "No Content" });
        return;
    }

    console.log(`Received ${epc.length} epc(s).`);

    // Add the epc to the database if it doesn't exist
    const promises = epc.map((epc) => {
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

    const rfidTagWithItem = await prisma.rfidTag.findMany({
        where: {
            epc: {
                in: rfidTagsInDB.map((r) => r.epc),
            },
        },
        include: {
            Item: true,
        },
    });

    res.status(200).json({ message: "OK" });
}
