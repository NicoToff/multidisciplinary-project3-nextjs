"use strict";
const prisma = require("../prisma/prisma.js");
const mqtt = require("mqtt").connect("mqtt://test.mosquitto.org:1883");
const findEpc = require("../utils/findEpc.js");
const RECEIVE_EPC_TOPIC = "/helha/nicotoff/esp32/rfid";

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

module.exports = async function (fastify, opts) {
    fastify.get("/", async function (request, reply) {
        const employees = await prisma.employee.findMany();
        console.log(employees);
        return employees;
    });
};

function validateEpc(epc) {
    return epc.length === 24;
}
