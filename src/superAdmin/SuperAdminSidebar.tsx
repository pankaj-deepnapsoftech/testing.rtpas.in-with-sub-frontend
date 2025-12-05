//@ts-nocheck
import React from "react";
import { IoDiamondOutline } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const SuperAdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, , removeCookie] = useCookies(["access_token", "isAdministration"]);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <MdDashboard />,
      path: "/",
    },
    {
      id: "subscriptions",
      name: "Admin Subscriptions",
      icon: <IoDiamondOutline />,
      path: "/admin-subscription",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose(); // close on mobile
  };

  const logoutHandler = () => {
   try {
         removeCookie("access_token");
         removeCookie("isAdministration");
         toast.success("Logged out successfully");
         navigate("/login");
       } catch (error: any) {
         toast.error(error.message || "Something went wrong");
       }
     };

  return (
    <>
      {/* 🔥 Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        ></div>
      )}

      {/* 🔥 Sidebar */}
      <div
        className={`
          fixed lg:fixed top-0 left-0 z-50
          w-64 bg-gray-800 text-white p-4 
          min-h-screen shadow-xl

          flex flex-col justify-between

          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex justify-between items-center mb-6 lg:mb-10">
            <div>
              <h2 className="text-xl font-bold">Super Admin Panel</h2>
              <p className="text-sm text-gray-400">Management System</p>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              ✖
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  flex items-center w-full px-4 py-3 rounded-lg space-x-3 
                  transition-all duration-200
      
                  ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 🚀 Logout Button FIXED at Bottom */}
        <button
          onClick={logoutHandler}
          className="
    w-full mt-6 px-4 py-3 rounded-lg 
    bg-red-100 hover:bg-red-300 text-red-700 font-semibold
    transition-all duration-200
    flex items-center justify-center
  "
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default SuperAdminSidebar;