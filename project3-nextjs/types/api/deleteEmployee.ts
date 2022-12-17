import { Employee } from "@prisma/client";
import type { HTTP_Message } from "./_apiTypes";

export type DeleteEmployeeReqData = {
    employeeId: string;
};

export type DeleteEmployeeResData = {
    message: HTTP_Message;
    employee?: Employee;
};
