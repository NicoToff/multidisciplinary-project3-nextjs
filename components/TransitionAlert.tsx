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
};

export function TransitionAlerts({ children, action, color }: TransitionAlertsProps) {
    return (
        <Box sx={{ width: "100%" }}>
            <Alert
                color={color ?? "success"}
                action={
                    <Button aria-label="action" color="inherit" size="small" onClick={action}>
                        RESET
                    </Button>
                }
                sx={{ mb: 2 }}
            >
                {children}
            </Alert>
        </Box>
    );
}
