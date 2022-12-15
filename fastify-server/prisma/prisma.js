const { PrismaClient } = require("@prisma/client");

const prisma =
    global.prisma ||
    new PrismaClient({
        // log: ["query"], // Uncomment this to get prisma logs
    });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Code from docs: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

module.exports = prisma;
