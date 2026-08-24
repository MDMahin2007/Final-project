import { useContext, useEffect, useState } from "react";
import api from "../../services/api.js";
import { AuthContext } from "../../context/authContext.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clearance/my");
        const requests = response.data.data;
        const total = requests.length;
        const pending = requests.filter(
          (item) => item.status === "Pending",
        ).length;
        const approved = requests.filter(
          (item) => item.status === "Approved",
        ).length;
        const rejected = requests.filter(
          (item) => item.status === "Rejected",
        ).length;
        setStats({ total, pending, approved, rejected });
      } catch {
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-primary">
            Student Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Welcome back, {user?.name || "Student"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track your clearance requests and see the latest status updates.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/student/new-request"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            New Request
          </Link>
          <Link
            to="/student/requests"
            className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            View My Requests
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && (
        <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
      )}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard title="Total Requests" value={stats.total} />
          <DashboardCard title="Pending" value={stats.pending} />
          <DashboardCard title="Approved" value={stats.approved} />
          <DashboardCard title="Rejected" value={stats.rejected} />
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
