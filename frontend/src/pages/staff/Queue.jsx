import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext.js";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const StaffQueue = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/staff/requests", { params: { status } })
      .then((response) => active && setRequests(response.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load assigned requests."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [status]);

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Office staff</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Assigned requests</h1><p className="mt-2 text-sm text-slate-600">Only requests routed to your assigned office appear here.</p></header>
      <div className="flex flex-wrap gap-2">{["PENDING", "IN_PROGRESS", "CLEARED", "REJECTED", "ALL"].map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-4 py-2 text-xs font-semibold ${status === value ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-white"}`}>{value.replaceAll("_", " ")}</button>)}</div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <LoadingSpinner /> : requests.length ? <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">{requests.map((request) => {
        const officeId = String(user?.officeId?._id || user?.officeId || "");
        const approval = request.approvals?.find((item) => String(item.officeId?._id || item.officeId) === officeId);
        return <article key={request._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="font-semibold text-slate-900">{request.purpose}</h2><StatusBadge status={request.overallStatus} /></div><p className="mt-2 text-sm text-slate-600">{request.studentUserId?.name || "Student"} · {request.studentUserId?.studentId || "No student ID"}</p><p className="mt-1 text-xs text-slate-500">Submitted {new Date(request.submittedAt || request.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><StatusBadge status={approval?.status} /><Link to={`/staff/requests/${request._id}`} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Review</Link></div></article>;
      })}</div> : <div className="border-y border-slate-200 py-12 text-center"><p className="font-semibold text-slate-800">Queue is clear</p><p className="mt-2 text-sm text-slate-500">No requests match this status.</p></div>}
    </div>
  );
};

export default StaffQueue;