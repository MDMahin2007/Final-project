const DashboardCard = ({ title, value, children }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-slate-500 text-sm mb-2">{title}</div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      {children}
    </div>
  );
};

export default DashboardCard;
