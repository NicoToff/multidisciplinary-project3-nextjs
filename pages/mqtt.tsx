// #region Imports
import { useState, useEffect } from "react";
import { connect, MqttClient } from "mqtt";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { PairingForm } from "../components/PairingForm";

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
            <PairingForm epc={epc} setEpc={setEpc} />
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

    function resetRFID() {
        setEpc(new Set());
    }
}
