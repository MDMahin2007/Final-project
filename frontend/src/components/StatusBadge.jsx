const StatusBadge = ({ status }) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variants = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`${base} ${variants[status] || "bg-slate-100 text-slate-800"}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
