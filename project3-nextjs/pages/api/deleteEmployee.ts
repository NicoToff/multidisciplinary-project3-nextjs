import { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";

import type { DeleteEmployeeReqData, DeleteEmployeeResData } from "../../types/api/deleteEmployee";

export default async function deleteEmployee(req: NextApiRequest, res: NextApiResponse<DeleteEmployeeResData>) {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
    // #endregion

    const { employeeId } = req.body as DeleteEmployeeReqData;

    if (!employeeId || isNaN(Number(employeeId))) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    try {
        // Delete all items that belong to the employee (if any are left, somehow)
        await prisma.item.deleteMany({
            where: {
                employeeId: Number(employeeId),
            },
        });
        // Delete the managerPhoneNumbers that belongs to the employee (if any)
        await prisma.managerPhoneNumber.deleteMany({
            where: {
                employeeId: Number(employeeId),
            },
        });
        // Delete all the entrance logs for the employee (if any)
        await prisma.entranceLog.deleteMany({
            where: {
                employeeId: Number(employeeId),
            },
        });
        // Delete the employee
        await prisma.employee.deleteMany({
            where: {
                id: Number(employeeId),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }

    res.status(200).json({ message: "OK" });
}
