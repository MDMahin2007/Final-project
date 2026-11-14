import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft, HiDocumentAdd, HiUpload } from "react-icons/hi";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const Apply = () => {
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [purpose, setPurpose] = useState("");
  const [files, setFiles] = useState([]);
  const [existing, setExisting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/requests/my")
      .then((response) => active && setExisting(response.data.data || []))
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to check your requests."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const activeRequest = existing.find((request) => ["PENDING", "IN_PROGRESS"].includes(request.overallStatus));

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((file) => file.type === "application/pdf" && file.size <= 4 * 1024 * 1024);
    if (valid.length !== selected.length) toast.error("PDF files up to 4 MB are allowed.");
    if (valid.length > 6) toast.error("Choose no more than six files.");
    setFiles(valid.slice(0, 6));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (purpose.trim().length < 3) {
      setError("Purpose must be at least 3 characters.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const response = await api.post("/requests", { purpose: purpose.trim() });
      const request = response.data.data;
      if (files.length) {
        try {
          for (const file of files) {
            const formData = new FormData();
            formData.append("documents", file);
            await api.post(`/requests/${request._id}/documents`, formData);
          }
        } catch {
          toast.error("Request submitted. Attachments could not be uploaded; add them from the request page.");
          navigate(`/student/requests/${request._id}`);
          return;
        }
      }
      toast.success("Clearance request submitted to all active offices.");
      navigate(`/student/requests/${request._id}`);
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to submit your request.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (activeRequest) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-7">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Current request</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">A request is already in progress</h1>
        <p className="mt-2 text-sm text-slate-600">Finish the current workflow before starting another request.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3"><StatusBadge status={activeRequest.overallStatus} /><span className="text-sm text-slate-600">{activeRequest.purpose}</span></div>
        <Link to={`/student/requests/${activeRequest._id}`} className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">View request</Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
      <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><HiArrowLeft />Dashboard</Link>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-primary">New request</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Start campus clearance</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">Your request will create one approval step for every active office, in configured order.</p>
      <form onSubmit={submit} className="mt-8 max-w-2xl space-y-6">
        <div>
          <label htmlFor="purpose" className="block text-sm font-semibold text-slate-700">Clearance purpose</label>
          <input id="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} minLength={3} maxLength={200} required placeholder="Semester final clearance" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-primary" />
        </div>
        <div>
          <div className="flex items-end justify-between gap-3">
            <div><label className="block text-sm font-semibold text-slate-700">Supporting documents</label><p className="mt-1 text-xs text-slate-500">Optional. PDF only, 4 MB each, up to 6 files.</p></div>
            <span className="text-xs text-slate-500">{files.length}/6</span>
          </div>
          <input ref={fileInput} type="file" accept="application/pdf,.pdf" multiple onChange={selectFiles} className="sr-only" />
          <button type="button" onClick={() => fileInput.current?.click()} className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><HiUpload />Choose PDFs</button>
          {files.length > 0 && <ul className="mt-3 divide-y divide-slate-100 border-y border-slate-100">{files.map((file) => <li key={`${file.name}-${file.lastModified}`} className="flex items-center gap-2 py-3 text-sm text-slate-700"><HiDocumentAdd className="shrink-0 text-primary" /><span className="min-w-0 flex-1 truncate">{file.name}</span><span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span></li>)}</ul>}
        </div>
        {error && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={submitting} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? "Submitting..." : "Submit request"}</button>
      </form>
    </section>
  );
};

export default Apply;