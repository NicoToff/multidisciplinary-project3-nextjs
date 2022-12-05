// #region Imports
import { useState, useEffect } from "react";
import { connect, MqttClient } from "mqtt";
import {
    Container,
    Typography,
    Badge,
    Button,
    FormControl,
    Input,
    InputLabel,
    FormHelperText,
    Box,
} from "@mui/material";
import type { InsertReqData, InsertResData } from "../types/api/insert";

import { TransitionAlerts } from "../components/TransitionAlert";
// #endregion

/* Public MQTT */
const mqttDomain = "test.mosquitto.org";
const port = 8081;
const mqttUri = `mqtt://${mqttDomain}`;
const options = {
    port,
    keepalive: 60,
};
const TOPIC = "/helha/nicotoff/rfid";

export default function Home() {
    const [epc, setEpc] = useState<Set<string>>(new Set());

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [itemName, setItemName] = useState("");

    useEffect(() => {
        const client: MqttClient = connect(mqttUri, options);
        client.on("connect", () => {
            console.log(`Connected to ${mqttDomain}`);
        });
        client.subscribe(TOPIC);
        client.on("message", (topic, message) => {
            const splitEpc = message.toString().split(";");
            setEpc((prev) => new Set([...Array.from(prev), ...splitEpc]));
        });

        return () => {
            if (client) {
                client.unsubscribe(TOPIC);
                client.end(true);
            }
        };
    }, [epc]);

    return (
        <Container>
            <Typography variant="h2" component="h1" color="initial">
                MQTT
            </Typography>
            <Typography variant="h3" component="h2" color="initial">
                Pair tags
            </Typography>
            <Box
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
                    <FormHelperText id="itemname">{epc.values().next().value}</FormHelperText>
                </FormControl>
                <Button variant="outlined" color="success" type="submit">
                    Send
                </Button>
            </Box>
            <Button
                variant="outlined"
                color="secondary"
                onClick={async () =>
                    console.log(
                        await fetch("/api/find")
                            .then((f) => f.json())
                            .catch(() => "")
                    )
                }
            >
                Get items
            </Button>
            {epc.size > 1 && (
                <TransitionAlerts color="warning" action={resetRFID}>
                    {`WARNING: ${epc.size} RFID tags have been scanned.
                    To pair an item with an employee, you might want to make sure only a single tag is scanned.
                    Move away all unnecessary tags and click the RESET button.`}
                </TransitionAlerts>
            )}
        </Container>
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

    function resetRFID() {
        setEpc(new Set());
    }
}
