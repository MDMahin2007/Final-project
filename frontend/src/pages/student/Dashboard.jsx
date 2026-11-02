import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight, HiCheckCircle, HiClock } from "react-icons/hi";
import { AuthContext } from "../../context/authContext.js";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/requests/my")
      .then((response) => active && setRequests(response.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load your dashboard."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  const current = requests.find((request) => ["PENDING", "IN_PROGRESS"].includes(request.overallStatus));
  const totals = {
    total: requests.length,
    inProgress: requests.filter((request) => ["PENDING", "IN_PROGRESS"].includes(request.overallStatus)).length,
    cleared: requests.filter((request) => request.overallStatus === "CLEARED").length,
    rejected: requests.filter((request) => request.overallStatus === "REJECTED").length,
  };
  const approvals = current?.approvals || [];
  const approvedCount = approvals.filter((approval) => approval.status === "APPROVED").length;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-6">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Student workspace</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome, {user?.name || "Student"}</h1><p className="mt-2 text-sm text-slate-600">Follow your request from submission through every office decision.</p></div>
        <Link to="/student/apply" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">New request</Link>
      </header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="All requests" value={totals.total} />
        <DashboardCard title="In progress" value={totals.inProgress}><HiClock className="mt-3 h-5 w-5 text-amber-600" /></DashboardCard>
        <DashboardCard title="Cleared" value={totals.cleared}><HiCheckCircle className="mt-3 h-5 w-5 text-emerald-600" /></DashboardCard>
        <DashboardCard title="Rejected" value={totals.rejected} />
      </section>
      <section className="border-y border-slate-200 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">Current workflow</h2><p className="mt-1 text-sm text-slate-500">{current ? current.purpose : "Your active request appears here."}</p></div>{current && <StatusBadge status={current.overallStatus} />}</div>
        {!current ? <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-100 p-5"><p className="text-sm text-slate-700">No request is currently being reviewed. Start a request to begin the office approval flow.</p><Link to="/student/apply" className="shrink-0 font-semibold text-primary">Start clearance <HiArrowRight className="inline" /></Link></div> : <>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">{approvals.map((approval, index) => <div key={approval._id} className="border-l-2 border-slate-300 py-2 pl-4"><p className="text-xs text-slate-400">STEP {index + 1}</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-800">{approval.officeId?.name || "Office"}</span><StatusBadge status={approval.status} /></div>{approval.remarks && <p className="mt-2 text-sm text-slate-600">{approval.remarks}</p>}</div>)}</div>
          <p className="mt-4 text-sm text-slate-500">{approvedCount} of {approvals.length} offices approved</p>
          <Link to={`/student/requests/${current._id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Open timeline <HiArrowRight /></Link>
        </>}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-900">Recent requests</h2><Link to="/student/requests" className="text-sm font-semibold text-primary">View all</Link></div>
        {!requests.length ? <p className="border-y border-slate-200 py-6 text-sm text-slate-500">Your request history will appear here.</p> : <div className="divide-y divide-slate-200 border-y border-slate-200 bg-white">{requests.slice(0, 4).map((request) => <Link key={request._id} to={`/student/requests/${request._id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-slate-50"><div><p className="font-semibold text-slate-800">{request.purpose}</p><p className="mt-1 text-xs text-slate-500">{new Date(request.submittedAt || request.createdAt).toLocaleDateString()}</p></div><StatusBadge status={request.overallStatus} /></Link>)}</div>}
      </section>
    </div>
  );
};

export default StudentDashboard;