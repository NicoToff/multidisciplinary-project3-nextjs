import type { Employee, Item } from "@prisma/client";
import type { ItemRecord } from "../itemRecord";

export type FindEpcReqData = {
    epc: string[];
};

export type FindEpcResData = {
    message: string;
    itemRecords?: ItemRecord[];
};
