import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiChevronDown, HiChevronUp } from "react-icons/hi";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { getInitial, getMediaUrl } from "../../services/media.js";

const filters = ["all", "pending", "completed", "rejected"];
const departments = ["all", "Library", "Hostel", "Accounts", "Department"];

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [savingItem, setSavingItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/clearance", {
        params: filter === "all" ? {} : { status: filter },
      });
      setRequests(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load clearance requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadRequests]);

  const visibleRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        [
          request.student?.name,
          request.student?.email,
          request.student?.studentId,
          request.student?.department,
        ].some((value) => value?.toLowerCase().includes(query));
      const matchesDepartment =
        departmentFilter === "all" ||
        request.items?.some(
          (item) =>
            item.department === departmentFilter && item.status !== "approved",
        );
      return matchesSearch && matchesDepartment;
    });
  }, [requests, search, departmentFilter]);

  const updateItem = async (requestId, itemId, status) => {
    try {
      setSavingItem(itemId);
      const response = await api.patch(
        `/clearance/${requestId}/item/${itemId}`,
        { status, remarks: remarks[itemId] || "" },
      );
      setRequests((current) => {
        const updatedRequest = response.data.data;
        if (filter !== "all" && updatedRequest.overallStatus !== filter) {
          return current.filter((request) => request._id !== requestId);
        }
        return current.map((request) =>
          request._id === requestId ? updatedRequest : request,
        );
      });
      toast.success(response.data.message);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to update this department item.";
      setError(message);
      toast.error(message);
    } finally {
      setSavingItem("");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Administration
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Manage clearance requests
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Expand a request to approve or reject each department with an optional
          note.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student name, ID, email, or department"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {filters.map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => {
                  setFilter(status);
                  setExpandedId(null);
                  setLoading(true);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${filter === status ? "bg-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <label
            htmlFor="department-filter"
            className="text-sm font-semibold text-slate-700"
          >
            Department
          </label>
          <select
            id="department-filter"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-primary"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department === "all" ? "All departments" : department}
              </option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}
      {visibleRequests.length === 0 && (
        <div className="rounded-[2rem] bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
          No requests match this view.
        </div>
      )}

      <div className="space-y-4">
        {visibleRequests.map((request) => {
          const isExpanded = expandedId === request._id;
          return (
            <article
              key={request._id}
              className="overflow-hidden rounded-[2rem] bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : request._id)}
                className="flex w-full flex-col gap-4 p-6 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  {request.student?.profilePicture ? (
                    <img
                      src={getMediaUrl(request.student.profilePicture)}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-white">
                      {getInitial(request.student?.name)}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {request.student?.name || "Unknown student"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {request.student?.studentId || "No ID"} ·{" "}
                      {request.student?.department || "No department"} ·{" "}
                      {request.student?.email}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Submitted {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={request.overallStatus} />
                  {isExpanded ? (
                    <HiChevronUp className="h-6 w-6 text-slate-500" />
                  ) : (
                    <HiChevronDown className="h-6 w-6 text-slate-500" />
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-5 sm:p-6">
                  <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Documents submitted
                      </h2>
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
                  </section>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {request.items.map((item) => (
                      <section
                        key={item._id}
                        className="rounded-3xl bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {item.department}
                          </h2>
                          <StatusBadge status={item.status} />
                        </div>
                        <label
                          className="mt-4 block text-sm font-medium text-slate-700"
                          htmlFor={`remarks-${item._id}`}
                        >
                          Remarks{" "}
                          <span className="font-normal text-slate-400">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          id={`remarks-${item._id}`}
                          value={remarks[item._id] ?? item.remarks ?? ""}
                          onChange={(event) =>
                            setRemarks((current) => ({
                              ...current,
                              [item._id]: event.target.value,
                            }))
                          }
                          rows="3"
                          placeholder="Add an approval or rejection note"
                          className="mt-2 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-primary"
                        />
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={savingItem === item._id}
                            onClick={() =>
                              updateItem(request._id, item._id, "approved")
                            }
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {savingItem === item._id ? "Saving..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={savingItem === item._id}
                            onClick={() =>
                              updateItem(request._id, item._id, "rejected")
                            }
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ManageRequests;
