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
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
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

import { brokerUrl, connectOptions, EPC_DISCOVERED_TOPIC, ESP32_ALIVE_TOPIC } from "../utils/mqtt-variables";
import Typography from "@mui/material/Typography";

export default function Dashboard() {
    useMainTitle("Dashboard");
    const [lastEspContact, setLastEspContact] = useState<Date>();
    const [rows, setRows] = useState<EntranceLogValidRow[]>([]);
    const [mqttConnected, setMqttConnected] = useState(false);
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

    const updateMqttLog = async (topic: string, message: Buffer) => {
        if (topic !== EPC_DISCOVERED_TOPIC && topic !== ESP32_ALIVE_TOPIC) {
            const improvedMessage = message.toString().replace("$$$", " -> ");
            setMqttLog((prev) => [
                ...prev,
                <Typography
                    key={prev.length}
                    sx={{
                        color: topic.includes("invalid") ? "error.main" : "inherit",
                        fontSize: "0.9rem",
                        lineHeight: "1rem",
                        fontFamily: "monospace",
                    }}
                >{`<${new Date().toISOString()}> (${topic}) ${improvedMessage}`}</Typography>,
            ]);
        }
    };

    useMqtt({
        brokerUrl,
        connectOptions,
        subscribeTo: ["/toffolon/#"],
        callbacks: {
            onConnect: () => setMqttConnected(true),
            onMessage: updateMqttLog,
            onDisconnect: () => setMqttConnected(false),
            onError: () => setMqttConnected(false),
        },
    });

    useTime({
        action: () => {
            updateLastEspContact();
            updateRows();
        },
    });

    const columns: GridColDef[] = [
        { field: "name", headerName: "Last & First name", flex: 1, minWidth: 175 },
        {
            field: "timestamp",
            headerName: "ISO timestamp",
            minWidth: 200,
            flex: 1,
            renderCell: ({ value }) => (
                <Stack direction="row" spacing={1}>
                    <Chip label={value} size="small" />
                </Stack>
            ),
        },
        {
            field: "timeAgo",
            headerName: "Relative time",
            minWidth: 150,
            flex: 1,
            valueFormatter: ({ value }) => formatTimeAgo(value),
            sortable: false,
        },
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
                                <Grid container sx={{ justifyContent: "space-between" }}>
                                    <CardHeader title="MQTT log" />
                                    <Chip label="Mqtt" color={mqttConnected ? "success" : "error"} />
                                </Grid>
                                {mqttLog}
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </>
    );
}
