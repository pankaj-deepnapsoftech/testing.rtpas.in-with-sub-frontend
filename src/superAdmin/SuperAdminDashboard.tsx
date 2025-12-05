//@ts-nocheck
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [superAdminProfile, setSuperAdminProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("cards");
  const [selectedAdminEmployees, setSelectedAdminEmployees] = useState([]);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const navigate = useNavigate();
  const [cookies] = useCookies();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}subscription/admin-cards-data`,
          {
            headers: { Authorization: `Bearer ${cookies.access_token}` },
            withCredentials: true,
          }
        );

        const apiData = res.data?.data || {};

        setDashboardData({
          totalAdmins: apiData.totalAdmins || 0,
          freeTrial: apiData.freeTrial || 0,
          activePaid: apiData.activePaid || 0,
          expiredPaid: apiData.expiredPaid || 0,
          RTPAS: apiData.RTPAS || 0,
          KONTROLIX: apiData.KONTROLIX || 0,
        });

        setLoading(false);
      } catch (err) {
        console.error("Dashboard API Error:", err);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}subscription/all-users-subscription`,
          {
            headers: { Authorization: `Bearer ${cookies.access_token}` },
            withCredentials: true,
          }
        );

        const raw = res.data?.data || [];

        const mappedAdmins = raw.map((u) => ({
          _id: u._id,
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          phone: u.phone,
          role: "Super Admin", // important
          verified: u.isVerified,
          designation: "Super Admin",
          subscriptionPlan: u.subscription?.plan || "Inactive",
          createdAt: u.createdAt,
          
        }));
       

        setAdmins(mappedAdmins);
        console.log("Super Admins Loaded: ", mappedAdmins);
      } catch (err) {
        console.error("Admin Loading Error:", err);
        toast.error("Failed to load super admin list");
      }
    };

    fetchAdmins();
  }, []);

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

  // Demo-only Export
  const handleExportAdmins = () => {
    toast.success("Export feature available in live version");
  };

  // View Admin Details (from dummy data)
  const handleViewAdmin = (adminId) => {
    const admin = admins.find((a) => a._id === adminId);
    if (admin) {
      setSelectedAdmin(admin);
      setShowAdminModal(true);
    }
  };

  // Delete blocked in demo
  const handleDeleteAdmin = (adminId, adminName) => {
    if (window.confirm(`Delete ${adminName}? (Demo mode - blocked)`)) {
      toast.info(`Delete action blocked in demo mode`);
    }
  };

  // Show dummy employees
  const fetchEmployeesByAdmin = (adminId) => {
    setLoadingEmployees(true);
    const admin = admins.find((a) => a._id === adminId);

    const dummyEmployees = [
      {
        _id: "e1",
        name: "Rahul Mehta",
        email: "rahul@company.com",
        designation: "Supervisor",
        phone: "+91 98765 00001",
        verified: true,
        createdAt: "2024-06-10",
      },
      {
        _id: "e2",
        name: "Anjali Desai",
        email: "anjali@company.com",
        designation: "Operator",
        phone: "+91 87654 00002",
        verified: true,
        createdAt: "2024-08-20",
      },
      {
        _id: "e3",
        name: "Manoj Kumar",
        email: "manoj@company.com",
        designation: "Technician",
        phone: "+91 76543 00003",
        verified: false,
        createdAt: "2025-01-15",
      },
      {
        _id: "e4",
        name: "Pooja Sharma",
        email: "pooja@company.com",
        designation: "Quality Inspector",
        phone: "+91 65432 00004",
        verified: true,
        createdAt: "2024-11-05",
      },
    ];

    setSelectedAdmin(admin || null);
    setSelectedAdminEmployees(dummyEmployees);
    setShowEmployeesModal(true);
    setLoadingEmployees(false);
  };

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(admins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, admins.length);

  const currentAdmins = admins.slice(startIndex, endIndex);

  const handlePreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            {superAdminProfile && (
              <p className="text-gray-600 mt-1">
                Welcome, {superAdminProfile.name} ({superAdminProfile.email})
              </p>
            )}
          </div>
          {/* <button
            onClick={logoutHandler}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Logout
          </button> */}
        </div>

        {/* Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
            {[
              {
                label: "Free Trial Users",
                value: dashboardData.freeTrial,
                color: "orange",
              },
              {
                label: "Active Paid",
                value: dashboardData.activePaid,
                color: "green",
              },
              {
                label: "Expired Paid",
                value: dashboardData.expiredPaid,
                color: "red",
              },
              {
                label: "RTPAS Query",
                value: dashboardData.RTPAS,
                color: "purple",
              },
              {
                label: "KONTROLIX Query",
                value: dashboardData.KONTROLIX,
                color: "indigo",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 flex flex-col justify-between rounded-lg shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-700">
                  {stat.label}
                </h3>
                <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleExportAdmins}
            className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
          >
            Export All Data (Demo)
          </button>
          <button
            onClick={() => toast.info("Refreshed")}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow p-1 flex">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-6 py-2 rounded-md font-medium ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700"
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-6 py-2 rounded-md font-medium ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700"
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Cards View */}
        {viewMode === "cards" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Admins</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {admins
                .filter((a) => a.role === "Super Admin")
                .map((admin) => (
                  <div
                    key={admin._id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 shadow hover:shadow-xl transition cursor-pointer border border-blue-200"
                    // onClick={() => fetchEmployeesByAdmin(admin._id)}
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                        {admin.name[0]}
                      </div>
                      <h3 className="font-bold text-lg">{admin.name}</h3>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {admin.designation}
                      </p>
                      <div className="mt-4 flex flex-col gap-2">
                        <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
                          Super Admin
                        </span>
                        <span
                          className={
                            admin.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800" +
                                " text-xs px-3 py-1 rounded-full"
                          }
                        >
                          {admin.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                      {/* <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchEmployeesByAdmin(admin._id);
                        }}
                        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        View Users
                      </button> */}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Table View - Full version same as your original */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Admins Table
            </h2>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs md:text-sm">
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">Phone</th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Verified
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Subscription
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">
                      Created At
                    </th>
                  </tr>
                </thead>

                <tbody className="text-gray-700 text-xs md:text-sm">
                  {currentAdmins.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-6 text-gray-500 text-sm"
                      >
                        No Admins Found
                      </td>
                    </tr>
                  ) : (
                    currentAdmins.map((admin, index) => (
                      <tr
                        key={admin._id}
                        className={`border-b transition-all ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 cursor-pointer`}
                      >
                        <td className="px-3 py-2 font-medium">{admin.name}</td>
                        <td className="px-3 py-2">{admin.email}</td>
                        <td className="px-3 py-2">{admin.phone}</td>

                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold ${
                              admin.verified
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {admin.verified ? "Verified" : "Pending"}
                          </span>
                        </td>

                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] md:text-xs border border-blue-200">
                            {admin.subscriptionPlan || "N/A"}
                          </span>
                        </td>

                        <td className="px-3 py-2">
                          {admin.createdAt?.slice(0, 10)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
              <p className="text-gray-600 text-xs md:text-sm">
                Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(endIndex, admins.length)}
                </span>{" "}
                of <span className="font-semibold">{admins.length}</span>{" "}
                results
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Employees Modal */}
        {showEmployeesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Employees under {selectedAdmin?.name}
                </h3>
                <button
                  onClick={() => {
                    setShowEmployeesModal(false);
                    setSelectedAdminEmployees([]);
                  }}
                  className="text-3xl"
                >
                  &times;
                </button>
              </div>
              {loadingEmployees ? (
                <p>Loading...</p>
              ) : (
                <div className="grid gap-4">
                  {selectedAdminEmployees.map((emp) => (
                    <div
                      key={emp._id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-bold">{emp.name}</h4>
                          <p>
                            {emp.email} • {emp.designation}
                          </p>
                          <p className="text-sm text-gray-600">{emp.phone}</p>
                        </div>
                        <span
                          className={
                            emp.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800" +
                                " px-3 py-1 rounded-full text-xs"
                          }
                        >
                          {emp.verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Details Modal */}
        {showAdminModal && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Admin Details</h3>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="text-3xl"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4 text-left">
                {Object.entries(selectedAdmin)
                  .filter(([k]) => !k.startsWith("_") && k !== "organization")
                  .map(([key, value]) => (
                    <div key={key}>
                      <label className="font-medium capitalize">{key}</label>
                      <p className="text-gray-700">{String(value)}</p>
                    </div>
                  ))}
                <div>
                  <label className="font-medium">Organization</label>
                  <p className="text-gray-700">
                    {selectedAdmin.organization?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;