import type { ItemRecord } from "../itemRecord";
import type { HTTP_Message } from "./_apiTypes";

export type FindEpcReqData = {
    epc: string[];
};

export type FindEpcResData = {
    message: HTTP_Message;
    itemRecords?: ItemRecord[];
};
