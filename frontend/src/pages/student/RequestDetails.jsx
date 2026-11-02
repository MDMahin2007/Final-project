import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft, HiUpload } from "react-icons/hi";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { getMediaUrl } from "../../services/media.js";

const RequestDetails = () => {
  const { id } = useParams();
  const fileInput = useRef(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadRequest = async () => {
    const response = await api.get(`/requests/${id}`);
    setRequest(response.data.data);
  };

  useEffect(() => {
    let active = true;
    api.get(`/requests/${id}`)
      .then((response) => active && setRequest(response.data.data))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load this request."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const cancel = async () => {
    if (!window.confirm("Cancel this request before office review begins?")) return;
    try {
      setBusy(true);
      const response = await api.patch(`/requests/${id}/cancel`);
      setRequest(response.data.data);
      toast.success("Request cancelled.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to cancel request.";
      setError(message);
      toast.error(message);
      await loadRequest();
    } finally {
      setBusy(false);
    }
  };

  const uploadDocuments = async (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length) return;
    const existingCount = request.documents?.length || 0;
    const valid = selected.filter((file) => file.type === "application/pdf" && file.size <= 4 * 1024 * 1024);
    if (valid.length !== selected.length) toast.error("PDF files up to 4 MB are allowed.");
    if (!valid.length || existingCount + valid.length > 6) {
      if (valid.length && existingCount + valid.length > 6) toast.error("A request can have up to six documents.");
      return;
    }
    try {
      setBusy(true);
      for (const file of valid) {
        const formData = new FormData();
        formData.append("documents", file);
        const response = await api.post(`/requests/${id}/documents`, formData);
        setRequest(response.data.data);
      }
      toast.success("Documents uploaded.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error && !request) return <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</div>;
  if (!request) return null;
  const canCancel = request.overallStatus === "PENDING" && (request.approvals || []).every((approval) => approval.status === "PENDING");
  const canAttach = !["CLEARED", "CANCELLED"].includes(request.overallStatus) && (request.documents?.length || 0) < 6;

  return (
    <div className="space-y-6">
      <Link to="/student/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><HiArrowLeft />All requests</Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Clearance request</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">{request.purpose}</h1><p className="mt-2 text-sm text-slate-500">Submitted {new Date(request.submittedAt || request.createdAt).toLocaleString()}</p></div>
        <StatusBadge status={request.overallStatus} />
      </header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">Approval timeline</h2><p className="mt-1 text-sm text-slate-500">Offices review this request in workflow order.</p></div><span className="text-sm text-slate-500">{(request.approvals || []).filter((approval) => approval.status === "APPROVED").length} / {(request.approvals || []).length} approved</span></div>
        <ol className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {(request.approvals || []).map((approval, index) => <li key={approval._id} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{index + 1}</span>
            <div><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold text-slate-900">{approval.officeId?.name || "Office"}</h3><span className="text-xs text-slate-400">{approval.officeId?.code}</span></div>{approval.remarks && <p className="mt-2 text-sm text-slate-600">{approval.remarks}</p>}{approval.staffId?.name && <p className="mt-2 text-xs text-slate-500">Reviewed by {approval.staffId.name}</p>}{approval.decidedAt && <time className="mt-1 block text-xs text-slate-400">{new Date(approval.decidedAt).toLocaleString()}</time>}</div>
            <StatusBadge status={approval.status} />
          </li>)}
        </ol>
      </section>
      <section className="border-t border-slate-200 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">Documents</h2><p className="mt-1 text-sm text-slate-500">Optional PDF files attached to this request.</p></div>{canAttach && <><input type="file" ref={fileInput} accept="application/pdf,.pdf" multiple className="sr-only" onChange={uploadDocuments} /><button type="button" disabled={busy} onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"><HiUpload />Add files</button></>}</div>
        {request.documents?.length ? <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{request.documents.map((document) => <li key={document._id || document.url} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0 truncate font-medium text-slate-700">{document.name}</span><a href={getMediaUrl(document.url)} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-primary">Open PDF</a></li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No documents attached.</p>}
      </section>
      {request.timeline?.length > 0 && <section className="border-t border-slate-200 pt-5"><h2 className="text-lg font-semibold text-slate-900">Activity log</h2><ol className="mt-3 space-y-3">{request.timeline.map((event) => <li key={event._id} className="flex flex-wrap justify-between gap-x-5 gap-y-1 text-sm"><span className="text-slate-700">{event.message || event.action.replaceAll("_", " ")} <span className="text-slate-400">{event.actorUserId?.name ? `· ${event.actorUserId.name}` : ""}</span></span><time className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleString()}</time></li>)}</ol></section>}
      {canCancel && <div className="border-t border-slate-200 pt-5"><button type="button" disabled={busy} onClick={cancel} className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{busy ? "Please wait..." : "Cancel request"}</button><p className="mt-2 text-xs text-slate-500">Cancellation is available only before any office has started review.</p></div>}
    </div>
  );
};

export default RequestDetails;