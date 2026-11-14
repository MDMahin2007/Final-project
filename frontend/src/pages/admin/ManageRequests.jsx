import { useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [offices, setOffices] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [officeId, setOfficeId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/admin/offices").then((response) => active && setOffices(response.data.data || [])).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const params = {};
    if (status !== "ALL") params.status = status;
    if (officeId) params.officeId = officeId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    api.get("/admin/requests", { params })
      .then((response) => active && setRequests(response.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load requests."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [status, officeId, dateFrom, dateTo]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => [request.purpose, request.studentUserId?.name, request.studentUserId?.studentId, request.studentUserId?.email].some((value) => value?.toLowerCase().includes(query)));
  }, [requests, search]);

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Super admin</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Request monitoring</h1><p className="mt-2 text-sm text-slate-600">Monitor all requests and their office-by-office approval timelines.</p></header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <input aria-label="Search requests" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, ID, or purpose" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <select aria-label="Overall status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="ALL">All statuses</option>{["PENDING", "IN_PROGRESS", "CLEARED", "REJECTED", "CANCELLED"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
        <select aria-label="Filter by office" value={officeId} onChange={(event) => setOfficeId(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="">All offices</option>{offices.map((office) => <option key={office._id} value={office._id}>{office.name}</option>)}</select>
        <div className="flex gap-2"><input aria-label="From date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-2 py-2 text-sm" /><input aria-label="To date" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-2 py-2 text-sm" /></div>
      </section>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingSpinner /> : visible.length ? <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">{visible.map((request) => <details key={request._id} className="group px-4 py-4 sm:px-6"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4"><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{request.purpose}</h2><p className="mt-1 text-sm text-slate-500">{request.studentUserId?.name || "Student"} · {request.studentUserId?.studentId || "No ID"} · {new Date(request.submittedAt).toLocaleDateString()}</p></div><StatusBadge status={request.overallStatus} /></summary><ol className="mt-4 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">{(request.approvals || []).map((approval) => <li key={approval._id} className="rounded-lg bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold text-slate-800">{approval.officeId?.name}</span><StatusBadge status={approval.status} /></div>{approval.remarks && <p className="mt-2 text-xs text-slate-600">{approval.remarks}</p>}{approval.staffId?.name && <p className="mt-1 text-xs text-slate-400">{approval.staffId.name}</p>}</li>)}</ol><p className="mt-3 text-xs text-slate-400">Request ID: {request._id}</p></details>)}</div> : <p className="border-y border-slate-200 py-12 text-center text-sm text-slate-500">No requests match these filters.</p>}
    </div>
  );
};

export default ManageRequests;