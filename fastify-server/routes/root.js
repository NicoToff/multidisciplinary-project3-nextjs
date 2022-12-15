"use strict";
const prisma = require("../prisma/prisma.js");

module.exports = async function (fastify, opts) {
    fastify.get("/", async function (request, reply) {
        const employees = await prisma.employee.findMany();
        console.log(employees);
        return employees;
    });
};
