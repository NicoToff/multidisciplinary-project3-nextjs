import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";

import type { EspLastContactResData } from "../../types/api/espLastContactDate";

export default async function handler(req: NextApiRequest, res: NextApiResponse<EspLastContactResData>) {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
    // #endregion

    try {
        const espContact = await prisma.espContact.findMany({});

        if (espContact.length === 0) {
            res.status(404).json({ message: "Not Found" });
            return;
        }

        res.status(200).json({ message: "OK", lastContact: espContact[0].lastContact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
