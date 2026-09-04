import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../context/authContext.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const Certificate = () => {
  const { user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/clearance/my");
        setRequest(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your certificate.",
        );
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!request || request.overallStatus !== "completed") {
    return (
      <section className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Certificate not ready
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          A clearance certificate is available only after every department has
          approved your request.
        </p>
        <Link
          to="/student/dashboard"
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/student/dashboard"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Back to dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          Print / Save PDF
        </button>
      </div>

      <article className="print-certificate rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          ClearPath
        </p>
        <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">
          Campus Clearance Certificate
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600">
          This confirms that the student named below has completed all required
          campus clearance departments.
        </p>
        <p className="mt-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Certificate reference: CP-
          {String(request._id).slice(-10).toUpperCase()}
        </p>

        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Student name
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {request.student?.name || user?.name}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Student ID
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {request.student?.studentId || user?.studentId}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Department
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {request.student?.department || user?.department}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Overall status
            </dt>
            <dd className="mt-2">
              <StatusBadge status={request.overallStatus} />
            </dd>
          </div>
        </dl>

        <h2 className="mt-10 text-lg font-semibold text-slate-900">
          Department decisions
        </h2>
        <ul className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {request.items.map((item) => (
            <li
              key={item._id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <span className="font-medium text-slate-800">
                {item.department}
              </span>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-slate-500">
          Issued {new Date().toLocaleDateString()} · Request submitted{" "}
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </article>
    </div>
  );
};

export default Certificate;
