import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clearance/my");
        setRequests(response.data.data);
      } catch {
        setError("Unable to load your clearance requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">My Requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track the status of your submitted clearance requests.
        </p>
      </div>

      {loading && <LoadingSpinner />}
      {error && (
        <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
      )}
      {!loading && !error && requests.length === 0 && (
        <div className="rounded-3xl bg-yellow-50 p-6 text-yellow-700">
          No clearance requests found.
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="overflow-x-auto rounded-[2rem] bg-white p-4 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">
                    {request.requestId}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {request.department || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{request.reason}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
                      to={`/student/requests/${request._id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
