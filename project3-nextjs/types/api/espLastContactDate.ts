import type { HTTP_Message } from "./_apiTypes";

export type EspLastContactResData = {
    message: HTTP_Message;
    lastContact?: Date;
};
