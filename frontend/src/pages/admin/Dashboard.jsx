import { useEffect, useState } from "react";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clearance");
        const data = response.data.data;
        const total = data.length;
        const pending = data.filter((item) => item.status === "Pending").length;
        const approved = data.filter(
          (item) => item.status === "Approved",
        ).length;
        const rejected = data.filter(
          (item) => item.status === "Rejected",
        ).length;
        const students = new Set(data.map((item) => item.studentId)).size;
        setStats({ total, pending, approved, rejected, students });
        setRequests(data.slice(0, 5));
      } catch (err) {
        setError("Unable to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage campus clearance requests and review outstanding items.
        </p>
      </div>
      {loading && <LoadingSpinner />}
      {error && (
        <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
      )}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Total Students" value={stats.students} />
          <DashboardCard title="Total Requests" value={stats.total} />
          <DashboardCard title="Pending" value={stats.pending} />
          <DashboardCard title="Approved" value={stats.approved} />
        </div>
      )}
      {stats && (
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent Requests
          </h2>
          {requests.length === 0 ? (
            <div className="mt-4 rounded-3xl bg-yellow-50 p-6 text-yellow-700">
              No recent requests yet.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium text-slate-900">
                        {request.requestId}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {request.studentName}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {request.status}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
