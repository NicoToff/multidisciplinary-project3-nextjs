import { useState } from "react";

import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import type { InsertReqData, InsertResData } from "../types/api/insert";

type PairingFormProps = {
    epc: Set<string>;
    setEpc: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export function PairingForm({ epc, setEpc }: PairingFormProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [itemName, setItemName] = useState("");

    return (
        <>
            {Array.from(epc).map((epc) => (
                <Box
                    key={epc}
                    component={"form"}
                    onSubmit={sendToBackEnd}
                    sx={{
                        "& > :not(style)": { m: 1 },
                    }}
                >
                    <FormControl>
                        <InputLabel htmlFor="firstname">First name</InputLabel>
                        <Input
                            onChange={(e) => setFirstName(e.target.value)}
                            id="firstname"
                            required
                            aria-describedby="first name field"
                        />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="lastname">Last name</InputLabel>
                        <Input
                            onChange={(e) => setLastName(e.target.value)}
                            id="lastname"
                            required
                            aria-describedby="last name field"
                        />
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="epc">Item name</InputLabel>
                        <Input
                            onChange={(e) => setItemName(e.target.value)}
                            id="itemname"
                            required
                            aria-describedby="name of item to updload"
                        />
                        <FormHelperText id="itemname">{epc}</FormHelperText>
                    </FormControl>
                    <Button variant="outlined" color="success" type="submit">
                        Send
                    </Button>
                </Box>
            ))}
        </>
    );

    async function sendToBackEnd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const body: InsertReqData = {
            epc: epc.values().next().value, // Takes the first value of the set
            firstName,
            lastName,
            itemName,
        };
        const response = await fetch("/api/insert", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json() as Promise<InsertResData>)
            .catch(() => "");
        console.log(response);
        setEpc(new Set());
    }
}
