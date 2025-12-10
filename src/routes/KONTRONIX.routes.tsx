//@ts-nocheck
import { MdOutlineSpeed } from "react-icons/md";

// ============================= components import here ==================
import Dashboard from "../pages/Dashboard";
import { Activity, Component, Wrench } from "lucide-react";
import Sensors from "../pages/Sensors";
import Resources from "../pages/Resources";
import { IoIosPeople } from "react-icons/io";
import Parties from "../pages/Parties";
import MachineStatus from "../pages/MachineStatus";






const routes = [
    {
        name: "Dashboard",
        icon: <MdOutlineSpeed />,
        path: "",
        element: <Dashboard />,
        isSublink: false,
    },

    {
        name: "Sensors",
        icon: <Component />,
        path: "sensors",
        element: <Sensors />,
        isSublink: false,
    },

    {
        name: "Resources",
        icon: <Wrench />,
        path: "resources",
        element: <Resources />,
        isSublink: false,
    },
    {
        name: "Resource Status",
        icon: <Activity />,
        path: "machine-status",
        element: <MachineStatus />,
        isSublink: false,
    },
    {
        name: "Merchant",
        icon: <IoIosPeople />,
        path: "merchant",
        element: <Parties />,
        isSublink: false,
    },

];

export default routes;











