//@ts-nocheck
import { useCookies } from "react-cookie";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SuperAdminSubscriptions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const navigate = useNavigate();
  const [cookies] = useCookies();
  const [cardStats, setCardStats] = useState({
    activePaid: 0,
    freeTrial: 0,
    expiredPaid: 0,
  });

  // Fetch REAL API instead of dummy data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}subscription/all-users-subscription`,
          {
            headers: { Authorization: `Bearer ${cookies.access_token}` },
            withCredentials: true,
          }
        );

        const rawUsers = Array.isArray(res.data?.data) ? res.data.data : [];

        const mapped = rawUsers.map((u) => ({
          _id: u._id,
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          phone: u.phone,
          createdAt: u.createdAt,
          subscriptionStatus: u.subscription?.plan || "Inactive",
          role: "Super Admin", // required for filtering
        }));

        setData(mapped);
        setLoading(false);
      } catch (err) {
        console.error("API Fetch Error:", err);
        toast.error("Failed to load subscription data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCardStats = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}subscription/admin-cards-data`,
          {
            headers: { Authorization: `Bearer ${cookies.access_token}` },
            withCredentials: true,
          }
        );

        const apiData = res.data?.data || {};

        setCardStats({
          activePaid: apiData.activePaid || 0,
          freeTrial: apiData.freeTrial || 0,
          expiredPaid: apiData.expiredPaid || 0,
        });
      } catch (err) {
        console.error("Card Stats API Error:", err);
        toast.error("Failed to load dashboard subscription stats");
      }
    };

    fetchCardStats();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getDisplayStatus = (item) => {
    if (item.subscriptionStatus === "Free Trial") {
      const createdAt = new Date(item.createdAt);
      const diff = (new Date() - createdAt) / (1000 * 3600 * 24);
      if (diff > 3) return "Free Trial Expired";
    }
    return item.subscriptionStatus;
  };

  const filteredData = data.filter((item) => {
    const displayStatus = getDisplayStatus(item).trim().toLowerCase();
    const selectedStatus = statusFilter.trim().toLowerCase();

    // Search text match
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayStatus.includes(searchTerm.toLowerCase());

    // Status filter match
    const matchesStatus =
      selectedStatus === "all" || displayStatus === selectedStatus;

    return matchesSearch && matchesStatus && item.role === "Super Admin";
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active subscription":
        return "bg-green-100 text-green-800";
      case "free trial":
        return "bg-blue-100 text-blue-800";
      case "free trial expired":
        return "bg-orange-100 text-orange-800";
      case "lifetime plan":
        return "bg-purple-100 text-purple-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPageNumbers = () => {
    const numbers = [];
    const maxPages = 6;
    let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let end = start + maxPages - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxPages + 1);
    }

    for (let i = start; i <= end; i++) numbers.push(i);
    return numbers;
  };

  // Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // UI starts here (same as before)
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="w-[90%]">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Super Admin Subscriptions
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-600">
            View all Super Admins and their subscription status across
            organizations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-500">
                  {cardStats.activePaid}
                </p>
              </div>
            </div>
          </div>

          {/* Free Trials */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Free Trials
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-500">
                  {cardStats.freeTrial}
                </p>
              </div>
            </div>
          </div>

          {/* Inactive / Expired */}
          <div className="bg-white rounded-lg border border-red-200 p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Inactive / Expired
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-500">
                  {cardStats.expiredPaid}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search Super Admins, organizations, or status..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active subscription">
                    Active Subscription
                  </option>
                  <option value="free trial">Free Trial</option>
                  <option value="free trial expired">Free Trial Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Super Admin
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Subscription
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No Super Admins found.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">{startIndex + index + 1}</td>

                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">
                              {item.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-500 text-sm">
                              {item.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] ${getStatusColor(
                            getDisplayStatus(item)
                          )}`}
                        >
                          {getDisplayStatus(item)}
                        </span>
                      </td>

                      <td className="px-5 py-4">{item.phone}</td>

                      <td className="px-6 py-4">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredData.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredData.length}</span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSubscriptions;