// Hooks
import { useState } from "react";
import { useTime } from "../hooks/useTime";
import { useMainTitle } from "../hooks/useMainTitle";
// Next.js Components
import Head from "next/head";
import Image from "next/image";
// MUI Components
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
// Custom Components
import Orders from "../components/Orders";
// Helper functions
import { formatTimeAgo } from "../utils/time-ago-formatter";
// Types
import type { EspLastContactResData } from "../types/api/espLastContactDate";

export default function Dashboard() {
    useMainTitle("Dashboard");
    const [lastEspContact, setLastEspContact] = useState<Date>();

    const updateLastEspContact = async () => {
        const espContact = await fetch("/api/espLastContactDate")
            .then((res) => res.json() as Promise<EspLastContactResData>)
            .catch((error) => {
                console.error(error);
                return { lastContact: undefined } as EspLastContactResData;
            });
        setLastEspContact(espContact?.lastContact);
    };

    useTime({
        action: updateLastEspContact,
    });

    return (
        <>
            <Head>
                <title>Dashboard - Project 3</title>
            </Head>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4} lg={3}>
                    <Card>
                        <CardHeader
                            title="Last contact:"
                            subheader={`${lastEspContact && formatTimeAgo(lastEspContact)}`}
                            avatar={<Image src="/esp32-45x45.jpg" alt="ESP32" width="45" height="45" />}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                        <Orders />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}
