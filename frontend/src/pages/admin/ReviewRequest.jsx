import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const ReviewRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/clearance/${id}`);
        setRequest(response.data.data);
        setRemarks(response.data.data.remarks || "");
      } catch (err) {
        setError("Unable to load request details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleUpdate = async (status) => {
    setError("");
    if (status === "Rejected" && !remarks.trim()) {
      setError("Please add remarks when rejecting a request.");
      return;
    }

    try {
      setSaving(true);
      await api.put(`/clearance/${id}`, { status, remarks });
      navigate("/admin/requests");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update request.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
    );
  if (!request) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Review Request
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {request.requestId}
            </h1>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Student
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.studentName}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Student ID
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.studentId}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Department
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.department}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Semester
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.semester}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Phone
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.phone}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Reason
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.reason}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Created Date
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Current Status
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.status}
              </p>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                Admin Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="min-h-[160px] rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700 outline-none focus:border-primary"
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleUpdate("Approved")}
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleUpdate("Rejected")}
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequest;
