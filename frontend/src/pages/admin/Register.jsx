import { useContext, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/authContext.js";
import { HiOutlineKey, HiOutlineShieldCheck } from "react-icons/hi";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  adminSecretKey: "",
};

const AdminRegister = () => {
  const { user, registerAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isInternal = user?.role === "admin";

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user?.role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user?.role === "admin" && location.pathname === "/admin/register") {
    return <Navigate to="/admin/add-admin" replace />;
  }

  const updateField = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      const message = "Please fill all required fields.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!isInternal && !form.adminSecretKey.trim()) {
      const message = "Please enter the Admin Security Key.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.name.trim().length < 2) {
      const message = "Name must be at least 2 characters.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.password.length < 8) {
      const message = "Password must be at least 8 characters.";
      setError(message);
      toast.error(message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      if (!isInternal) {
        payload.adminSecretKey = form.adminSecretKey.trim();
      }

      await registerAdmin(payload);

      toast.success(
        isInternal
          ? "Administrator account created successfully."
          : "Admin account registered successfully! Welcome to ClearPath.",
      );
      navigate("/admin/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Admin registration failed. Please verify your details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-primary">
          <HiOutlineShieldCheck className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isInternal ? "Add Administrator" : "Admin Registration"}
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            ClearPath Portal
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        {isInternal
          ? "Create another administrator account for the ClearPath workspace."
          : "Register a verified administrator account with your institutional security key."}
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={updateField}
            required
            minLength={2}
            autoComplete="name"
            placeholder="Dr. Sarah Connor"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Official Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            required
            autoComplete="email"
            placeholder="admin@clearpath.edu"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
          />
        </div>

        {!isInternal && (
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="adminSecretKey"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
              >
                <HiOutlineKey className="h-4 w-4 text-primary" />
                Admin Security Key
              </label>
            </div>
            <input
              id="adminSecretKey"
              name="adminSecretKey"
              type="password"
              value={form.adminSecretKey}
              onChange={updateField}
              required
              autoComplete="off"
              placeholder="Enter institutional security key"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Required to prevent unauthorized administrator creation.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Password (min 8 characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={updateField}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? "Creating account..."
            : isInternal
              ? "Create Administrator Account"
              : "Register as Administrator"}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">
        {isInternal ? (
          <Link
            to="/admin/dashboard"
            className="font-semibold text-primary hover:underline"
          >
            ← Back to dashboard
          </Link>
        ) : (
          <div className="space-y-2">
            <p>
              Already registered as admin?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login here
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Student account?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-700 hover:underline"
              >
                Register as Student
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegister;
