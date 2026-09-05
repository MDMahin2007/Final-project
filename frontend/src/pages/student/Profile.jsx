import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiArrowLeft, HiCamera, HiOutlineUserCircle } from "react-icons/hi";
import { AuthContext } from "../../context/authContext.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import api from "../../services/api.js";
import { getInitial, getMediaUrl } from "../../services/media.js";

const editableFields = [
  ["phone", "Phone number", "tel", "e.g. +880 1XXXXXXXXX"],
  ["program", "Program", "text", "e.g. BSc in Computer Science"],
  ["session", "Session", "text", "e.g. 2022-2026"],
];

const Profile = () => {
  const { user, loading, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    program: user?.program || "",
    session: user?.session || "",
  });
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const avatarInput = useRef(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await api.get("/auth/me");
        const profile = response.data.data.user;
        updateUser(profile);
        setForm({
          phone: profile.phone || "",
          program: profile.program || "",
          session: profile.session || "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your profile details.",
        );
      } finally {
        setProfileLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [updateUser]);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const setFormFromUser = (profile) => {
    setForm({
      phone: profile?.phone || "",
      program: profile?.program || "",
      session: profile?.session || "",
    });
  };

  const startEditing = () => {
    setFormFromUser(user);
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setFormFromUser(user);
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setSaving(true);
      const response = await api.patch("/auth/me", {
        phone: form.phone.trim(),
        program: form.program.trim(),
        session: form.session.trim(),
      });
      const savedUser = response.data.data.user;
      setFormFromUser(savedUser);
      updateUser(savedUser);
      setEditing(false);
      toast.success(response.data.message);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to update your profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      const message = "Choose a JPG or PNG image up to 2MB.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setAvatarSaving(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post("/auth/me/avatar", formData);
      updateUser(response.data.data.user);
      toast.success(response.data.message);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to update your profile picture.";
      setError(message);
      toast.error(message);
    } finally {
      setAvatarSaving(false);
      event.target.value = "";
    }
  };

  if (loading || profileLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm sm:p-10">
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-sky-600"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={getMediaUrl(user.profilePicture)}
                alt={`${user.name} profile`}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-50"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-white ring-4 ring-blue-50">
                {getInitial(user?.name)}
              </div>
            )}
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              disabled={avatarSaving}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 rounded-full bg-slate-900 p-2 text-white shadow-sm hover:bg-slate-700 disabled:opacity-60"
            >
              <HiCamera className="h-4 w-4" />
            </button>
            <input
              ref={avatarInput}
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              onChange={uploadAvatar}
              className="sr-only"
            />
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 text-primary">
            <HiOutlineUserCircle className="h-10 w-10" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Student profile
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Your account details
            </h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-slate-600">
          Keep your student information current. Identity and account fields are
          protected and can only be changed by the institution.
        </p>
        {error && (
          <div className="mt-6 rounded-3xl bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Full name
            </dt>
            <dd className="mt-2 break-words font-semibold text-slate-900">
              {user?.name || "Not provided"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student ID
            </dt>
            <dd className="mt-2 break-words font-semibold text-slate-900">
              {user?.studentId || "Not provided"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Department
            </dt>
            <dd className="mt-2 break-words font-semibold text-slate-900">
              {user?.department || "Not provided"}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email address
            </dt>
            <dd className="mt-2 break-words font-semibold text-slate-900">
              {user?.email || "Not provided"}
            </dd>
          </div>
        </dl>
        <form
          onSubmit={handleSubmit}
          className="mt-8 border-t border-slate-100 pt-8"
        >
          <h2 className="text-xl font-semibold text-slate-900">
            Additional details
          </h2>
          {!editing && (
            <button
              type="button"
              onClick={startEditing}
              className="mt-4 rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
            >
              Edit details
            </button>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {editableFields.map(([name, label, type, placeholder]) => (
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
                  disabled={!editing || saving}
                  maxLength={name === "program" ? 120 : 30}
                  placeholder={placeholder}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                />
              </div>
            ))}
          </div>
          {editing && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving changes..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
};

export default Profile;
