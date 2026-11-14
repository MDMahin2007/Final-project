import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const StudentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/requests/my")
      .then((response) => active && setRequests(response.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load your requests."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const visible = status === "ALL" ? requests : requests.filter((request) => request.overallStatus === status);
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Student workspace</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">My requests</h1><p className="mt-2 text-sm text-slate-600">Every request and office decision, in one place.</p></div>
        <Link to="/student/apply" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">New request</Link>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by request status">
        {["ALL", "PENDING", "IN_PROGRESS", "CLEARED", "REJECTED", "CANCELLED"].map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-4 py-2 text-xs font-semibold ${status === value ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-white"}`}>{value.replaceAll("_", " ")}</button>)}
      </div>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!visible.length ? <section className="border-y border-slate-200 py-12 text-center"><p className="font-semibold text-slate-800">No requests in this view</p><p className="mt-2 text-sm text-slate-500">Start a request when you are ready.</p></section> : (
        <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {visible.map((request) => {
            const approvals = request.approvals || [];
            const completedSteps = approvals.filter((approval) => approval.status !== "PENDING").length;
            return <article key={request._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate font-semibold text-slate-900">{request.purpose}</h2><StatusBadge status={request.overallStatus} /></div><p className="mt-2 text-sm text-slate-500">Submitted {new Date(request.submittedAt || request.createdAt).toLocaleDateString()} · {completedSteps} of {approvals.length} offices decided</p></div>
              <Link to={`/student/requests/${request._id}`} className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">View timeline</Link>
            </article>;
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRequests;