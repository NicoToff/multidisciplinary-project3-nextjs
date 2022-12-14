import { useState } from "react";
// Custom Hooks
import { useTime } from "../hooks/useTime";
import { useMqtt } from "../hooks/useMqtt";
import { useMainTitle } from "../hooks/useMainTitle";
// MUI Components
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
// Custom Components
import { PairingForm } from "../components/PairingForm";
import { TransitionAlerts } from "../components/TransitionAlert";
import { CenteredCircularProgress } from "../components/CenteredCircularProgress";
// Types
import type { FindEpcReqData, FindEpcResData } from "../types/api/findEpc";
import type { ItemRecord } from "../types/itemRecord";
import Head from "next/head";

import { brokerUrl, connectOptions, EPC_DISCOVERED_TOPIC, ESP32_ALIVE_TOPIC } from "../utils/mqtt-variables";

export default function Mqtt() {
    useMainTitle("Pair RFID Tags");

    const [receivedItemRecords, setReceivedItemRecords] = useState<ItemRecord[]>([]);
    const [espLastContact, setEspLastContact] = useState(0);
    const [mqttConnected, setMqttConnected] = useState(false);

    const onMessageCallback = async (topic: string, message: Buffer) => {
        setEspLastContact(Date.now());
        if (topic === EPC_DISCOVERED_TOPIC) {
            const splitEpc = message.toString().split(";");
            const validEpcs = splitEpc.filter((epc) => epc.length === 24); // An EPC is 24 characters long
            const currentEpcs = receivedItemRecords.map((itemRecord) => itemRecord.epc);
            const newEpcs = validEpcs.filter((epc) => !currentEpcs.includes(epc));
            const { message: status, itemRecords } = await fetch("/api/findEpc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ epc: newEpcs } satisfies FindEpcReqData),
            })
                .then((f) => f.json() as Promise<FindEpcResData>)
                .catch(() => {
                    return { message: "error", itemRecords: undefined };
                });
            if (status === "OK" && itemRecords) {
                setReceivedItemRecords((prev) => [...prev, ...itemRecords]);
            }
        }
    };

    useMqtt({
        brokerUrl,
        connectOptions,
        subscribeTo: [EPC_DISCOVERED_TOPIC, ESP32_ALIVE_TOPIC],
        callbacks: {
            onConnect: () => setMqttConnected(true),
            onError: () => setMqttConnected(false),
            onDisconnect: () => setMqttConnected(false),
            onMessage: onMessageCallback,
        },
    });

    return (
        <>
            <Head>
                <title>{`Pair Tags - Project 3`}</title>
            </Head>
            <Grid container sx={{ justifyContent: "space-between" }}>
                <Typography variant="h3" component="h2">
                    {`Pair tags`}
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

            {useTime() - espLastContact < 16000 && mqttConnected && receivedItemRecords.length === 0 && (
                <CenteredCircularProgress text={`ESP32 is scanning...`} />
            )}

            {useTime() - espLastContact >= 16000 && mqttConnected && receivedItemRecords.length === 0 && (
                <CenteredCircularProgress text={`Waiting for ESP32...`} />
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
        </>
    );

    function resetRFID() {
        setReceivedItemRecords([]);
    }
}
