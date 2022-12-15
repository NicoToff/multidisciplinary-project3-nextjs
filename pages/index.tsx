import { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Deposits from "../components/Deposits";
import Orders from "../components/Orders";

export default function Index() {
    useEffect(() => {
        const mainTitle = document.getElementById("main-title");
        mainTitle!.innerText = "Dashboard";
    }, []);

    return (
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
    );
}
