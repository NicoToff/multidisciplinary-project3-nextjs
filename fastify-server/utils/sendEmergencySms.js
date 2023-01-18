import prisma from "../prisma/prisma.js";

export async function sendEmergencySms(message, mqttClient) {
    try {
        const phoneNumbers = await prisma.managerPhoneNumber.findMany({
            where: {
                sendEmergency: 1,
            },
            select: {
                number: true,
            },
        });

        let delay = 0;
        phoneNumbers.forEach(({ number }) => {
            setTimeout(() => {
                console.log(`Sending SMS to ${number}...`);
                mqttClient.publish(process.env.SEND_SMS_TOPIC, `${number}$$$${message}`, { retain: false });
            }, delay);
            delay += 2000;
        });
    } catch (error) {
        console.error(error);
        console.error("Error while sending emergency SMS");
    }
}
