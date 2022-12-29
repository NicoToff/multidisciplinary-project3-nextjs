import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";

import type { EntranceLogResData, EntranceLogValidRow } from "../../types/api/entranceLog";

export default async function handler(req: NextApiRequest, res: NextApiResponse<EntranceLogResData>) {
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
        const entranceLogs = await prisma.entranceLog.findMany({
            orderBy: {
                timestamp: "desc",
            },
        });
        const employees = await prisma.employee.findMany({
            where: {
                id: {
                    in: entranceLogs.map((entranceLog) => entranceLog.employeeId),
                },
            },
        });

        const generatedRows: EntranceLogValidRow[] = entranceLogs.map((entranceLog) => {
            const employee = employees.find((employee) => employee.id === entranceLog.employeeId);
            return {
                id: entranceLog.id,
                name: `${employee?.lastName}, ${employee?.firstName}`,
                timestamp: entranceLog.timestamp,
                timeAgo: entranceLog.timestamp,
            } satisfies EntranceLogValidRow;
        });

        res.status(200).json({ message: "OK", generatedRows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
