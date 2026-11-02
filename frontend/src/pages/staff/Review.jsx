import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft } from "react-icons/hi";
import { AuthContext } from "../../context/authContext.js";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { getMediaUrl } from "../../services/media.js";

const Review = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/requests/${id}`)
      .then((response) => active && setRequest(response.data.data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load this assigned request."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const officeId = String(user?.officeId?._id || user?.officeId || "");
  const approval = request?.approvals?.find((item) => String(item.officeId?._id || item.officeId) === officeId);

  const decide = async (decision) => {
    if (decision === "reject" && remarks.trim().length < 3) {
      setError("A rejection reason of at least 3 characters is required.");
      return;
    }
    try {
      setSaving(true);
      const response = await api.patch(`/staff/approvals/${approval._id}/${decision}`, { remarks: remarks.trim() });
      setRequest(response.data.data);
      toast.success(response.data.message);
      navigate("/staff/requests");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to record this decision.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !request) return <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (!request) return null;

  return (
    <div className="space-y-6">
      <Link to="/staff/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><HiArrowLeft />Assigned requests</Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Review request</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">{request.purpose}</h1><p className="mt-2 text-sm text-slate-600">{request.studentUserId?.name || "Student"} · {request.studentUserId?.studentId || "No ID"} · {request.studentUserId?.department || ""}</p></div><StatusBadge status={request.overallStatus} /></header>
      <section><h2 className="text-lg font-semibold text-slate-900">Approval progress</h2><ol className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{(request.approvals || []).map((item, index) => <li key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium text-slate-800">{index + 1}. {item.officeId?.name || "Office"}</p>{item.remarks && <p className="mt-1 text-sm text-slate-500">{item.remarks}</p>}</div><StatusBadge status={item.status} /></li>)}</ol></section>
      <section><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Submitted documents</h2><p className="mt-1 text-sm text-slate-500">Review student-provided supporting documents.</p></div></div>{request.documents?.length ? <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{request.documents.map((document) => <li key={document._id || document.url} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="truncate text-slate-700">{document.name}</span><a href={getMediaUrl(document.url)} target="_blank" rel="noreferrer" className="font-semibold text-primary">Open PDF</a></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No supporting documents attached.</p>}</section>
      {approval?.status === "PENDING" && ["PENDING", "IN_PROGRESS"].includes(request.overallStatus) ? <section className="max-w-2xl border-t border-slate-200 pt-5"><label htmlFor="remarks" className="block text-sm font-semibold text-slate-700">Remarks <span className="font-normal text-slate-400">(required for rejection)</span></label><textarea id="remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={1000} rows={4} placeholder="Record the verification result or reason" className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-primary" />{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}<div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={saving} onClick={() => decide("approve")} className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? "Saving..." : "Approve"}</button><button type="button" disabled={saving} onClick={() => decide("reject")} className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">Reject</button></div></section> : <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">This office has already decided or the request is closed.</p>}
    </div>
  );
};

export default Review;