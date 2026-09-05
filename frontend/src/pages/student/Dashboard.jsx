import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiCheckCircle, HiExclamationCircle, HiUpload } from "react-icons/hi";
import { HiCheck, HiClock, HiX } from "react-icons/hi";
import api from "../../services/api.js";
import { AuthContext } from "../../context/authContext.js";
import ClearanceTracker from "../../components/ClearanceTracker.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import DashboardCard from "../../components/DashboardCard.jsx";
import { getMediaUrl } from "../../services/media.js";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  const loadRequest = async () => {
    try {
      setError("");
      const response = await api.get("/clearance/my");
      setRequest(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your clearance request.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequest();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const resubmitRejected = async () => {
    try {
      setSubmitting(true);
      const response = await api.post("/clearance/my/resubmit");
      setRequest(response.data.data);
      toast.success(response.data.message);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to resubmit rejected departments.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const uploadDocuments = async (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length) return;

    const currentCount = request?.documents?.length || 0;
    const valid = selected.filter(
      (file) => file.type === "application/pdf" && file.size <= 5 * 1024 * 1024,
    );
    if (valid.length !== selected.length) {
      toast.error("Only PDF files up to 5MB each can be uploaded.");
    }
    if (!valid.length) return;
    if (currentCount + valid.length > 6) {
      toast.error(
        `You can attach up to 6 documents total (${currentCount} already uploaded).`,
      );
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      valid.forEach((file) => formData.append("documents", file));
      const response = await api.post("/clearance/documents", formData);
      setRequest(response.data.data);
      toast.success("Documents uploaded successfully.");
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to upload documents.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const items = request?.items || [];
  const approvedCount = items.filter(
    (item) => item.status === "approved",
  ).length;
  const pendingCount = items.filter((item) => item.status === "pending").length;
  const rejectedCount = items.filter(
    (item) => item.status === "rejected",
  ).length;
  const recentActivity = [...items].sort(
    (first, second) =>
      new Date(second.updatedAt || 0) - new Date(first.updatedAt || 0),
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Student Dashboard
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Welcome, {user?.name || "Student"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Submit one clearance request and follow each department&apos;s
              decision in one place.
            </p>
          </div>
          {request && <StatusBadge status={request.overallStatus} />}
        </div>
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Student ID
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.studentId || "—"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Department
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.department || "—"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {user?.email || "—"}
            </dd>
          </div>
        </dl>
        <Link
          to="/student/profile"
          className="mt-5 inline-flex rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
        >
          View Profile
        </Link>
      </section>

      {error && (
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!request ? (
        <section className="rounded-[2rem] border border-dashed border-primary/30 bg-blue-50 p-8 text-center sm:p-12">
          <HiCheckCircle className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">
            Ready to begin your clearance?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
            Your request will be sent to Library, Hostel, Accounts, and your
            Department. It cannot be edited after submission.
          </p>
          <Link
            to="/student/apply"
            className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            Apply for Clearance
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard title="Approved departments" value={approvedCount}>
              <HiCheck className="mt-3 h-5 w-5 text-emerald-600" />
            </DashboardCard>
            <DashboardCard title="Pending departments" value={pendingCount}>
              <HiClock className="mt-3 h-5 w-5 text-amber-600" />
            </DashboardCard>
            <DashboardCard title="Rejected departments" value={rejectedCount}>
              <HiX className="mt-3 h-5 w-5 text-red-600" />
            </DashboardCard>
            <DashboardCard title="Total departments" value={items.length} />
          </section>
          <section
            className={`rounded-[2rem] p-6 ${request.overallStatus === "completed" ? "bg-emerald-50" : request.overallStatus === "rejected" ? "bg-red-50" : "bg-amber-50"}`}
          >
            <div className="flex items-start gap-4">
              {request.overallStatus === "completed" ? (
                <HiCheckCircle className="h-8 w-8 shrink-0 text-emerald-600" />
              ) : (
                <HiExclamationCircle
                  className={`h-8 w-8 shrink-0 ${request.overallStatus === "rejected" ? "text-red-600" : "text-amber-600"}`}
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {request.overallStatus === "completed"
                    ? "Clearance completed"
                    : request.overallStatus === "rejected"
                      ? "Clearance needs attention"
                      : "Clearance is under review"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Submitted {new Date(request.createdAt).toLocaleDateString()}.
                  Each department will update its item separately.
                </p>
                {request.overallStatus === "completed" && (
                  <Link
                    to="/student/certificate"
                    className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    View certificate
                  </Link>
                )}
                {request.overallStatus === "rejected" && (
                  <button
                    type="button"
                    onClick={resubmitRejected}
                    disabled={submitting}
                    className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-70"
                  >
                    {submitting
                      ? "Resubmitting..."
                      : "Resubmit rejected departments"}
                  </button>
                )}
              </div>
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Department clearance tracker
              </h2>
              <span className="text-sm text-slate-500">
                {
                  request.items.filter((item) => item.status === "approved")
                    .length
                }{" "}
                of {request.items.length} approved
              </span>
            </div>
            <ClearanceTracker items={request.items} />
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  The latest update from each department.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {recentActivity.length} departments
              </span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div
                    key={item._id || item.department}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">
                          {item.department}
                        </p>
                        <StatusBadge status={item.status} />
                      </div>
                      {item.remarks && (
                        <p className="mt-1 text-sm text-slate-600">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                    <time
                      className="shrink-0 text-xs text-slate-500"
                      dateTime={item.updatedAt}
                    >
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleString()
                        : "No update date"}
                    </time>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  No department activity is available yet.
                </p>
              )}
            </div>
          </section>
          <section className="rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Submitted documents
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Supporting files attached to this request.
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {request.documents?.length || 0} files
              </span>
            </div>
            {request.documents?.length ? (
              <ul className="mt-4 space-y-2">
                {request.documents.map((document) => (
                  <li
                    key={document._id || document.url}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                      {document.name}
                    </span>
                    <a
                      href={getMediaUrl(document.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      View
                    </a>
                    <a
                      href={getMediaUrl(document.url)}
                      download={document.name}
                      className="font-semibold text-primary hover:underline"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No documents submitted.
              </p>
            )}
            {request.overallStatus !== "completed" && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <input
                  ref={fileInput}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  onChange={uploadDocuments}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading || (request.documents?.length || 0) >= 6}
                  className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <HiUpload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Add supporting documents"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  PDF only, up to 5MB each, 6 documents maximum.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
