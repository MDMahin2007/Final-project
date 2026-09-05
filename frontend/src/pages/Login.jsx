import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/authContext.js";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
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
      toast.success("Welcome back to ClearPath.");
      navigate(
        user.role === "admin" ? "/admin/dashboard" : "/student/dashboard",
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-6 sm:py-12">
      <div className="rounded-3xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30 sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-400">
            ClearPath access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Login
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sign in to continue to your clearance workspace.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email address
            </label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              autoComplete="email"
              placeholder="you@campus.edu"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-sky-400 hover:text-sky-300"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
