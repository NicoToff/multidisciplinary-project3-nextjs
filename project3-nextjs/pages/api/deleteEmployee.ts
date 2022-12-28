import { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";

import type { DeleteEmployeeReqData, DeleteEmployeeResData } from "../../types/api/deleteEmployee";

export default async function deleteEmployee(req: NextApiRequest, res: NextApiResponse<DeleteEmployeeResData>) {
    // Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
    const { employeeId } = req.body as DeleteEmployeeReqData;

    if (!employeeId || isNaN(Number(employeeId))) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    const managerPhoneNumber = await prisma.managerPhoneNumber.deleteMany({
        where: {
            employeeId: Number(employeeId),
        },
    });

    const deletedEmployee = await prisma.employee.delete({
        where: {
            id: Number(employeeId),
        },
    });
    res.status(200).json({ message: "OK", employee: deletedEmployee });
}
