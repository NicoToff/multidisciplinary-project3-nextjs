import type { Employee, Item } from "@prisma/client";

export type FindEpcReqData = {
    epc: string[];
};

export type FindEpcResData = {
    message: string;
    employee?: Employee;
    item?: Item;
};
