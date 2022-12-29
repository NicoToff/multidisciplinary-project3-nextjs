import type { HTTP_Message } from "./_apiTypes";

export type EntranceLogValidRow = { id: number; name: string; timestamp: Date };

export type EntranceLogResData = {
    message: HTTP_Message;
    generatedRows?: EntranceLogValidRow[];
};
