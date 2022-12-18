import type { Employee, Item } from "@prisma/client";
import type { HTTP_Message } from "./_apiTypes";

export type InsertReqData = {
    epc: string;
    firstName: string;
    lastName: string;
    itemName: string;
    mandatory?: "0" | "1";
};

export type InsertResData = {
    message: HTTP_Message;
    employee?: Employee;
    item?: Item;
};
