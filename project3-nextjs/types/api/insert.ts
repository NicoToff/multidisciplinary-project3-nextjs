import type { Employee, Item } from "@prisma/client";

export type InsertReqData = {
    epc: string;
    firstName: string;
    lastName: string;
    itemName: string;
};

export type InsertResData = {
    message: "OK" | "Error" | "Bad Request";
    employee?: Employee;
    item?: Item;
};
