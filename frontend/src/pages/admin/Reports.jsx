import { useEffect, useState } from "react";
import { HiDownload } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const csvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const Reports = () => {
  const [offices, setOffices] = useState([]);
  const [officeId, setOfficeId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/offices").then((response) => setOffices(response.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const params = {};
    if (officeId) params.officeId = officeId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    api.get("/admin/reports/summary", { params })
      .then((response) => active && setSummary(response.data.data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load reports."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [officeId, dateFrom, dateTo]);

  const exportCsv = async () => {
    try {
      const params = {};
      if (officeId) params.officeId = officeId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const response = await api.get("/admin/requests", { params });
      const headers = ["Request ID", "Student", "Student ID", "Purpose", "Overall status", "Office", "Approval status", "Remarks", "Submitted", "Decided at"];
      const rows = response.data.data.flatMap((request) => (request.approvals || []).map((approval) => [request._id, request.studentUserId?.name, request.studentUserId?.studentId, request.purpose, request.overallStatus, approval.officeId?.name, approval.status, approval.remarks, request.submittedAt, approval.decidedAt]));
      const content = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `clearpath-report-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Unable to export report.");
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Super admin</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Clearance reports</h1><p className="mt-2 text-sm text-slate-600">Request volumes, office backlog, and average decision time.</p></div><button type="button" onClick={exportCsv} disabled={loading || !summary?.total} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"><HiDownload />Export CSV</button></header>
      <section className="grid gap-3 sm:grid-cols-3"><div><label htmlFor="report-office" className="block text-xs font-semibold text-slate-600">Office</label><select id="report-office" value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">All offices</option>{offices.map((office) => <option key={office._id} value={office._id}>{office.name}</option>)}</select></div><div><label htmlFor="report-from" className="block text-xs font-semibold text-slate-600">Submitted from</label><input id="report-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" /></div><div><label htmlFor="report-to" className="block text-xs font-semibold text-slate-600">Submitted to</label><input id="report-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm" /></div></section>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingSpinner /> : summary && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><DashboardCard title="Total requests" value={summary.total} /><DashboardCard title="Pending" value={summary.pending} /><DashboardCard title="In progress" value={summary.inProgress} /><DashboardCard title="Cleared" value={summary.cleared} /><DashboardCard title="Rejected" value={summary.rejected} /></section>
        <section className="grid gap-8 border-t border-slate-200 pt-6 lg:grid-cols-2"><div><h2 className="text-xl font-semibold text-slate-900">Office pending backlog</h2>{summary.officeBacklog.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{summary.officeBacklog.map((office) => <div key={office.officeId} className="flex items-center justify-between gap-3 py-4"><div><p className="font-semibold text-slate-800">{office.name}</p><p className="text-xs text-slate-500">{office.code}</p></div><span className="text-2xl font-semibold text-amber-700">{office.pending}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">No pending office approvals.</p>}</div>
          <div><h2 className="text-xl font-semibold text-slate-900">Average decision time</h2><p className="mt-1 text-sm text-slate-500">Calculated from approval creation to staff decision.</p>{summary.averageApprovalTime.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{summary.averageApprovalTime.map((office) => <div key={office.officeId} className="flex items-center justify-between gap-3 py-4"><div><p className="font-semibold text-slate-800">{office.name}</p><p className="text-xs text-slate-500">{office.decisions} decisions</p></div><span className="text-sm font-semibold text-slate-700">{office.averageHours} h</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500">Decision timing appears after offices complete reviews.</p>}</div>
        </section>
      </>}
    </div>
  );
};

export default Reports;