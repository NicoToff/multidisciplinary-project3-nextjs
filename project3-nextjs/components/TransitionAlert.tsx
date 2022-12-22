import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import type { AlertProps } from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";

type TransitionAlertsProps = {
    children: React.ReactNode;
    action: () => void;
    color?: AlertProps["color"];
    sx?: AlertProps["sx"];
};

export function TransitionAlerts({ children, action, color, sx }: TransitionAlertsProps) {
    return (
        <Box sx={{ width: "100%" }}>
            <Alert
                severity={color ?? "success"}
                action={
                    <Button variant="outlined" color="inherit" size="small" onClick={action} aria-label="action">
                        RESET
                    </Button>
                }
                sx={sx ?? {}}
            >
                {children}
            </Alert>
        </Box>
    );
}
