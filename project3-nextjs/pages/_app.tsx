import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { createContext, useState, useMemo, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { mainListItems } from "../components/listItems";
import DarkMode from "@mui/icons-material/LightMode";
import LightMode from "@mui/icons-material/Nightlight";

import { SessionProvider } from "next-auth/react";
import { Login } from "../components/Login";
import { signOut } from "next-auth/react";

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: "border-box",
        ...(!open && {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const ColorModeContext = createContext({ toggleColorMode: () => {} });

import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const [mode, setMode] = useState<"light" | "dark">("light");
    useEffect(() => {
        const storedTheme = localStorage.getItem("userStoredTheme") as "light" | "dark";
        if (storedTheme) {
            setMode(storedTheme);
        }
    }, []);

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === "light" ? "dark" : "light";
                    localStorage.setItem("userStoredTheme", newMode);
                    return newMode;
                });
            },
        }),
        []
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode]
    );

    const size = 30;
    const toggleIconSize = { width: size, height: size };

    return (
        <>
            <Head>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="icon" type="image/png" href="/nt-32.png" />
            </Head>
            <SessionProvider session={session}>
                <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                        <Box sx={{ display: "flex" }}>
                            <CssBaseline />
                            <AppBar position="absolute" open={open}>
                                <Toolbar
                                    sx={{
                                        pr: "24px", // keep right padding when drawer closed
                                    }}
                                >
                                    <IconButton
                                        edge="start"
                                        color="inherit"
                                        aria-label="open drawer"
                                        onClick={toggleDrawer}
                                        sx={{
                                            marginRight: "36px",
                                            ...(open && { display: "none" }),
                                        }}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Typography
                                        id="main-title"
                                        component="h1"
                                        variant="h6"
                                        color="inherit"
                                        noWrap
                                        sx={{ flexGrow: 1 }}
                                    >
                                        {`Dashboard`}
                                    </Typography>

                                    <Button
                                        onClick={() => {
                                            signOut();
                                        }}
                                        variant="outlined"
                                    >
                                        {`Sign Out`}
                                    </Button>

                                    <IconButton size="large" onClick={colorMode.toggleColorMode} color="inherit">
                                        {theme.palette.mode === "dark" ? (
                                            <LightMode sx={toggleIconSize} />
                                        ) : (
                                            <DarkMode sx={toggleIconSize} />
                                        )}
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                            <Drawer variant="permanent" open={open}>
                                <Toolbar
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        px: [1],
                                    }}
                                >
                                    <IconButton onClick={toggleDrawer}>
                                        <ChevronLeftIcon />
                                    </IconButton>
                                </Toolbar>
                                <Divider />
                                <List component="nav">
                                    {mainListItems}
                                    <Divider sx={{ my: 1 }} />
                                    {/* {secondaryListItems} */}
                                </List>
                            </Drawer>
                            <Box
                                component="main"
                                sx={{
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === "light"
                                            ? theme.palette.grey[100]
                                            : theme.palette.grey[900],
                                    flexGrow: 1,
                                    height: "100vh",
                                    overflow: "auto",
                                }}
                            >
                                <Toolbar />
                                <Login>
                                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                                        <Component {...pageProps} />
                                    </Container>
                                </Login>
                            </Box>
                        </Box>
                    </ThemeProvider>
                </ColorModeContext.Provider>
            </SessionProvider>
        </>
    );
}
