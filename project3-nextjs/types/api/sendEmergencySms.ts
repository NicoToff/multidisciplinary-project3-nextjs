import type { HTTP_Message } from "./_apiTypes";

export type SendEmergencySmsReqData = {
    smsContent: string;
};

export type SendEmergencySmsResData = {
    message: HTTP_Message;
};
