"use strict";
import { validateEntry } from "../utils/validateEntry.js";
import { esp32ContactUpdate } from "../utils/esp32-update.js";
import { connect } from "mqtt";
import prisma from "../prisma/prisma.js";

const mqtt = connect(`mqtt://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}`, {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT,
});
const EPC_DISCOVERED_TOPIC = process.env.RECEIVE_EPC_TOPIC;
const ESP_ALIVE_TOPIC = process.env.ALIVE_TOPIC;
const VALID_ENTRY_TOPIC = process.env.VALID_ENTRY_TOPIC;
const INVALID_ENTRY_TOPIC = process.env.INVALID_ENTRY_TOPIC;

const recentValidations = new Map /*<number,Date>*/(); // employeeId, date
const recentRefusals = new Map /*<number,number>*/(); // employeeId, number of refusals

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

        employeesWithItems.forEach(async employeeWithItem => {
            const {
                employee: { lastName, firstName, id },
                canEnter,
            } = employeeWithItem;

            if (validatedRecently({ employeeId: id })) {
                /* If the employee was validated recently, there's nothing more to do */
                return;
            }

            if (canEnter) {
                mqtt.publish(VALID_ENTRY_TOPIC, `${lastName}, ${firstName}`);
                console.log(`${lastName}, ${firstName} has just been validated for entrance`);
                recentValidations.set(id, new Date());
                recentRefusals.delete(id);
                await prisma.entranceLog.create({
                    data: {
                        employeeId: id,
                    },
                });
            } else {
                const numberOfRefusals = recentRefusals.get(id) ?? 0;
                recentRefusals.set(id, numberOfRefusals + 1);
                if (numberOfRefusals >= 3) {
                    const { itemsScanned, allItems } = employeeWithItem;
                    const missingItems = allItems.filter(item => {
                        if (item.isMandatory) {
                            return !itemsScanned.find(scannedItem => scannedItem.id === item.id);
                        }
                    });
                    console.log(
                        `${lastName}, ${firstName} is missing: ${missingItems.map(item => item.name).join(", ")}`
                    );
                    mqtt.publish(
                        INVALID_ENTRY_TOPIC,
                        `${lastName}, ${firstName}$$$${missingItems.map(item => item.name).join(", ")}`
                    );
                    recentRefusals.delete(id);
                }
            }
        });
    }
};

mqtt.on("connect", () => console.log("Fastify is connected to MQTT broker"));
mqtt.subscribe([EPC_DISCOVERED_TOPIC, ESP_ALIVE_TOPIC]);
mqtt.on("message", messageCallback);

function validatedRecently({ employeeId, recentValidationsList = recentValidations, retainMinutes = 5 }) {
    const employeeValidation = recentValidationsList.get(employeeId);
    if (employeeValidation) {
        const minutesSinceValidation = (new Date().getTime() - employeeValidation.getTime()) / 1000 / 60;
        if (minutesSinceValidation <= retainMinutes) {
            return true;
        }
    }
    return false;
}

export default async function (fastify, opts) {}
