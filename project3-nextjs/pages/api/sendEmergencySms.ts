import type { NextApiRequest, NextApiResponse } from "next";
import { prisma, prismaPing } from "../../prisma/prisma-client";
import { connect } from "mqtt";

import type { SendEmergencySmsReqData, SendEmergencySmsResData } from "../../types/api/sendEmergencySms";

const brokerUrl = `ws://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}:${process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT}`;
const options = {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
};
const smsTopic = process.env.NEXT_PUBLIC_MICHAUX_MQTT_SEND_SMS as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendEmergencySmsResData>) {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
    // #endregion

    const { smsContent } = req.body as SendEmergencySmsReqData;

    try {
        const phoneNumbers = await prisma.managerPhoneNumber.findMany({
            where: {
                sendEmergency: 1,
            },
            select: {
                number: true,
            },
        });

        console.log("phoneNumbers: ", phoneNumbers);

        const mqttClient = connect(brokerUrl, options);

        mqttClient.on("connect", () => {
            let delay = 0;
            phoneNumbers.forEach(({ number }) => {
                setTimeout(() => {
                    console.log(`Sending SMS to ${number}...`);
                    const mqttMessage = `${number}$$$(MQTT SMS) ${smsContent.replace(/\$/g, "")}`; // The $ sign is used as a delimiter in the MQTT message
                    mqttClient.publish(smsTopic, mqttMessage, { retain: false });
                }, delay);
                delay += 2000;
            });
        });

        res.status(200).json({ message: "OK" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
