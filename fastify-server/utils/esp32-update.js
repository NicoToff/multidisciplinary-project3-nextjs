import prisma from "../prisma/prisma.js";

export async function esp32ContactUpdate() {
    try {
        const esp32 = await prisma.espContact.findMany({});
        if (esp32.length == 0) {
            await prisma.espContact.create({
                data: {
                    lastContact: new Date(),
                },
            });
        } else {
            await prisma.espContact.update({
                where: {
                    lastContact: esp32[0].lastContact,
                },
                data: {
                    lastContact: new Date(),
                },
            });
        }
    } catch (error) {
        console.error(error, new Date());
    }
}
