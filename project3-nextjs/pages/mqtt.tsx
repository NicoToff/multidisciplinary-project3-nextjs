import { useState, useEffect, useRef } from "react";
import { useTime } from "../hooks/useTime";

import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";

import { PairingForm } from "../components/PairingForm";

import { TransitionAlerts } from "../components/TransitionAlert";

import type { FindEpcReqData, FindEpcResData } from "../types/api/findEpc";
import type { ItemRecord } from "../types/itemRecord";

import { SetTitle } from "../components/SetTitle";

import { connect } from "mqtt";
import type { MqttClient } from "mqtt";
import { useMqtt } from "../hooks/useMqtt";

/* Mr Michaux's MQTT */
const mqttDomain = process.env.NEXT_PUBLIC_MICHAUX_MQTT;
const mqttUri = `ws://${mqttDomain}`;
const options = {
    username: process.env.NEXT_PUBLIC_MICHAUX_MQTT_USERNAME,
    password: process.env.NEXT_PUBLIC_MICHAUX_MQTT_PASSWORD,
    port: Number(process.env.NEXT_PUBLIC_MICHAUX_MQTT_PORT),
    keepalive: 60,
};
const RECEIVE_EPC_TOPIC = process.env.NEXT_PUBLIC_MICHAUX_MQTT_RECEIVE_EPC_TOPIC as string;
const ALIVE_TOPIC = process.env.NEXT_PUBLIC_MICHAUX_MQTT_ALIVE_TOPIC as string;

export default function Mqtt() {
    const [receivedItemRecords, setReceivedItemRecords] = useState<ItemRecord[]>([]);
    // const [currentTime, setCurrentTime] = useState(Date.now());
    const [espLastContact, setEspLastContact] = useState(0);
    const [mqttConnected, setMqttConnected] = useState(false);

    const client = useMqtt({
        brokerUrl: mqttUri,
        connectOptions: options,
        callbacks: {
            onComponentMount: () => setMqttConnected(false),
            onConnect: () => setMqttConnected(true),
            onError: () => setMqttConnected(false),
        },
    });

    useEffect(() => {
        if (client) {
            client.subscribe([RECEIVE_EPC_TOPIC, ALIVE_TOPIC]);

            client.on("message", async (topic, message) => {
                setEspLastContact(Date.now());
                if (topic === RECEIVE_EPC_TOPIC) {
                    const splitEpc = message.toString().split(";");
                    const validEpcs = splitEpc.filter(validateEpc);
                    const { message: status, itemRecords } = await fetch("/api/findEpc", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ epc: validEpcs } satisfies FindEpcReqData),
                    })
                        .then((f) => f.json() as Promise<FindEpcResData>)
                        .catch(() => {
                            return { message: "error", itemRecords: undefined };
                        });
                    if (status === "OK" && itemRecords) {
                        const newRecords = itemRecords.filter(
                            (itemRecord) =>
                                !receivedItemRecords.some(
                                    (receivedItemRecord) => receivedItemRecord.epc === itemRecord.epc
                                )
                        );
                        setReceivedItemRecords((prev) => [...prev, ...newRecords]);
                    }
                }
            });
        }

        return () => {
            if (client) {
                client.removeAllListeners();
                client.unsubscribe(RECEIVE_EPC_TOPIC);
            }
        };
    }, [client, receivedItemRecords]);

    return (
        <>
            <SetTitle mainTitle="Pair RFID Tags" />
            <Grid container sx={{ justifyContent: "space-between" }}>
                <Typography variant="h3" component="h2">
                    Pair tags
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Chip label="Mqtt" color={mqttConnected ? "success" : "error"} />
                    <Chip label="ESP" color={useTime() - espLastContact < 16000 ? "success" : "error"} />
                </Stack>
            </Grid>

            {receivedItemRecords.length > 1 && (
                <TransitionAlerts color="warning" action={resetRFID} sx={{ mb: 2 }}>
                    {`WARNING: ${receivedItemRecords.length} RFID tags have been scanned.
                    To pair an item with an employee, you might want to make sure only a single tag is scanned.
                    Move away all unnecessary tags and click the RESET button.`}
                </TransitionAlerts>
            )}
            {receivedItemRecords.map((itemRecord) => (
                <Paper
                    key={itemRecord.epc}
                    sx={{
                        p: 1,
                        my: 1,
                    }}
                >
                    <PairingForm itemRecord={itemRecord} />
                </Paper>
            ))}

            {/* <Time setTime={setCurrentTime} /> */}
        </>
    );

    function resetRFID() {
        setReceivedItemRecords([]);
    }
}

function validateEpc(epc: string) {
    return epc.length === 24;
}
