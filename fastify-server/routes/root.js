"use strict";
import { connect } from "mqtt";

const mqtt = connect(`mqtt://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}`, {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT,
});
import { validateEntry } from "../utils/validateEntry.js";
import { esp32Update } from "../utils/esp32-update.js";
const RECEIVE_EPC_TOPIC = process.env.RECEIVE_EPC_TOPIC;
const ALIVE_TOPIC = process.env.ALIVE_TOPIC;
const VALID_ENTRY_TOPIC = process.env.VALID_ENTRY_TOPIC;
const INVALID_ENTRY_TOPIC = process.env.INVALID_ENTRY_TOPIC;

const recentValidations = [
    {
        employeeId: 1,
        timestamp: new Date(),
    },
];

mqtt.on("connect", () => console.log("Fastify is connected to MQTT broker"));
mqtt.subscribe([RECEIVE_EPC_TOPIC, ALIVE_TOPIC]);
mqtt.on("message", async (topic, message) => {
    esp32Update();
    if (topic === RECEIVE_EPC_TOPIC) {
        const splitEpc = message.toString().split(";");
        const validEpcs = splitEpc.filter(epc => epc.length === 24);
        const employeesWithItems = await validateEntry(validEpcs);
        employeesWithItems.forEach(employeeWithItem => {
            const {
                employee: { lastName, firstName, id },
                canEnter,
            } = employeeWithItem;
            if (validatedRecently({ employeeId: id })) {
                // console.log("Validated recently");
                return;
            }
            if (canEnter) {
                mqtt.publish(VALID_ENTRY_TOPIC, `${lastName}, ${firstName}`);
                recentValidations.push({ employeeId: id, timestamp: new Date() });
            } else {
                const { itemsScanned, allItems } = employeeWithItem;
                const missingItems = allItems.filter(item => {
                    if (item.isMandatory) {
                        return !itemsScanned.find(scannedItem => scannedItem.id === item.id);
                    }
                });
                mqtt.publish(
                    INVALID_ENTRY_TOPIC,
                    `${lastName}, ${firstName}$$$${missingItems.map(item => item.name).join(", ")}`
                );
            }
        });
    }
});

export default async function (fastify, opts) {}

function validatedRecently({ employeeId, recentValidationsList = recentValidations, retainMinutes = 5 }) {
    return Boolean(
        recentValidationsList.find(
            validation =>
                validation.employeeId === employeeId &&
                validation.timestamp > new Date(Date.now() - 1000 * 60 * retainMinutes)
        )
    );
}
