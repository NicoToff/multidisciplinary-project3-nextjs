import { useState } from "react";

import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";

import { SubmitButton } from "./SubmitButton";

import type { SubmissionStatus } from "../types/formComponents";
import type { EmployeeWithPhoneNumber } from "../types/employeeWithPhoneNumber";
import type { InsertEmergencyReqData, InsertEmergencyResData } from "../types/api/insertEmergency";

type EmergencyFormProps = {
    employeeWithPhoneNumber: EmployeeWithPhoneNumber;
};

export function EmergencyForm({ employeeWithPhoneNumber }: EmergencyFormProps) {
    const {
        employee: { firstName, lastName },
        phoneNumber: managerPhoneNumber,
    } = employeeWithPhoneNumber;

    const [sentStatus, setSentStatus] = useState<SubmissionStatus>("Unsent");

    const [phoneNumber, setPhoneNumber] = useState(managerPhoneNumber?.number ?? "");
    const [sendEmergency, setSendEmergency] = useState(Boolean(managerPhoneNumber?.sendEmergency) ?? false);

    return (
        <Box
            component={"form"}
            onSubmit={sendToBackEnd}
            sx={{
                "& > :not(style)": { m: 1 },
            }}
        >
            <FormControl>
                <InputLabel htmlFor="firstname">{`First name`}</InputLabel>
                <Input value={firstName} id="firstname" disabled />
            </FormControl>
            <FormControl>
                <InputLabel htmlFor="lastname">{`Last name`}</InputLabel>
                <Input value={lastName} id="lastname" disabled />
            </FormControl>
            <FormControl>
                <InputLabel htmlFor="phoneNumber">{`Phone number`}</InputLabel>
                <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} id="phoneNumber" required />
            </FormControl>
            <FormLabel>
                {`Send ⚠️ SMS?`}
                <Checkbox checked={sendEmergency} onChange={(e) => setSendEmergency(e.target.checked)} />
            </FormLabel>
            <SubmitButton sentState={sentStatus} updateCondition={Boolean(managerPhoneNumber)} />
        </Box>
    );

    async function sendToBackEnd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSentStatus("Sending");
        const body: InsertEmergencyReqData = {
            employeeWithPhoneNumber,
            newPhoneNumber: phoneNumber,
            sendEmergency,
        };
        const res = await fetch("/api/insertEmergency", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json() as Promise<InsertEmergencyResData>)
            .catch((err) => {
                console.error(err);
                setSentStatus("Error");
                return { message: "Error" } as InsertEmergencyResData;
            });

        if (res.message === "OK") {
            setSentStatus("Sent");
        } else {
            setSentStatus("Error");
        }
    }
}
