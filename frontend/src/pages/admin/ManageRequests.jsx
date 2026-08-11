import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const filters = ["All", "Pending", "Approved", "Rejected"];

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clearance");
        setRequests(response.data.data);
      } catch (err) {
        setError("Unable to load clearance requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.studentName.toLowerCase().includes(search.toLowerCase()) ||
        request.requestId.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        statusFilter === "All" || request.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Manage Requests
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Search, filter, and review all clearance requests from students.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student or request ID"
          className="rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setStatusFilter(item)}
              className={`rounded-full px-5 py-3 text-sm font-semibold ${statusFilter === item ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {loading && <LoadingSpinner />}
      {error && (
        <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
      )}
      {!loading && !error && filteredRequests.length === 0 && (
        <div className="rounded-3xl bg-yellow-50 p-6 text-yellow-700">
          No requests found.
        </div>
      )}
      {!loading && filteredRequests.length > 0 && (
        <div className="overflow-x-auto rounded-[2rem] bg-white p-4 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((request) => (
                <tr key={request._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {request.studentName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {request.studentId}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {request.department}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {request.requestId}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <Link
                      className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      to={`/admin/requests/${request._id}`}
                    >
                      View
                    </Link>
                    <Link
                      className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                      to={`/admin/requests/${request._id}/review`}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageRequests;
