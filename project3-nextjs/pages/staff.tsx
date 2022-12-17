import { prisma } from "../prisma/prisma-client";
import { SetTitle } from "../components/SetTitle";
import { GetServerSideProps } from "next";
import { Employee, Item } from "@prisma/client";

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

    console.log(employeesWithItems);

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
            {employeesWithItems.map((employeeWithItems) => (
                <div key={employeeWithItems.employee.id}>
                    <h2>
                        {employeeWithItems.employee.firstName} {employeeWithItems.employee.lastName}
                    </h2>
                    <ul>
                        {employeeWithItems.items.map((item) => (
                            <li key={item.id}>{item.name}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
}
