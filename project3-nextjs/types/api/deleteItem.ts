import type { HTTP_Message } from "./_apiTypes";
import type { Item } from "@prisma/client";

export type DeleteItemReqData = {
    itemId: string;
};

export type DeleteItemResData = {
    message: HTTP_Message;
    item?: Item;
};
