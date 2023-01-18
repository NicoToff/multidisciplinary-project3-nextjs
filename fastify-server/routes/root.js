"use strict";
import { validateEntry } from "../utils/validateEntry.js";
import { esp32ContactUpdate } from "../utils/esp32-update.js";
import { sendEmergencySms } from "../utils/sendEmergencySms.js";
import { connect } from "mqtt";
import prisma from "../prisma/prisma.js";

const EPC_DISCOVERED_TOPIC = process.env.RECEIVE_EPC_TOPIC;
const ESP_ALIVE_TOPIC = process.env.ALIVE_TOPIC;
const VALID_ENTRY_TOPIC = process.env.VALID_ENTRY_TOPIC;
const INVALID_ENTRY_TOPIC = process.env.INVALID_ENTRY_TOPIC;
const EMERGENCY_ANDROID_TOPIC = process.env.EMERGENCY_ANDROID_TOPIC;

const sendAccessResult = async employeeWithItem => {
    const {
        employee: { lastName, firstName, id },
        canEnter,
    } = employeeWithItem;
    const validated = await validatedRecently({ employeeId: id });
    if (validated) {
        /* If the employee was validated recently, there's nothing more to do */
        return;
    }
    if (canEnter) {
        mqtt.publish(VALID_ENTRY_TOPIC, `${lastName}, ${firstName}`);
        // Create a new entrance log in the database
        try {
            await prisma.entranceLog.create({
                data: {
                    employeeId: id,
                },
            });
        } catch (error) {
            console.error(error);
        }
    } else {
        const { itemsScanned, allItems } = employeeWithItem;
        const missingItems = findMissingItems(itemsScanned, allItems);
        mqtt.publish(
            INVALID_ENTRY_TOPIC,
            `${lastName}, ${firstName}$$$${missingItems.map(item => item.name).join(", ")}`
        );
    }
};

const messageCallback = async (topic, message) => {
    if (topic === EPC_DISCOVERED_TOPIC || topic === ESP_ALIVE_TOPIC) {
        esp32ContactUpdate(); // Update the timestamp of last contact with the ESP32 in the database
        if (topic === EPC_DISCOVERED_TOPIC) {
            const splitEpc = message.toString().split(";");
            const validEpcs = splitEpc.filter(epc => epc.length === 24);

            /** This variable is an array with the following information: 
             - Which employees are present based on the scanned items
             - Whether they can enter or not
            */
            const employeesWithItems = await validateEntry(validEpcs);

            employeesWithItems.forEach(sendAccessResult);
        }
    } else if (topic === EMERGENCY_ANDROID_TOPIC) {
        // Forwarding the message to the SMS gateway
        sendEmergencySms(message.toString(), mqtt);
    }
};

const mqtt = connect(`mqtt://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}`, {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT,
});
mqtt.on("connect", () => console.log("Access Control Checker is connected to the MQTT broker"));
mqtt.subscribe([EPC_DISCOVERED_TOPIC, ESP_ALIVE_TOPIC, EMERGENCY_ANDROID_TOPIC]);
mqtt.on("message", messageCallback);

async function validatedRecently({ employeeId, retainMinutes = 1 }) {
    try {
        const latestEntranceLog = await prisma.entranceLog.findFirst({
            where: {
                employeeId,
            },
            orderBy: {
                timestamp: "desc",
            },
        });

        if (latestEntranceLog) {
            const { timestamp } = latestEntranceLog;
            const diff = new Date().getTime() - timestamp.getTime();
            const minutes = Math.floor(diff / 1000 / 60);
            return minutes <= retainMinutes;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

function findMissingItems(itemsScanned, allItems) {
    return allItems.filter(item => {
        if (item.isMandatory) {
            return !itemsScanned.find(scannedItem => scannedItem.id === item.id);
        }
    });
}

export default async function (fastify, opts) {}
