import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext.js";

const initialForm = { name: "", studentId: "", department: "", email: "", password: "", confirmPassword: "" };

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      const message = "Please fill all fields.";
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
      const registrationData = {
        name: form.name,
        studentId: form.studentId,
        department: form.department,
        email: form.email,
        password: form.password,
      };
      const user = await register(registrationData);
      toast.success("Your ClearPath account has been created.");
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ["name", "Full Name", "text"],
    ["studentId", "Student ID", "text"],
    ["department", "Department", "text"],
    ["email", "Email", "email"],
    ["password", "Password", "password"],
    ["confirmPassword", "Confirm Password", "password"],
  ];

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create student account</h1>
      <p className="mt-2 text-sm text-slate-600">Register as a student to submit clearance requests.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
            <input id={name} name={name} type={type} value={form[name]} onChange={updateField} required minLength={type === "password" ? 8 : undefined} autoComplete={name === "email" ? "email" : type === "password" ? "new-password" : undefined} className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
          </div>
        ))}
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link></p>
        <p className="text-xs text-slate-500">Administrator account? <Link to="/admin/register" className="font-semibold text-slate-700 hover:underline">Register as Admin</Link></p>
      </div>
    </div>
  );
};

export default Register;
