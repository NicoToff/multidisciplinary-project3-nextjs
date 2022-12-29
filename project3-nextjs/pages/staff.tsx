import { useState } from "react";
import { prisma, prismaPing } from "../prisma/prisma-client";
import { useMainTitle } from "../hooks/useMainTitle";
import { GetServerSideProps } from "next";
import { Employee, Item } from "@prisma/client";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import ItemIcon from "@mui/icons-material/ExtensionRounded";
import NonMandatoryItemIcon from "@mui/icons-material/ExtensionOffRounded";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Head from "next/head";

type EmployeeWithItems = {
    employee: Employee;
    items: Item[];
};

// On page load, get all employees and their items from the database (this is an example of server-side rendering)
export const getServerSideProps: GetServerSideProps = async () => {
    // #region Check if DB is reachable
    try {
        await prismaPing();
    } catch (error) {
        console.error(error);
        return {
            props: {
                employeesWithItems: [],
            } satisfies StaffPageProps,
        };
    }
    // #endregion

    const employees: Employee[] = await prisma.employee.findMany({});
    const items: Item[] = await prisma.item.findMany({});

    const employeesWithItems: EmployeeWithItems[] = employees.map((employee) => {
        const employeeItems = items.filter((item) => item.employeeId === employee.id);
        return {
            employee,
            items: employeeItems,
        };
    });

    // Sorting employees by last name
    employeesWithItems.sort((a, b) => {
        if (a.employee.lastName > b.employee.lastName) {
            return 1;
        } else if (a.employee.lastName < b.employee.lastName) {
            return -1;
        } else {
            return 0;
        }
    });

    return {
        props: {
            employeesWithItems: JSON.parse(JSON.stringify(employeesWithItems)), // This makes it serializable (removes Array methods)
        } satisfies StaffPageProps,
    };
};

type StaffPageProps = { employeesWithItems: EmployeeWithItems[] };

export default function Staff({ employeesWithItems }: StaffPageProps) {
    useMainTitle("Staff Management");
    const [isDeleting, setIsDeleting] = useState(false); // Avoids multiple clicks on delete buttons

    return (
        <>
            <Head>
                <title>{`Staff - Project 3`}</title>
            </Head>
            <Grid container spacing={3}>
                {employeesWithItems.map((employeeWithItems) => (
                    <Grid item xs={12} md={6} lg={4} key={employeeWithItems.employee.id}>
                        <Paper
                            sx={{
                                p: 1,
                                minHeight: "150px",
                            }}
                        >
                            <Typography variant="h6" component="h3">
                                {employeeWithItems.employee.lastName}
                                {`, `}
                                {employeeWithItems.employee.firstName} {`(${employeeWithItems.items.length} items)`}
                            </Typography>
                            <List>
                                {employeeWithItems.items.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => deleteItem(item.id)}
                                                aria-label="delete"
                                                disabled={isDeleting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                {item.isMandatory ? <ItemIcon /> : <NonMandatoryItemIcon />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={item.name}
                                            secondary={item.isMandatory ? "Mandatory" : null}
                                            secondaryTypographyProps={{ color: "error" }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                            {employeeWithItems.items.length === 0 && (
                                <Button
                                    variant="outlined"
                                    sx={{ m: 0.5 }}
                                    color="error"
                                    onClick={() => deleteEmployee(employeeWithItems.employee.id)}
                                    disabled={isDeleting}
                                >
                                    {`Delete Employee`}
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </>
    );

    function deleteItem(itemId: number) {
        setIsDeleting(true);
        fetch("/api/deleteItem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ itemId }),
        })
            .then(() => {
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function deleteEmployee(employeeId: number) {
        setIsDeleting(true);
        fetch("/api/deleteEmployee", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ employeeId }),
        })
            .then(() => {
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
