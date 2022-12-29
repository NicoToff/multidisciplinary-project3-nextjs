// Hooks
import { useState } from "react";
import { useTime } from "../hooks/useTime";
import { useMqtt } from "../hooks/useMqtt";
import { useMainTitle } from "../hooks/useMainTitle";
// Next.js Components
import Head from "next/head";
import Image from "next/image";
// MUI Components
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
// MUI Components
import { DataGrid } from "@mui/x-data-grid";
// Custom Components
import { CenteredCircularProgress } from "../components/CenteredCircularProgress";
// Helper functions
import { formatTimeAgo } from "../utils/time-ago-formatter";
// Types
import type { EspLastContactResData } from "../types/api/espLastContactDate";
import type { EntranceLogResData, EntranceLogValidRow } from "../types/api/entranceLog";
import type { GridColDef } from "@mui/x-data-grid";

import { brokerUrl, connectOptions, RECEIVE_EPC_TOPIC, ALIVE_TOPIC } from "../utils/mqtt-variables";
import Typography from "@mui/material/Typography";

export default function Dashboard() {
    useMainTitle("Dashboard");
    const [lastEspContact, setLastEspContact] = useState<Date>();
    const [rows, setRows] = useState<EntranceLogValidRow[]>([]);
    const [mqttLog, setMqttLog] = useState<JSX.Element[]>([]);

    const updateLastEspContact = async () => {
        const espContact = await fetch("/api/espLastContactDate")
            .then((res) => res.json() as Promise<EspLastContactResData>)
            .catch((error) => {
                console.error(error);
                return { lastContact: undefined } as EspLastContactResData;
            });
        setLastEspContact(espContact?.lastContact);
    };

    const updateRows = async () => {
        const { message: status, generatedRows } = await fetch("/api/entranceLog")
            .then((res) => res.json() as Promise<EntranceLogResData>)
            .catch((error) => {
                console.error(error);
                return { message: "Error" } as EntranceLogResData;
            });
        if (status === "OK" && generatedRows && generatedRows.length > 0) {
            setRows(generatedRows);
        }
    };

    const onMessageCallback = async (topic: string, message: Buffer) => {
        if (topic !== RECEIVE_EPC_TOPIC && topic !== ALIVE_TOPIC) {
            setMqttLog((prev) => [
                ...prev,
                <Typography
                    key={prev.length}
                    sx={{
                        color: topic.includes("invalid") ? "error.main" : "inherit",
                        fontSize: "0.9rem",
                        lineHeight: "1rem",
                    }}
                >{`<${new Date().toISOString()}> (${topic}) ${message.toString()}`}</Typography>,
            ]);
        }
    };

    useMqtt({
        brokerUrl,
        connectOptions,
        subscribeTo: ["/toffolon/#"],
        callbacks: {
            onConnect: () => console.log("Connected to MQTT broker"),
            onMessage: onMessageCallback,
        },
    });

    useTime({
        action: () => {
            updateLastEspContact();
            updateRows();
        },
    });

    const columns: GridColDef[] = [
        { field: "name", headerName: "Last & First name", width: 225 },
        { field: "timestamp", headerName: "Entrance timestamp", width: 200 },
    ];

    return (
        <>
            {(!lastEspContact || rows.length === 0) && mqttLog.length === 0 ? (
                <CenteredCircularProgress text="Waiting for data..." />
            ) : (
                <>
                    <Head>
                        <title>Dashboard - Project 3</title>
                    </Head>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card>
                                <CardHeader
                                    title="Last contact:"
                                    subheader={`${lastEspContact && formatTimeAgo(lastEspContact)}`}
                                    avatar={<Image src="/esp32-45x45.jpg" alt="ESP32" width="45" height="45" />}
                                />
                            </Card>
                        </Grid>
                        <Grid item xs={12} lg={9}>
                            <Card sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                                <CardHeader title="Entrance log" />
                                <div style={{ height: "44vh", minHeight: 400, width: "100%" }}>
                                    <DataGrid rows={rows} columns={columns} />
                                </div>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Card sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                                <CardHeader title="MQTT log" />
                                {mqttLog}
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    );
}
