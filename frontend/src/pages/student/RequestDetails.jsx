import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/clearance/${id}`);
        setRequest(response.data.data);
      } catch {
        setError("Unable to load request details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

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
              Request Details
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
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Reason
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {request.reason}
              </p>
            </div>
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
                Admin Remarks
              </p>
              <p className="mt-2 min-h-[4rem] whitespace-pre-wrap rounded-3xl bg-slate-50 p-4 text-slate-700">
                {request.remarks || "No remarks yet."}
              </p>
            </div>
            {request.reviewedAt && (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Reviewed
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {new Date(request.reviewedAt).toLocaleString()}
                  {request.reviewedBy?.name ? ` by ${request.reviewedBy.name}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
