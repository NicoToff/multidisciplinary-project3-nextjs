import { prisma } from "../prisma/prisma-client";
import { SetTitle } from "../components/SetTitle";
import { GetServerSideProps } from "next";
import { Employee, Item } from "@prisma/client";

import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

type EmployeeWithItems = {
    employee: Employee;
    items: Item[];
};

export const getServerSideProps: GetServerSideProps = async () => {
    const employees: Employee[] = await prisma.employee.findMany({});
    const items: Item[] = await prisma.item.findMany({});

    const employeesWithItems: EmployeeWithItems[] = employees.map((employee) => {
        const employeeItems = items.filter((item) => item.employeeId === employee.id);
        return {
            employee,
            items: employeeItems,
        };
    });

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
            employeesWithItems: JSON.parse(JSON.stringify(employeesWithItems)), // Makes it serializable (removes Array methods)
        },
    };
};

type StaffPageProps = { employeesWithItems: EmployeeWithItems[] };

export default function Staff({ employeesWithItems }: StaffPageProps) {
    return (
        <>
            <SetTitle mainTitle="Staff Management" />
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
                            {employeeWithItems.items.map((item) => (
                                <Button key={item.id} variant="outlined" sx={{ m: 0.5 }}>
                                    {item.name}
                                </Button>
                            ))}
                            {/* TODO: Improve this with : https://mui.com/material-ui/react-list/#interactive */}
                            {employeeWithItems.items.length === 0 && (
                                <Button
                                    variant="outlined"
                                    sx={{ m: 0.5 }}
                                    color="error"
                                    onClick={() =>
                                        fetch("/api/deleteEmployee", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({ employeeId: employeeWithItems.employee.id }),
                                        })
                                            .then(() => {
                                                window.location.reload();
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                            })
                                    }
                                >
                                    Delete Employee
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
