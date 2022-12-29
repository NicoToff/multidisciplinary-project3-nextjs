import { useState } from "react";
import { useMainTitle } from "../hooks/useMainTitle";
import { prisma, prismaPing } from "../prisma/prisma-client";
import { EmergencyForm } from "../components/EmergencyForm";
import Paper from "@mui/material/Paper";
import Head from "next/head";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { SubmitButton } from "../components/SubmitButton";

import type { GetServerSideProps } from "next";
import type { EmployeeWithPhoneNumber } from "../types/employeeWithPhoneNumber";
import type { SubmissionStatus } from "../types/formComponents";
import type { SendEmergencySmsReqData, SendEmergencySmsResData } from "../types/api/sendEmergencySms";

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
    const [sentStatus, setSentStatus] = useState<SubmissionStatus>("Unsent");
    const [smsContent, setSmsContent] = useState("");

    return (
        <>
            <Head>
                <title>{`Emergency - Project 3`}</title>
            </Head>
            <Typography variant="h4" component="h2" gutterBottom>
                {`Set up emergency contacts`}
            </Typography>
            <Typography color="text.secondary" mb={3}>
                {`Add employees' phone numbers to the list below to notify them in case of emergency.
                Be sure to check the "Send ⚠️ SMS?" checkbox to enable notifications.`}
            </Typography>

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

            <Typography variant="h4" component="h2" gutterBottom mt={3}>
                {`Send emergency SMS`}
            </Typography>
            <Typography color="text.secondary" mb={1}>
                {`WARNING, use only in case of emergency! This SMS will be sent to all marked employees!`}
            </Typography>
            <Box component="form" onSubmit={sendEmergencySms}>
                <Paper sx={{ px: 2, py: 1 }}>
                    <TextField
                        onChange={(event) => setSmsContent(event.target.value)}
                        label="Emergency message"
                        multiline
                        variant="standard"
                        fullWidth
                        inputProps={{ minLength: 10, maxLength: 300 }}
                        sx={{ mb: 1 }}
                        required
                    />
                    <SubmitButton sentState={sentStatus} updateCondition={false} />
                </Paper>
            </Box>
        </>
    );

    async function sendEmergencySms(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSentStatus("Sending");
        const { message: status } = await fetch("/api/sendEmergencySms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ smsContent } satisfies SendEmergencySmsReqData),
        })
            .then((res) => res.json() as Promise<SendEmergencySmsResData>)
            .catch((error) => {
                console.error(error);
                setSentStatus("Error");
                return { message: "Error" } satisfies SendEmergencySmsResData;
            });
        if (status === "OK") {
            setSentStatus("Sent");
        } else {
            setSentStatus("Error");
        }
    }
}
