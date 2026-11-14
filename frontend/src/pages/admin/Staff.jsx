import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const Staff = () => {
  const [offices, setOffices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", officeId: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    const [officeResponse, staffResponse] = await Promise.all([api.get("/admin/offices"), api.get("/admin/staff")]);
    setOffices(officeResponse.data.data || []);
    setStaff(staffResponse.data.data || []);
    setForm((current) => ({ ...current, officeId: current.officeId || officeResponse.data.data.find((office) => office.isActive)?._id || "" }));
  };

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/admin/offices"), api.get("/admin/staff")])
      .then(([officeResponse, staffResponse]) => {
        if (!active) return;
        setOffices(officeResponse.data.data || []);
        setStaff(staffResponse.data.data || []);
        setForm((current) => ({ ...current, officeId: officeResponse.data.data.find((office) => office.isActive)?._id || "" }));
      })
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load office staff."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const createStaff = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post("/admin/staff", form);
      setForm((current) => ({ ...current, name: "", email: "", password: "" }));
      await loadData();
      toast.success("Office staff account created.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to create staff account.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  const activeOffices = offices.filter((office) => office.isActive);
  return (
    <div className="space-y-7">
      <header className="border-b border-slate-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Super admin setup</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Office staff</h1><p className="mt-2 text-sm text-slate-600">Create staff accounts and assign exactly one office to each account.</p></header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!activeOffices.length ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Create an active office before adding staff.</p> : <form onSubmit={createStaff} className="grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-2">
        <div><label htmlFor="staff-name" className="block text-xs font-semibold text-slate-600">Full name</label><input id="staff-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required minLength={2} maxLength={100} autoComplete="name" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
        <div><label htmlFor="staff-email" className="block text-xs font-semibold text-slate-600">Email</label><input id="staff-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
        <div><label htmlFor="staff-password" className="block text-xs font-semibold text-slate-600">Temporary password</label><input id="staff-password" type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={8} autoComplete="new-password" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
        <div><label htmlFor="staff-office" className="block text-xs font-semibold text-slate-600">Assigned office</label><select id="staff-office" value={form.officeId} onChange={(event) => setForm((current) => ({ ...current, officeId: event.target.value }))} required className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">{activeOffices.map((office) => <option key={office._id} value={office._id}>{office.name}</option>)}</select></div>
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2">{saving ? "Creating..." : "Create office account"}</button>
      </form>}
      <section><h2 className="text-lg font-semibold text-slate-900">Current staff</h2>{staff.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">{staff.map((member) => <article key={member._id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><h3 className="font-semibold text-slate-800">{member.name}</h3><p className="mt-1 text-sm text-slate-500">{member.email}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{member.officeId?.name || "Office not assigned"}</span></article>)}</div> : <p className="mt-3 border-y border-slate-200 py-6 text-sm text-slate-500">No office staff accounts yet.</p>}</section>
    </div>
  );
};

export default Staff;