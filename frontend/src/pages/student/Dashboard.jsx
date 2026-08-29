import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiCheckCircle, HiDocumentAdd, HiExclamationCircle } from "react-icons/hi";
import api from "../../services/api.js";
import { AuthContext } from "../../context/authContext.js";
import ClearanceTracker from "../../components/ClearanceTracker.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadRequest = async () => {
    try {
      setError("");
      const response = await api.get("/clearance/my");
      setRequest(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your clearance request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadRequest(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const applyForClearance = async () => {
    try {
      setSubmitting(true);
      const response = await api.post("/clearance");
      setRequest(response.data.data);
      toast.success("Your clearance request has been submitted.");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to submit your clearance request.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Student Dashboard</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Welcome, {user?.name || "Student"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Submit one clearance request and follow each department&apos;s decision in one place.</p>
          </div>
          {request && <StatusBadge status={request.overallStatus} />}
        </div>
      </section>

      {error && <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">{error}</div>}

      {!request ? (
        <section className="rounded-[2rem] border border-dashed border-primary/30 bg-blue-50 p-8 text-center sm:p-12">
          <HiDocumentAdd className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">Ready to begin your clearance?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">Your request will be sent to Library, Hostel, Accounts, and your Department. It cannot be edited after submission.</p>
          <button type="button" onClick={applyForClearance} disabled={submitting} className="mt-7 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? "Submitting request..." : "Apply for Clearance"}
          </button>
        </section>
      ) : (
        <>
          <section className={`rounded-[2rem] p-6 ${request.overallStatus === "completed" ? "bg-emerald-50" : request.overallStatus === "rejected" ? "bg-red-50" : "bg-amber-50"}`}>
            <div className="flex items-start gap-4">
              {request.overallStatus === "completed" ? <HiCheckCircle className="h-8 w-8 shrink-0 text-emerald-600" /> : <HiExclamationCircle className={`h-8 w-8 shrink-0 ${request.overallStatus === "rejected" ? "text-red-600" : "text-amber-600"}`} />}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{request.overallStatus === "completed" ? "Clearance completed" : request.overallStatus === "rejected" ? "Clearance needs attention" : "Clearance is under review"}</h2>
                <p className="mt-1 text-sm text-slate-600">Submitted {new Date(request.createdAt).toLocaleDateString()}. Each department will update its item separately.</p>
              </div>
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Department clearance tracker</h2>
              <span className="text-sm text-slate-500">{request.items.filter((item) => item.status === "approved").length} of {request.items.length} approved</span>
            </div>
            <ClearanceTracker items={request.items} />
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
