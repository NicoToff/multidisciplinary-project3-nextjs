import type { employee, item } from "@prisma/client";

export type InsertReqData = {
    epc: string;
    firstName: string;
    lastName: string;
    itemName: string;
};

export type InsertResData = {
    message: string;
    employee?: employee;
    item?: item;
};
