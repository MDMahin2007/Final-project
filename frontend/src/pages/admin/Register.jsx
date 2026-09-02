import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/authContext.js";

const initialForm = { name: "", email: "", password: "", confirmPassword: "" };

const AdminRegister = () => {
  const { registerAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      const message = "Please fill all fields.";
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
      await registerAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Administrator account created.");
      navigate("/admin/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Admin registration failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ["name", "Full Name", "text"],
    ["email", "Email", "email"],
    ["password", "Password", "password"],
    ["confirmPassword", "Confirm Password", "password"],
  ];

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        Register administrator
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Create an administrator account for the ClearPath workspace.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {fields.map(([name, label, type]) => (
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
              minLength={type === "password" ? 8 : undefined}
              autoComplete={
                name === "email"
                  ? "email"
                  : type === "password"
                    ? "new-password"
                    : "name"
              }
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-primary"
            />
          </div>
        ))}
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Register administrator"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">
        <Link to="/admin/dashboard" className="font-semibold text-primary">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
};

export default AdminRegister;
