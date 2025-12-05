import React, { useState } from 'react';
import SuperAdminSidebar from '../SuperAdminSidebar';
import { Outlet } from 'react-router-dom';
import { IoMenu } from 'react-icons/io5';

const AdministrationLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* Sidebar */}
      <SuperAdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-0 lg:ml-64 p-4 bg-gray-100 min-h-screen overflow-auto">

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden mb-4 p-2 bg-gray-200 text-gray-500 rounded"
          onClick={() => setIsSidebarOpen(true)}
        >
          <IoMenu size={23} />
        </button>

        <Outlet />
      </div>
    </div>
  );
};

export default AdministrationLayout;