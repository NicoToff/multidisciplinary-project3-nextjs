import { useState } from "react";

import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";

import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";

import type { InsertReqData, InsertResData } from "../types/api/insert";
import type { ItemRecord } from "../types/itemRecord";
import type { SubmissionStatus } from "../types/formComponents";
import SubmitButton from "./SubmitButton";

type PairingFormProps = {
    itemRecord: ItemRecord;
};

export function PairingForm({ itemRecord }: PairingFormProps) {
    const { epc, firstName: fname, lastName: lname, itemName: iname, isMandatory } = itemRecord;

    const [firstName, setFirstName] = useState(fname ?? "");
    const [lastName, setLastName] = useState(lname ?? "");
    const [itemName, setItemName] = useState(iname ?? "");
    const [mandatoryChecked, setMandatoryChecked] = useState(isMandatory ?? true);

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
                <InputLabel htmlFor="epc">Item name</InputLabel>
                <Input value={itemName} onChange={(e) => setItemName(e.target.value)} id="itemname" required />
                <FormHelperText id="itemname">{epc}</FormHelperText>
            </FormControl>
            <FormLabel>
                Mandatory?
                <Checkbox checked={mandatoryChecked} onChange={(e) => setMandatoryChecked(e.target.checked)} />
            </FormLabel>
            <SubmitButton sentState={sentStatus} updateCondition={Boolean(fname || lname || iname)} />
        </Box>
    );

    async function sendToBackEnd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
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
        if (response.message !== "Error" && response.message !== "Bad Request") {
            setSentStatus("Sent");
        } else {
            setSentStatus("Error");
        }
    }
}
