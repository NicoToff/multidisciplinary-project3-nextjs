import Link from "next/link";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import PairRfidTag from "@mui/icons-material/RssFeed";
import PeopleIcon from "@mui/icons-material/PeopleAlt";
import EmergencyIcon from "@mui/icons-material/NotificationImportant";

export const mainListItems = (
    <>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton>
                <ListItemIcon>
                    <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
            </ListItemButton>
        </Link>
        <Link href="/mqtt" style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton>
                <ListItemIcon>
                    <PairRfidTag />
                </ListItemIcon>
                <ListItemText primary="Pair Tags" />
            </ListItemButton>
        </Link>
        <Link href="/staff" style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton>
                <ListItemIcon>
                    <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Staff management" />
            </ListItemButton>
        </Link>
        <Link href="/emergency" style={{ textDecoration: "none", color: "inherit" }}>
            <ListItemButton>
                <ListItemIcon>
                    <EmergencyIcon />
                </ListItemIcon>
                <ListItemText primary="Emergency" />
            </ListItemButton>
        </Link>
        {/*<ListItemButton>
            <ListItemIcon>
                <LayersIcon />
            </ListItemIcon>
            <ListItemText primary="Integrations" />
        </ListItemButton> */}
    </>
);

// export const secondaryListItems = (
//     <>
//         <ListSubheader component="div" inset>
//             Saved reports
//         </ListSubheader>
//         <ListItemButton>
//             <ListItemIcon>
//                 <AssignmentIcon />
//             </ListItemIcon>
//             <ListItemText primary="Current month" />
//         </ListItemButton>
//         <ListItemButton>
//             <ListItemIcon>
//                 <AssignmentIcon />
//             </ListItemIcon>
//             <ListItemText primary="Last quarter" />
//         </ListItemButton>
//         <ListItemButton>
//             <ListItemIcon>
//                 <AssignmentIcon />
//             </ListItemIcon>
//             <ListItemText primary="Year-end sale" />
//         </ListItemButton>
//     </>
// );
