import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";
import type { InsertEmergencyReqData, InsertEmergencyResData } from "../../types/api/insertEmergency";

export default async function handler(req: NextApiRequest, res: NextApiResponse<InsertEmergencyResData>) {
    // Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }

    const { employeeWithPhoneNumber, newPhoneNumber, sendEmergency } = req.body as InsertEmergencyReqData;

    const belgianPhoneNumberRegex =
        /^(\s|[\/\.-])*(0(\s|[\/\.-])*|\+(\s|[\/\.-])*3(\s|[\/\.-])*2(\s|[\/\.-])*)4(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*\d(\s|[\/\.-])*$/;

    if (!newPhoneNumber.match(belgianPhoneNumberRegex)) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    // Trims all spaces, dots, slashes and dashes, then removes the leading 0 and replaces it with +32 (if any)
    const trimmedPhoneNumber = newPhoneNumber.replace(/(\s|[\/\.-])*/g, "").replace(/^0/, "+32");

    const phoneNumberExists = await prisma.managerPhoneNumber.findUnique({
        where: {
            number: trimmedPhoneNumber,
        },
    });

    if (phoneNumberExists) {
        res.status(400).json({ message: "Bad Request" });
        return;
    }

    const upsert = await prisma.managerPhoneNumber.upsert({
        where: {
            number: employeeWithPhoneNumber.phoneNumber?.number ?? "",
        },
        update: {
            number: trimmedPhoneNumber,
            sendEmergency: sendEmergency ? 1 : 0,
        },
        create: {
            number: trimmedPhoneNumber,
            employeeId: employeeWithPhoneNumber.employee.id,
            sendEmergency: sendEmergency ? 1 : 0,
        },
    });

    console.log(upsert);

    res.status(200).json({ message: "OK" });
}