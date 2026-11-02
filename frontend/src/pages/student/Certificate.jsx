import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext.js";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const Certificate = () => {
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/requests/my")
      .then((response) => active && setRequest((response.data.data || []).find((item) => item.overallStatus === "CLEARED") || null))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load your certificate."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (!request) return <section className="border-y border-slate-200 py-12 text-center"><h1 className="text-2xl font-semibold text-slate-900">Certificate not ready</h1><p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">A certificate becomes available after every configured office approves a request.</p><Link to="/student/requests" className="mt-5 inline-flex font-semibold text-primary">View requests</Link></section>;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3"><Link to="/student/dashboard" className="text-sm font-semibold text-primary">Back to dashboard</Link><button type="button" onClick={() => window.print()} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Print / Save PDF</button></div>
      <article className="print-certificate border border-slate-300 bg-white p-8 sm:p-12">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">ClearPath · Campus Records</p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">Campus Clearance Certificate</h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600">This confirms all configured offices have approved the clearance request below.</p>
        <p className="mt-4 text-center text-xs text-slate-500">Reference {String(request._id).slice(-12).toUpperCase()}</p>
        <dl className="mt-10 grid gap-4 border-y border-slate-200 py-6 sm:grid-cols-2"><div><dt className="text-xs uppercase text-slate-500">Student</dt><dd className="mt-1 font-semibold text-slate-900">{user?.name}</dd></div><div><dt className="text-xs uppercase text-slate-500">Student ID</dt><dd className="mt-1 font-semibold text-slate-900">{user?.studentId}</dd></div><div><dt className="text-xs uppercase text-slate-500">Department</dt><dd className="mt-1 font-semibold text-slate-900">{user?.department}</dd></div><div><dt className="text-xs uppercase text-slate-500">Purpose</dt><dd className="mt-1 font-semibold text-slate-900">{request.purpose}</dd></div></dl>
        <h2 className="mt-8 font-semibold text-slate-900">Office decisions</h2><ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{(request.approvals || []).map((approval) => <li key={approval._id} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="font-medium text-slate-700">{approval.officeId?.name}</span><StatusBadge status={approval.status} /></li>)}</ul>
        <p className="mt-8 text-center text-xs text-slate-500">Issued {new Date().toLocaleDateString()} · Request submitted {new Date(request.submittedAt).toLocaleDateString()}</p>
      </article>
    </div>
  );
};

export default Certificate;