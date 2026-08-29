const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variants = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    completed: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`${base} ${variants[status] || "bg-slate-100 text-slate-800"}`}
    >
      {status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : "Unknown"}
    </span>
  );
};

export default StatusBadge;
