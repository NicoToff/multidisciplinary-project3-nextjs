import { EmployeeWithPhoneNumber } from "../employeeWithPhoneNumber";
import type { HTTP_Message } from "./_apiTypes";

export type InsertEmergencyReqData = {
    employeeWithPhoneNumber: EmployeeWithPhoneNumber;
    newPhoneNumber: string;
    sendEmergency: boolean;
};

export type InsertEmergencyResData = {
    message: HTTP_Message;
};
