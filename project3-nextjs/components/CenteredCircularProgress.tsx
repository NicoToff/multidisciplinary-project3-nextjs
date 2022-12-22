import { CircularProgress, Box, Typography } from "@mui/material";

export function CenteredCircularProgress({ text = "Loading..." }: { text?: string }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "85vh" }}>
            <Typography variant="h5" component="h3">
                {text}
            </Typography>
            <CircularProgress size={120} sx={{ m: 2 }} />
        </Box>
    );
}
