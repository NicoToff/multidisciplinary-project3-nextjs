import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";
import type { DeleteItemReqData, DeleteItemResData } from "../../types/api/deleteItem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteItemResData>) {
    const { itemId } = req.body as DeleteItemReqData;
    if (!itemId || isNaN(parseInt(itemId))) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    const item = await prisma.item.delete({
        where: {
            id: parseInt(itemId),
        },
    });

    if (!item) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    res.status(200).json({ message: "OK", item });
}
