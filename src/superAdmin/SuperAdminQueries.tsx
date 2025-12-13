//@ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const SuperAdminQueries = () => {
  const [cookies] = useCookies();
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}contact/all`,
        {
          params: { page, limit, plan: planFilter === "all" ? undefined : planFilter },
          headers: { Authorization: `Bearer ${cookies.access_token}` },
          withCredentials: true,
        }
      );
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setQueries(items);
      setTotal(Number(res.data?.total || items.length));
    } catch (err) {
      toast.error("Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, planFilter]);

  const filtered = queries.filter((q) => {
    const text =
      `${q.name} ${q.businessName} ${q.email} ${q.phoneNumber} ${q.city} ${q.plan} ${q.message}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const card = (q: any) => (
    <div
      key={q._id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">{q.name}</p>
          <p className="text-sm text-gray-600">{q.businessName}</p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
          {q.plan}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
        <p>
          <span className="font-medium">Email:</span> {q.email}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {q.phoneNumber}
        </p>
        <p>
          <span className="font-medium">City:</span> {q.city}
        </p>
        <p>
          <span className="font-medium">Date:</span>{" "}
          {new Date(q.createdAt).toLocaleDateString()}
        </p>
      </div>
      {q.message && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            {q.message}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="w-[90%]">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Queries
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-gray-600">
            View all contact requests grouped by plans
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name, company, email, city, plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 max-w-xs">
                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPage(1);
                    setPlanFilter(e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="all">All Plans</option>
                  <option value="KONTROLIX">KONTROLIX</option>
                  <option value="RTPAS">RTPAS</option>
                  <option value="Enterprise">Enterprise</option>
               
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((q) => card(q))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No queries found.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminQueries;

