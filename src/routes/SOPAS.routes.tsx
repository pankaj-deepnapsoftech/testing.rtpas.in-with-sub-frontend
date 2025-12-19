import { MdOutlinePayment, MdOutlineProductionQuantityLimits, MdOutlineShoppingCart, MdOutlineSpeed, MdTask } from "react-icons/md";
import { SlDirection } from "react-icons/sl";
import Products from "../pages/Products";
import { FaHandsHelping, FaRegCheckCircle } from "react-icons/fa";
import IndirectProducts from "../pages/IndirectProducts";
import { GiProgression } from "react-icons/gi";
import WIPProducts from "../pages/WIPProducts";
import { Box, Calendar, HandCoins, ScanBarcode, Store, Wrench } from "lucide-react";
import Stores from "../pages/Stores";
import InventoryApprovals from "../pages/InventoryApprovals";
import { SiScrapy } from "react-icons/si";
import Scrap from "../pages/Scrap";
import Sales from "../pages/Sales";
import PurchaseOrder from "../pages/PurchaseOrder";
import { RiBillLine } from "react-icons/ri";
import BOM from "../pages/BOM";
import { VscServerProcess } from "react-icons/vsc";
import Process from "../pages/Process";
import ProductionStatus from "../pages/ProductionStatus";
import { TbLockAccess, TbTruckDelivery } from "react-icons/tb";
import Dispatch from "../pages/Dispatch";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { IoDocumentTextOutline } from "react-icons/io5";
import ProformaInvoice from "../pages/ProformaInvoice";
import Invoice from "../pages/Invoice";
import Payment from "../pages/Payment";
import Task from "../pages/Task";
import Approvals from "../pages/Approvals";
import { CgProfile } from "react-icons/cg";
import UserProfile from "../pages/Userprofile";
import Dashboard from "../pages/Dashboard";
import { FaPeopleGroup } from "react-icons/fa6";
import Employees from "../pages/Emloyees";
import UserRole from "../pages/UserRoles";
import { IoIosPeople } from "react-icons/io";
import Parties from "../pages/Parties";
import Resources from "../pages/Resources";
import UpcomingSales from "../pages/UpcomingSales";

export const routes = [
    {
        name: "Dashboard",
        icon: <MdOutlineSpeed />,
        path: "",
        element: <Dashboard />,
        isSublink: false,
    },
    {
        name: "Employees",
        icon: <FaPeopleGroup />,
        path: "employee",
        element: <Employees />,
        isSublink: false,
    },
    {
        name: "User Roles",
        icon: <TbLockAccess />,
        path: "role",
        element: <UserRole />,
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
        name: "Merchant",
        icon: <IoIosPeople />,
        path: "merchant",
        element: <Parties />,
        isSublink: false,
    },
    {
        name: "Inventory",
        icon: <MdOutlineShoppingCart />,
        path: "inventory",
        sublink: [
            // {
            //   name: "Dashboard",
            //   icon: <MdOutlineSpeed />,
            //   path: "dashboard",
            //   element: <InventoryDashboard />,
            // },
            {
                name: "Direct",
                icon: <SlDirection />,
                path: "direct",
                element: <Products />,
            },
            {
                name: "Indirect",
                icon: <FaHandsHelping />,
                path: "indirect",
                element: <IndirectProducts />,
            },
            {
                name: "Work In Progress",
                icon: <GiProgression />,
                path: "wip",
                element: <WIPProducts />,
            },
            {
                name: "Store",
                icon: <Store />,
                path: "store",
                element: <Stores />,
            },

            {
                name: "Inventory Approvals",
                icon: <FaRegCheckCircle />,
                path: "approval",
                element: <InventoryApprovals />,
            },
            {
                name: "Scrap Management",
                icon: <SiScrapy />,
                path: "scrap",
                element: <Scrap />,
            },
        ],
        isSublink: true,
    },
    {
        name: "Sales Order",
        icon: <HandCoins />,
        path: "sales",
        element: <Sales />,
        isSublink: false,
    },

    {
        name: "Procurement",
        icon: <Box />,
        path: "procurement",
        sublink: [
           
            {
                name: "Purchase Order",
                icon: <ScanBarcode />,
                path: "purchase-order",
                element: <PurchaseOrder />,
            },
        ],
        isSublink: true,
    },

    {
        name: "Production",
        path: "production",
        icon: <MdOutlineProductionQuantityLimits />,
        sublink: [
             {
                name: "Production Queue",
                icon: <Calendar />,
                path: "upcoming-sales",
                element: <UpcomingSales />,
            },
            {
                name: "BOM",
                icon: <RiBillLine />,
                path: "bom",
                element: <BOM />,
            },
            {
                name: "Pre Production",
                icon: <VscServerProcess />,
                path: "pre-production",
                element: <Process />,
            },
            {
                name: "Production Status",
                icon: <VscServerProcess />,
                path: "production-status",
                element: <ProductionStatus />,
            },
        ],
        isSublink: true,
    },
    {
        name: "Dispatch",
        icon: <TbTruckDelivery />,
        path: "dispatch",
        element: <Dispatch />,
        isSublink: false,
    },
    {
        name: "Accounts",
        path: "accounts",
        icon: <BiPurchaseTagAlt />,
        sublink: [
            // {
            //   name: "Dashboard",
            //   icon: <MdOutlineSpeed />,
            //   path: "dashboard",
            //   element: <AccountantDashboard />,
            // },
            // {
            //   name: "Dashboard",
            //   icon: <MdOutlineSpeed />,
            //   path: "dashboard",
            //   element: <AccountantDashboard />,
            // },
            {
                name: "Proforma Invoices",
                icon: <IoDocumentTextOutline />,
                path: "proforma-invoice",
                element: <ProformaInvoice />,
            },
            {
                name: "Tax Invoices",
                icon: <RiBillLine />,
                path: "taxInvoice",
                element: <Invoice />,
            },

            {
                name: "Payments",
                icon: <MdOutlinePayment />,
                path: "payment",
                element: <Payment />,
            },
        ],
        isSublink: true,
    },

    {
        name: "Task",
        icon: <MdTask />,
        path: "task",
        element: <Task />,
        isSublink: false,
    },
    // {
    //   name: "Designer Dashboard",
    //   icon: <MdOutlineSpeed />,
    //   path: "designer-dashboard",
    //   element: <DesignerDashboard />,
    //   isSublink: false,
    // },
    {
        name: "Control Panel",
        icon: <FaRegCheckCircle />,
        path: "approval",
        element: <Approvals />,
        isSublink: false,
    },
    {
        name: "User Profile",
        icon: <CgProfile />,
        path: "userprofile",
        element: <UserProfile />,
        isSublink: false,
    },
]


export default routes;
