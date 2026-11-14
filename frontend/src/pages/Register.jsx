import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext.js";

const emptyForm = {
  name: "",
  studentId: "",
  department: "",
  semester: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (![form.name, form.studentId, form.department, form.email, form.password].every((value) => value.trim())) {
      setError("Complete each required field to continue.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name.trim(),
        studentId: form.studentId.trim(),
        department: form.department.trim(),
        semester: form.semester.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Student account created.");
      navigate("/student/dashboard");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Registration failed.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ["name", "Full name", "text", "Alex Morgan", true],
    ["studentId", "Student ID", "text", "221-15-001", true],
    ["department", "Department", "text", "Computer Science", true],
    ["semester", "Semester", "text", "8th semester", false],
    ["email", "Campus email", "email", "student@campus.edu", true],
  ];

  return (
    <div className="mx-auto max-w-lg py-6 sm:py-12">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Student portal</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use your student ID or email to sign in and follow each office decision.</p>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type, placeholder, required]) => (
            <div key={name} className={name === "email" ? "sm:col-span-2" : ""}>
              <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={updateField}
                required={required}
                autoComplete={name === "email" ? "email" : name === "name" ? "name" : "off"}
                placeholder={placeholder}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              />
            </div>
          ))}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={updateField} required minLength={8} autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required minLength={8} autoComplete="new-password" className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white" />
          </div>
          {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</div>}
          <button type="submit" disabled={loading} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2">
            {loading ? "Creating account..." : "Create student account"}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
      </section>
    </div>
  );
};

export default Register;