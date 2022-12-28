import { useState } from "react";

import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";

import type { InsertReqData, InsertResData } from "../types/api/insert";
import type { ItemRecord } from "../types/itemRecord";
import type { SubmissionStatus } from "../types/formComponents";
import { SubmitButton } from "./SubmitButton";

type PairingFormProps = {
    itemRecord: ItemRecord;
};

export function PairingForm({ itemRecord }: PairingFormProps) {
    const {
        epc,
        firstName: existingFirstname,
        lastName: existingLastName,
        itemName: existingItemName,
        isMandatory: existingMandatoryState,
    } = itemRecord;

    const [firstName, setFirstName] = useState(existingFirstname ?? "");
    const [lastName, setLastName] = useState(existingLastName ?? "");
    const [itemName, setItemName] = useState(existingItemName ?? "");
    const [mandatoryChecked, setMandatoryChecked] = useState(existingMandatoryState ?? true);

    const [sentStatus, setSentStatus] = useState<SubmissionStatus>("Unsent");

    return (
        <Box
            component={"form"}
            onSubmit={sendToBackEnd}
            sx={{
                "& > :not(style)": { m: 1 },
            }}
        >
            <FormControl>
                <InputLabel htmlFor="firstname">First name</InputLabel>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} id="firstname" required />
            </FormControl>
            <FormControl>
                <InputLabel htmlFor="lastname">Last name</InputLabel>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} id="lastname" required />
            </FormControl>
            <FormControl>
                <InputLabel htmlFor="itemname">Item name</InputLabel>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} id="itemname" required />
                <FormHelperText>{epc}</FormHelperText>
            </FormControl>
            <FormLabel>
                {`Mandatory?`}
                <Checkbox checked={mandatoryChecked} onChange={(e) => setMandatoryChecked(e.target.checked)} />
            </FormLabel>
            <SubmitButton
                sentState={sentStatus}
                updateCondition={Boolean(existingFirstname || existingLastName || existingItemName)}
            />
        </Box>
    );

    async function sendToBackEnd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSentStatus("Sending");
        const body: InsertReqData = {
            epc,
            firstName,
            lastName,
            itemName,
            isMandatory: mandatoryChecked ? "1" : "0",
        };
        const response = await fetch("/api/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json() as Promise<InsertResData>)
            .catch(() => ({ message: "Error" } as InsertResData));
        if (response.message === "OK") {
            setSentStatus("Sent");
        } else {
            setSentStatus("Error");
        }
    }
}
