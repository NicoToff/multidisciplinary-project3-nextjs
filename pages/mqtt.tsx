// #region Imports
import { useState, useEffect, useRef } from "react";
import { connect, MqttClient } from "mqtt";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { PairingForm } from "../components/PairingForm";

import { TransitionAlerts } from "../components/TransitionAlert";

import type { FindEpcReqData, FindEpcResData } from "../types/api/findEpc";
import type { ItemRecord } from "../types/itemRecord";
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
    const [receivedItemRecords, setReceivedItemRecords] = useState<ItemRecord[]>([]);
    const client = useRef<MqttClient>();
    const watcher = useRef(false);

    useEffect(() => {
        client.current = connect(mqttUri, options);
        client.current.on("connect", () => {
            console.log(`Connected to ${mqttDomain}`);
        });
    }, []);

    useEffect(() => {
        if (client.current) {
            client.current.subscribe(TOPIC);

            client.current.on("message", async (topic, message) => {
                const splitEpc = message.toString().split(";");
                const { message: status, itemRecords } = await fetch("/api/findEpc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ epc: splitEpc } as FindEpcReqData),
                })
                    .then((f) => f.json() as Promise<FindEpcResData>)
                    .catch(() => {
                        return { message: "error", itemRecords: undefined };
                    });
                if (status === "OK" && itemRecords) {
                    const newRecords = itemRecords.filter(
                        (itemRecord) =>
                            !receivedItemRecords.some((receivedItemRecord) => receivedItemRecord.epc === itemRecord.epc)
                    );
                    setReceivedItemRecords((prev) => [...prev, ...newRecords]);
                }
            });
        }

        return () => {
            if (client.current) {
                client.current.removeAllListeners();
                client.current.unsubscribe(TOPIC);
            }
        };
    }, [client, receivedItemRecords]);

    return (
        <Container>
            <Typography variant="h2" component="h1">
                MQTT
            </Typography>
            <Typography variant="h3" component="h2">
                Pair tags
            </Typography>
            {receivedItemRecords.length > 1 && (
                <TransitionAlerts color="warning" action={resetRFID}>
                    {`WARNING: ${receivedItemRecords.length} RFID tags have been scanned.
                    To pair an item with an employee, you might want to make sure only a single tag is scanned.
                    Move away all unnecessary tags and click the RESET button.`}
                </TransitionAlerts>
            )}
            {receivedItemRecords.map((itemRecord) => (
                <PairingForm itemRecord={itemRecord} key={itemRecord.epc} />
            ))}
        </Container>
    );

    function resetRFID() {
        setReceivedItemRecords([]);
    }
}
