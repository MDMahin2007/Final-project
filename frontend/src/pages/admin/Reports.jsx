import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiDownload } from "react-icons/hi";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const escapeCsvValue = (value) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

const Reports = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/clearance");
        setRequests(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load clearance reports.",
        );
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const summary = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(
      (request) => request.overallStatus === "completed",
    ).length;
    return {
      total,
      approved: completed,
      pending: requests.filter((request) => request.overallStatus === "pending")
        .length,
      rejected: requests.filter(
        (request) => request.overallStatus === "rejected",
      ).length,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [requests]);

  const departmentBreakdown = useMemo(() => {
    const departments = [
      ...new Set(
        requests.flatMap(
          (request) => request.items?.map((item) => item.department) || [],
        ),
      ),
    ];
    return departments.map((department) => {
      const items = requests.flatMap(
        (request) =>
          request.items?.filter((item) => item.department === department) || [],
      );
      return {
        department,
        approved: items.filter((item) => item.status === "approved").length,
        pending: items.filter((item) => item.status === "pending").length,
        rejected: items.filter((item) => item.status === "rejected").length,
        total: items.length,
      };
    });
  }, [requests]);

  const exportCsv = () => {
    const headers = [
      "Request ID",
      "Student name",
      "Student ID",
      "Student email",
      "Student department",
      "Overall status",
      "Clearance department",
      "Item status",
      "Remarks",
      "Last updated",
    ];
    const rows = requests.flatMap(
      (request) =>
        request.items?.map((item) => [
          request._id,
          request.student?.name,
          request.student?.studentId,
          request.student?.email,
          request.student?.department,
          request.overallStatus,
          item.department,
          item.status,
          item.remarks,
          item.updatedAt ? new Date(item.updatedAt).toISOString() : "",
        ]) || [],
    );
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `clearpath-clearance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Clearance report exported.");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Clearance reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review campus-wide clearance progress from the current request
              records.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!requests.length}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiDownload className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </section>
      {error && (
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}
      {!requests.length ? (
        <section className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          No clearance applications found.
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard title="Total applications" value={summary.total} />
            <DashboardCard title="Approved" value={summary.approved}>
              <StatusBadge status="approved" />
            </DashboardCard>
            <DashboardCard title="Pending" value={summary.pending}>
              <StatusBadge status="pending" />
            </DashboardCard>
            <DashboardCard title="Rejected" value={summary.rejected}>
              <StatusBadge status="rejected" />
            </DashboardCard>
          </div>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Completion rate
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Requests approved by every department.
                </p>
              </div>
              <span className="text-2xl font-semibold text-primary">
                {summary.completionRate}%
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${summary.completionRate}%` }}
              />
            </div>
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Department breakdown
            </h2>
            <div className="mt-4 space-y-5">
              {departmentBreakdown.map((item) => (
                <div key={item.department}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {item.department}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {item.total} applications
                    </span>
                  </div>
                  <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-emerald-500"
                      style={{
                        width: `${(item.approved / item.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{ width: `${(item.pending / item.total) * 100}%` }}
                    />
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${(item.rejected / item.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      <strong className="text-emerald-600">
                        {item.approved}
                      </strong>{" "}
                      approved
                    </span>
                    <span>
                      <strong className="text-amber-600">{item.pending}</strong>{" "}
                      pending
                    </span>
                    <span>
                      <strong className="text-red-600">{item.rejected}</strong>{" "}
                      rejected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Reports;
