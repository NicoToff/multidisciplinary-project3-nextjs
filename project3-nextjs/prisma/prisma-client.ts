// We are passing this instance around to use a single PrismaClient
import { Prisma, PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        // log: ["query"], // Uncomment this to get prisma logs
    });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export const prismaPing = async () => prisma.$queryRaw(Prisma.sql([`SELECT 1`]));

// Code from docs: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
