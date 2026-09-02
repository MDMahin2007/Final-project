import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext.js";

const Login = () => {
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname === "/admin/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      const message = "Email and password are required.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      const user = await login(email.trim(), password);
      if (isAdminLogin && user.role !== "admin") {
        logout();
        const message = "This portal is for administrators only.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Welcome back to ClearPath.");
      navigate(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{isAdminLogin ? "Administrator login" : "Login to ClearPath"}</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your email and password to continue.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required autoComplete="email" className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
          <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" required autoComplete="current-password" className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary" />
        </div>
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      {isAdminLogin ? (
        <p className="mt-5 text-sm text-slate-600">Student? <Link to="/login" className="font-semibold text-primary">Use the student login</Link></p>
      ) : (
        <p className="mt-5 text-sm text-slate-600">Don&apos;t have an account? <Link to="/register" className="font-semibold text-primary">Register</Link></p>
      )}
    </div>
  );
};

export default Login;
