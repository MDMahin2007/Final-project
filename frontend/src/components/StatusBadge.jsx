const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variants = {
    PENDING: "bg-amber-100 text-amber-800",
    IN_PROGRESS: "bg-sky-100 text-sky-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    CLEARED: "bg-emerald-100 text-emerald-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`${base} ${variants[String(status).toUpperCase()] || "bg-slate-100 text-slate-800"}`}
    >
      {status ? String(status).replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unknown"}
    </span>
  );
};

export default StatusBadge;
