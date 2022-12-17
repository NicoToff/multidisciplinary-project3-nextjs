import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../prisma/prisma-client";

import type { DeleteEmployeeReqData, DeleteEmployeeResData } from "../../types/api/deleteEmployee";

export default async function deleteEmployee(req: NextApiRequest, res: NextApiResponse<DeleteEmployeeResData>) {
    try {
        const { employeeId } = req.body as DeleteEmployeeReqData;

        if (!employeeId || isNaN(Number(employeeId))) {
            res.status(400).json({ message: "Bad Request" });
            return;
        }

        const deletedEmployee = await prisma.employee.delete({
            where: {
                id: Number(employeeId),
            },
        });
        res.status(200).json({ message: "OK", employee: deletedEmployee });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error" });
    }
}
