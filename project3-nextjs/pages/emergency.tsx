import { useMainTitle } from "../hooks/useMainTitle";
import { prisma } from "../prisma/prisma-client";
import { EmergencyForm } from "../components/EmergencyForm";
import Paper from "@mui/material/Paper";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { EmployeeWithPhoneNumber } from "../types/employeeWithPhoneNumber";
import type { InsertEmergencyReqData, InsertEmergencyResData } from "../types/api/insertEmergency";

export const getServerSideProps: GetServerSideProps = async () => {
    const employees = await prisma.employee.findMany();
    const phoneNumbers = await prisma.managerPhoneNumber.findMany({
        where: {
            employeeId: {
                in: employees.map((e) => e.id),
            },
        },
    });
    const employeesWithPhoneNumbers: EmployeeWithPhoneNumber[] = employees.map((employee) => {
        const phoneNumber = phoneNumbers.find((p) => p.employeeId === employee.id);
        return {
            employee,
            phoneNumber,
        };
    });
    return {
        props: {
            employeesWithPhoneNumbers: JSON.parse(JSON.stringify(employeesWithPhoneNumbers)), // Makes it serializable (removes Array methods)
        },
    };
};

type EmergencyProps = {
    employeesWithPhoneNumbers: EmployeeWithPhoneNumber[];
};

export default function Emergency({ employeesWithPhoneNumbers }: EmergencyProps) {
    useMainTitle("Emergency");
    return (
        <>
            <Head>
                <title>Emergency - Project 3</title>
            </Head>
            <h1>Emergency</h1>
            {employeesWithPhoneNumbers.map((employeeWithPhoneNumber) => (
                <Paper
                    key={employeeWithPhoneNumber.employee.id}
                    sx={{
                        p: 1,
                        my: 1,
                    }}
                >
                    <EmergencyForm employeeWithPhoneNumber={employeeWithPhoneNumber} />
                </Paper>
            ))}
        </>
    );
}
