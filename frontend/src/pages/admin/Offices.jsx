import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

const Offices = () => {
  const [offices, setOffices] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", workflowOrder: "1" });
  const [orderEdits, setOrderEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadOffices = async () => {
    const response = await api.get("/admin/offices");
    setOffices(response.data.data || []);
    setOrderEdits(Object.fromEntries(response.data.data.map((office) => [office._id, String(office.workflowOrder)])));
  };

  useEffect(() => {
    let active = true;
    api.get("/admin/offices")
      .then((response) => {
        if (!active) return;
        setOffices(response.data.data || []);
        setOrderEdits(Object.fromEntries(response.data.data.map((office) => [office._id, String(office.workflowOrder)])));
      })
      .catch((requestError) => active && setError(requestError.response?.data?.message || "Unable to load offices."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const createOffice = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.post("/admin/offices", { ...form, workflowOrder: Number(form.workflowOrder) });
      setForm({ name: "", code: "", workflowOrder: String(offices.length + 1) });
      await loadOffices();
      toast.success("Office added to the workflow.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to create office.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const updateOffice = async (office, updates) => {
    try {
      setSaving(true);
      await api.patch(`/admin/offices/${office._id}`, updates);
      await loadOffices();
      toast.success("Office settings updated.");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to update office.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-7">
      <header className="border-b border-slate-200 pb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Super admin setup</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Approval offices</h1><p className="mt-2 text-sm text-slate-600">Active offices are added to each new request in workflow order.</p></header>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <form onSubmit={createOffice} className="grid gap-3 border-b border-slate-200 pb-6 sm:grid-cols-[1fr_9rem_8rem_auto]">
        <div><label htmlFor="office-name" className="block text-xs font-semibold text-slate-600">Office name</label><input id="office-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength={80} required placeholder="Library" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
        <div><label htmlFor="office-code" className="block text-xs font-semibold text-slate-600">Code</label><input id="office-code" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} maxLength={12} required placeholder="LIB" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase" /></div>
        <div><label htmlFor="office-order" className="block text-xs font-semibold text-slate-600">Workflow order</label><input id="office-order" type="number" min="1" value={form.workflowOrder} onChange={(event) => setForm((current) => ({ ...current, workflowOrder: event.target.value }))} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></div>
        <button type="submit" disabled={saving} className="self-end rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Add office</button>
      </form>
      {!offices.length ? <p className="py-10 text-center text-sm text-slate-500">No offices configured yet.</p> : <div className="divide-y divide-slate-200 border-y border-slate-200">{offices.map((office) => <article key={office._id} className="grid gap-4 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"><div><h2 className="font-semibold text-slate-900">{office.name}</h2><p className="mt-1 text-xs text-slate-500">{office.code}</p></div><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={office.isActive} disabled={saving} onChange={(event) => updateOffice(office, { isActive: event.target.checked })} className="h-4 w-4 accent-primary" />Active</label><label className="flex items-center gap-2 text-xs text-slate-500">Order<input type="number" min="1" value={orderEdits[office._id] || "1"} onChange={(event) => setOrderEdits((current) => ({ ...current, [office._id]: event.target.value }))} className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-800" /></label><button type="button" disabled={saving || Number(orderEdits[office._id]) === office.workflowOrder} onClick={() => updateOffice(office, { workflowOrder: Number(orderEdits[office._id]) })} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40">Save order</button></article>)}</div>}
    </div>
  );
};

export default Offices;