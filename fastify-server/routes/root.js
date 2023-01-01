"use strict";
import { validateEntry } from "../utils/validateEntry.js";
import { esp32ContactUpdate } from "../utils/esp32-update.js";
import { connect } from "mqtt";
import prisma from "../prisma/prisma.js";

const EPC_DISCOVERED_TOPIC = process.env.RECEIVE_EPC_TOPIC;
const ESP_ALIVE_TOPIC = process.env.ALIVE_TOPIC;
const VALID_ENTRY_TOPIC = process.env.VALID_ENTRY_TOPIC;
const INVALID_ENTRY_TOPIC = process.env.INVALID_ENTRY_TOPIC;

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
        await prisma.entranceLog.create({
            data: {
                employeeId: id,
            },
        });
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
    esp32ContactUpdate(); // Update the timestamp of last contact with the ESP32 in the database
    if (topic === EPC_DISCOVERED_TOPIC) {
        const splitEpc = message.toString().split(";");
        const validEpcs = splitEpc.filter(epc => epc.length === 24);

        /** With the `validateEntry` function determine: 
           - Which employees are present based on the scanned items
           - If they can enter or not 
        */
        const employeesWithItems = await validateEntry(validEpcs);

        employeesWithItems.forEach(sendAccessResult);
    }
};

const mqtt = connect(`mqtt://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}`, {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT,
});
mqtt.on("connect", () => console.log("Access Control Checker is connected to the MQTT broker"));
mqtt.subscribe([EPC_DISCOVERED_TOPIC, ESP_ALIVE_TOPIC]);
mqtt.on("message", messageCallback);

async function validatedRecently({ employeeId, retainMinutes = 5 }) {
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
}

function findMissingItems(itemsScanned, allItems) {
    return allItems.filter(item => {
        if (item.isMandatory) {
            return !itemsScanned.find(scannedItem => scannedItem.id === item.id);
        }
    });
}

export default async function (fastify, opts) {}
