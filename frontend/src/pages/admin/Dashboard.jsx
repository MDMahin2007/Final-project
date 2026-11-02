import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import DashboardCard from "../../components/DashboardCard.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/admin/reports/summary")
      .then((response) => active && setSummary(response.data.data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load the dashboard."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-6"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Super admin</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Campus clearance overview</h1><p className="mt-2 text-sm text-slate-600">Monitor request outcomes and office queues across the campus.</p></div><Link to="/admin/requests" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">Monitor requests</Link></header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {summary && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><DashboardCard title="Total requests" value={summary.total} /><DashboardCard title="Pending" value={summary.pending} /><DashboardCard title="In progress" value={summary.inProgress} /><DashboardCard title="Cleared" value={summary.cleared} /><DashboardCard title="Rejected" value={summary.rejected} /></section>
        <section className="grid gap-8 border-t border-slate-200 pt-6 lg:grid-cols-[1.2fr_0.8fr]"><div><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-semibold text-slate-900">Office workload</h2><p className="mt-1 text-sm text-slate-500">Open approvals grouped by assigned office.</p></div><Link to="/admin/reports" className="text-sm font-semibold text-primary">Reports</Link></div>{summary.officeBacklog.length ? <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{summary.officeBacklog.map((office) => <div key={office.officeId} className="flex items-center justify-between gap-4 py-4"><div><p className="font-semibold text-slate-800">{office.name}</p><p className="mt-1 text-xs text-slate-500">{office.code}</p></div><div className="flex items-center gap-3"><div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${summary.officeBacklog[0].pending ? Math.max(4, office.pending / summary.officeBacklog[0].pending * 100) : 0}%` }} /></div><span className="min-w-6 text-right font-semibold text-amber-800">{office.pending}</span></div></div>)}</div> : <p className="mt-4 border-y border-slate-200 py-6 text-sm text-slate-500">No pending approvals right now.</p>}</div>
          <div className="border-t border-slate-200 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><h2 className="text-xl font-semibold text-slate-900">System setup</h2><p className="mt-2 text-sm text-slate-500">Configure the offices and staff that process new requests.</p><div className="mt-4 grid gap-2"><Link to="/admin/offices" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white">Manage approval offices</Link><Link to="/admin/staff" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white">Create and assign staff</Link><Link to="/admin/reports" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-white">View date-filtered reports</Link></div></div>
        </section>
      </>}
    </div>
  );
};

export default AdminDashboard;