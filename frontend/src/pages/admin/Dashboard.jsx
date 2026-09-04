import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await api.get("/clearance");
      setRequests(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load the admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) return <LoadingSpinner />;
  const pending = requests.filter(
    (request) => request.overallStatus === "pending",
  ).length;
  const completed = requests.filter(
    (request) => request.overallStatus === "completed",
  ).length;
  const rejected = requests.filter(
    (request) => request.overallStatus === "rejected",
  ).length;
  const departmentBreakdown = [
    "Library",
    "Hostel",
    "Accounts",
    "Department",
  ].map((department) => ({
    department,
    approved: requests.filter((request) =>
      request.items?.some(
        (item) => item.department === department && item.status === "approved",
      ),
    ).length,
    pending: requests.filter((request) =>
      request.items?.some(
        (item) => item.department === department && item.status === "pending",
      ),
    ).length,
    rejected: requests.filter((request) =>
      request.items?.some(
        (item) => item.department === department && item.status === "rejected",
      ),
    ).length,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Administration
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Clearance overview
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review outstanding department approvals and monitor campus
              clearance progress.
            </p>
          </div>
          <Link
            to="/admin/requests"
            className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Manage requests
          </Link>
        </div>
      </section>
      {error && (
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total requests" value={requests.length} />
        <DashboardCard title="Awaiting review" value={pending} />
        <DashboardCard title="Completed" value={completed} />
        <DashboardCard title="Rejected" value={rejected} />
      </div>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Department status breakdown
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {departmentBreakdown.map((item) => (
            <DashboardCard
              key={item.department}
              title={item.department}
              value={item.pending}
            >
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p>
                  <span className="font-semibold text-emerald-600">
                    {item.approved}
                  </span>{" "}
                  approved
                </p>
                <p>
                  <span className="font-semibold text-amber-600">
                    {item.pending}
                  </span>{" "}
                  pending
                </p>
                <p>
                  <span className="font-semibold text-red-600">
                    {item.rejected}
                  </span>{" "}
                  rejected
                </p>
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Latest requests
        </h2>
        {requests.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            No student requests have been submitted yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-slate-100">
            {requests.slice(0, 5).map((request) => (
              <div
                key={request._id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {request.student?.name || "Student"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.student?.studentId || "No student ID"} · Submitted{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={request.overallStatus} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
