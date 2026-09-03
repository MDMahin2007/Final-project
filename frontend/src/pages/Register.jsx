import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { HiAcademicCap, HiShieldCheck } from "react-icons/hi";
import { AuthContext } from "../context/authContext.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyForm = {
  name: "",
  studentId: "",
  department: "",
  email: "",
  password: "",
  confirmPassword: "",
  adminSecretKey: "",
};

const Register = () => {
  const { register, registerAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(
    location.pathname === "/admin/register" ? "admin" : "student",
  );
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = role === "admin";

  const updateField = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const switchRole = (nextRole) => {
    setRole(nextRole);
    setForm({ ...emptyForm });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const requiredFields = isAdmin
      ? [
          form.name,
          form.email,
          form.password,
          form.confirmPassword,
          form.adminSecretKey,
        ]
      : [
          form.name,
          form.studentId,
          form.department,
          form.email,
          form.password,
          form.confirmPassword,
        ];
    if (requiredFields.some((value) => !value.trim()))
      return showError("Please fill all required fields.");
    if (!emailPattern.test(form.email.trim()))
      return showError("Please enter a valid email address.");
    if (form.password.length < 8)
      return showError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return showError("Passwords do not match.");

    try {
      setLoading(true);
      const user = isAdmin
        ? await registerAdmin({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            adminSecretKey: form.adminSecretKey.trim(),
          })
        : await register({
            name: form.name.trim(),
            studentId: form.studentId.trim(),
            department: form.department.trim(),
            email: form.email.trim(),
            password: form.password,
          });
      toast.success("Your ClearPath account has been created.");
      navigate(
        user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      );
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const showError = (message) => {
    setError(message);
    toast.error(message);
  };
  const fields = isAdmin
    ? [
        ["name", "Full Name", "text", "Dr. Sarah Connor"],
        ["email", "Admin Email Address", "email", "admin@campus.edu"],
        [
          "adminSecretKey",
          "Admin Security Key",
          "password",
          "Enter institutional security key",
        ],
      ]
    : [
        ["name", "Full Name", "text", "Alex Morgan"],
        ["studentId", "Student ID", "text", "CSE-2026-001"],
        ["department", "Department", "text", "Computer Science"],
        ["email", "Student Email Address", "email", "student@campus.edu"],
      ];

  return (
    <div className="mx-auto max-w-lg py-6 sm:py-12">
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30 sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-400">
            Join ClearPath
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Choose your workspace and start moving clearance forward.
          </p>
        </div>
        <div
          className="grid grid-cols-2 rounded-2xl border border-slate-700 bg-slate-950 p-1"
          role="tablist"
          aria-label="Account type"
        >
          {[
            { value: "student", label: "Student", Icon: HiAcademicCap },
            { value: "admin", label: "Admin", Icon: HiShieldCheck },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={role === value}
              onClick={() => switchRole(value)}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${role === value ? "bg-sky-400 text-slate-950 shadow-lg shadow-sky-400/10" : "text-slate-400 hover:text-white"}`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {fields.map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="block text-sm font-medium text-slate-200"
              >
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                required
                autoComplete={
                  type === "password"
                    ? "new-password"
                    : name === "email"
                      ? "email"
                      : name === "name"
                        ? "name"
                        : "off"
                }
                placeholder={placeholder}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
            </div>
          ))}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
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
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-200"
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
              placeholder="Repeat your password"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-sky-400 hover:text-sky-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
