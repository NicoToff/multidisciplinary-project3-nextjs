import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";
import type { DeleteItemReqData, DeleteItemResData } from "../../types/api/deleteItem";

export default async function handler(req: NextApiRequest, res: NextApiResponse<DeleteItemResData>) {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
    // #endregion

    const { itemId } = req.body as DeleteItemReqData;
    if (!itemId || isNaN(parseInt(itemId))) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    try {
        await prisma.item.deleteMany({
            where: {
                id: parseInt(itemId),
            },
        });
        res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Bad Request" });
    }
}
