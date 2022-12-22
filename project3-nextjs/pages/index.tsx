import { useEffect } from "react";
import { useMainTitle } from "../hooks/useMainTitle";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Deposits from "../components/Deposits";
import Orders from "../components/Orders";
import Head from "next/head";

export default function Index() {
    useEffect(() => {
        const mainTitle = document.getElementById("main-title");
        mainTitle!.innerText = "Dashboard";
    }, []);

    useMainTitle("Dashboard");

    return (
        <>
            <Head>
                <title>Dashboard - Project 3</title>
            </Head>
            <Grid container spacing={3}>
                {/* Recent Deposits */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            height: 240,
                        }}
                    >
                        <Deposits />
                    </Paper>
                </Grid>
                {/* Recent Orders */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
                        <Orders />
                    </Paper>
                </Grid>
            </Grid>
        </>
    );
}
