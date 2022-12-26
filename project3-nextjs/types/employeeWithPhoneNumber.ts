import type { Employee, ManagerPhoneNumber } from "@prisma/client";

export type EmployeeWithPhoneNumber = {
    employee: Employee;
    phoneNumber?: ManagerPhoneNumber;
};
