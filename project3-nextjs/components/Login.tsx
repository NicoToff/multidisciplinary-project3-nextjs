import { useSession, signIn } from "next-auth/react";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type LoginProps = { children: React.ReactNode };

export function Login({ children }: LoginProps) {
    const { data: session, status } = useSession();

    if (!session) {
        return (
            <Container maxWidth="xs">
                <Box
                    sx={{
                        marginTop: 8,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "warning.main" }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h2" variant="h4" m={2}>
                        {`Sign in`}
                    </Typography>
                    <Typography component="p">{`You must be signed in to view the page.`}</Typography>
                    <Button onClick={() => signIn()} fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        {`Go to authentication page`}
                    </Button>
                </Box>
            </Container>
        );
    } else return <>{children}</>;
}
