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

  const showError = (message) => {
    setError(message);
    toast.error(message);
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
      <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Join ClearPath
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose your workspace and start moving clearance forward.
          </p>
        </div>
        <div
          className="grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1"
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
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${role === value ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
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
                className="block text-sm font-medium text-slate-700"
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
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
              />
            </div>
          ))}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
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
              placeholder="Repeat your password"
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary focus:bg-white"
            />
          </div>
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
