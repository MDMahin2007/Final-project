import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiDocumentAdd,
  HiExclamationCircle,
  HiUpload,
} from "react-icons/hi";
import api from "../../services/api.js";
import { AuthContext } from "../../context/authContext.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const departments = ["Library", "Hostel", "Accounts", "Department"];

const Apply = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/clearance/my");
        setRequest(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to check your clearance status.",
        );
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );
    if (valid.length !== selected.length) {
      setError("Only PDF files up to 5MB each can be uploaded.");
      toast.error("Some files were rejected. Choose PDF files up to 5MB each.");
    } else {
      setError("");
    }
    setFiles(valid.slice(0, 6));
  };

  const submitApplication = async () => {
    let requestCreated = false;
    try {
      setSubmitting(true);
      setError("");
      await api.post("/clearance");
      requestCreated = true;
      if (files.length) {
        const formData = new FormData();
        files.forEach((file) => formData.append("documents", file));
        await api.post("/clearance/documents", formData);
      }
      toast.success("Your clearance request has been submitted.");
      navigate("/student/dashboard");
    } catch (err) {
      if (requestCreated) {
        const message =
          "Your request was submitted, but the documents could not be uploaded. Add them from the dashboard.";
        toast.error(message);
        navigate("/student/dashboard");
        return;
      }
      const message =
        err.response?.data?.message ||
        "Unable to submit your clearance request.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resubmitRejected = async () => {
    try {
      setResubmitting(true);
      setError("");
      await api.post("/clearance/my/resubmit");
      toast.success("Rejected departments were reset to pending.");
      navigate("/student/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to resubmit rejected departments.";
      setError(message);
      toast.error(message);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (request && request.overallStatus === "rejected") {
    return (
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <HiExclamationCircle className="h-12 w-12 text-red-600" />
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Some departments rejected your request
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600">
          You can't start a brand-new request, but you can resubmit the rejected
          departments — approved departments stay approved. Add or replace
          supporting documents from your dashboard first if a rejection was
          about a document.
        </p>
        {error && (
          <div className="mt-6 rounded-3xl bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resubmitRejected}
            disabled={resubmitting}
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resubmitting ? "Resubmitting..." : "Resubmit rejected departments"}
          </button>
          <Link
            to="/student/dashboard"
            className="inline-flex rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-blue-50"
          >
            Manage documents on dashboard
          </Link>
        </div>
      </section>
    );
  }

  if (request) {
    return (
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <HiCheckCircle className="h-12 w-12 text-emerald-600" />
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Clearance already submitted
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600">
          You can only submit one clearance request. Review its current
          department status from your dashboard.
        </p>
        <Link
          to="/student/dashboard"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          View dashboard
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-sky-600"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          New clearance request
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Apply for clearance
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Confirm your details, attach supporting PDF documents, and send one
          request to all four departments.
        </p>
        {error && (
          <div className="mt-6 rounded-3xl bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Name
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.name || "Not provided"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Student ID
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.studentId || "Not provided"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Department
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.department || "Not provided"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Departments reviewing your request
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
              <HiCheckCircle className="mr-2 inline h-5 w-5 text-emerald-600" />
              {departments[0]}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
              <HiCheckCircle className="mr-2 inline h-5 w-5 text-emerald-600" />
              {departments[1]}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
              <HiCheckCircle className="mr-2 inline h-5 w-5 text-emerald-600" />
              {departments[2]}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
              <HiCheckCircle className="mr-2 inline h-5 w-5 text-emerald-600" />
              {departments[3]}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <h2 className="text-xl font-semibold text-slate-900">
            Supporting documents
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            At least one PDF is required. Files must be up to 5MB each, with a
            maximum of six.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={selectFiles}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-blue-50"
          >
            <HiUpload className="h-5 w-5" />
            Choose PDF files
          </button>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700"
                >
                  <HiDocumentAdd className="h-5 w-5 text-primary" />
                  {file.name}
                  <span className="ml-auto text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-blue-50 p-5">
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            I confirm that the information above is accurate and understand that
            one request will be sent to all four departments.
          </label>
        </div>
        <button
          type="button"
          onClick={submitApplication}
          disabled={!confirmed || !files.length || submitting}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting request..." : "Submit clearance request"}
        </button>
      </section>
    </div>
  );
};

export default Apply;
