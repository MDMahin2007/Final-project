import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext.js";
import {
  HiOutlinePresentationChartBar,
  HiOutlineClipboardList,
  HiOutlineUserCircle,
  HiOutlineLogout,
} from "react-icons/hi";

const Sidebar = ({ role }) => {
  const { logout } = useContext(AuthContext);
  const items =
    role === "admin"
      ? [
          {
            to: "/admin/dashboard",
            label: "Dashboard",
            icon: HiOutlinePresentationChartBar,
          },
          {
            to: "/admin/requests",
            label: "Manage Requests",
            icon: HiOutlineClipboardList,
          },
        ]
      : [
          {
            to: "/student/dashboard",
            label: "Dashboard",
            icon: HiOutlinePresentationChartBar,
          },
        ];

  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:block">
      <div className="mb-8 flex items-center gap-3 text-2xl font-semibold text-slate-900">
        <HiOutlineUserCircle className="h-7 w-7 text-primary" />
        ClearPath
      </div>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-slate-700 transition hover:bg-slate-100"
            >
              {Icon && <Icon className="h-5 w-5" />}
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-8 border-t border-slate-200 pt-5">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-white transition hover:bg-sky-600"
        >
          <HiOutlineLogout className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
