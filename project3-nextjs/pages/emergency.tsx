import { useMainTitle } from "../hooks/useMainTitle";
import { prisma, prismaPing } from "../prisma/prisma-client";
import { EmergencyForm } from "../components/EmergencyForm";
import Paper from "@mui/material/Paper";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import type { EmployeeWithPhoneNumber } from "../types/employeeWithPhoneNumber";

// On page load, get all employees and their phone numbers from the database (this is an example of server-side rendering)
export const getServerSideProps: GetServerSideProps = async () => {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        return {
            props: {
                employeesWithPhoneNumbers: [],
            } satisfies EmergencyProps,
        };
    }
    // #endregion

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
        } satisfies EmergencyProps,
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
