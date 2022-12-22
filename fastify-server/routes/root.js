"use strict";
import prisma from "../prisma/prisma.js";
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

mqtt.on("connect", () => console.log("Fastify is connected to MQTT broker"));
mqtt.subscribe([RECEIVE_EPC_TOPIC, ALIVE_TOPIC]);
mqtt.on("message", async (topic, message) => {
    esp32Update();
    if (topic === RECEIVE_EPC_TOPIC) {
        const splitEpc = message.toString().split(";");
        const validEpcs = splitEpc.filter(epc => epc.length === 24);
        const employees = await validateEntry(validEpcs);
        console.log(employees);
    }
});

export default async function (fastify, opts) {
    fastify.get("/", async function (request, reply) {
        const employees = await prisma.employee.findMany();
        console.log(employees);
        return employees;
    });
}
