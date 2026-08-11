import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const reasons = [
  "Course Completion",
  "Internship",
  "Certificate Collection",
  "Library Clearance",
  "Other",
];

const NewRequest = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [semester, setSemester] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState(reasons[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!semester || !phone || !reason) {
      setError("Please complete all fields.");
      return;
    }
    if (!/^[0-9+\- ]{7,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/clearance", {
        semester,
        phone,
        reason,
      });
      navigate(`/student/requests/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
      <h1 className="text-2xl font-semibold text-slate-900">
        New Clearance Request
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Submit a new request for clearance. Your profile details are used
        automatically.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">
            Student Name
          </label>
          <input
            value={user?.name || ""}
            disabled
            className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">
              Student ID
            </label>
            <input
              value={user?.studentId || ""}
              disabled
              className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">
              Department
            </label>
            <input
              value={user?.department || ""}
              disabled
              className="rounded-3xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">
              Semester
            </label>
            <input
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
              placeholder="e.g. Fall 2026"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
              placeholder="e.g. +880 1234 567890"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">
            Reason for Clearance
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          >
            {reasons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          {loading ? <LoadingSpinner /> : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default NewRequest;
