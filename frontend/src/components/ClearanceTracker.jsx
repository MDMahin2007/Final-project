import { HiCheck, HiClock, HiX } from "react-icons/hi";
import StatusBadge from "./StatusBadge.jsx";

const icons = {
  pending: HiClock,
  approved: HiCheck,
  rejected: HiX,
};

const styles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const ClearanceTracker = ({ items = [] }) => (
  <ol className="grid gap-4 md:grid-cols-2">
    {items.map((item, index) => {
      const Icon = icons[item.status] || HiClock;
      return (
        <li key={item._id || item.department} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${styles[item.status] || styles.pending}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{item.department}</h2>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.remarks && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"><span className="font-semibold text-slate-700">Admin remark: </span>{item.remarks}</p>}
              {item.updatedAt && <p className="mt-3 text-xs text-slate-400">Last updated {new Date(item.updatedAt).toLocaleString()}</p>}
            </div>
          </div>
        </li>
      );
    })}
  </ol>
);

export default ClearanceTracker;
