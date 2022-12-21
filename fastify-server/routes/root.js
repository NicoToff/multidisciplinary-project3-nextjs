"use strict";
import prisma from "../prisma/prisma.js";
import { connect } from "mqtt";

const mqtt = connect(`mqtt://${process.env.NEXT_PUBLIC_MICHAUX_MQTT}`, {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT,
});
import findEpc from "../utils/findEpc.js";

const RECEIVE_EPC_TOPIC = process.env.RECEIVE_EPC_TOPIC;

mqtt.on("connect", () => console.log("Fastify is connected to MQTT broker"));
mqtt.subscribe(RECEIVE_EPC_TOPIC);
mqtt.on("message", async (topic, message) => {
    console.log(`(${topic}) ${message}`);
    if (topic === RECEIVE_EPC_TOPIC) {
        const splitEpc = message.toString().split(";");
        const validEpcs = splitEpc.filter(validateEpc);
        const itemRecords = await findEpc(validEpcs);
        // console.log(itemRecords);
    }
});

export default async function (fastify, opts) {
    fastify.get("/", async function (request, reply) {
        const employees = await prisma.employee.findMany();
        console.log(employees);
        return employees;
    });
}

function validateEpc(epc) {
    return epc.length === 24;
}
