import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !name ||
      !studentId ||
      !department ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await register({ name, studentId, department, email, password });
      setMessage("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        Create student account
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Register as a student to submit clearance requests.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Student ID
          </label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Department
          </label>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
          />
        </div>
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-primary">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
