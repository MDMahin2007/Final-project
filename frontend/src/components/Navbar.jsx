import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import {
  HiHome,
  HiOutlineLogin,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlinePresentationChartBar,
  HiOutlineUserCircle,
  HiOutlineChartBar,
  HiOutlineDocumentAdd,
} from "react-icons/hi";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const publicLinks = [
    { to: "/", label: "Home", icon: HiHome },
    {
      to: "/#features",
      label: "Features",
      icon: HiOutlinePresentationChartBar,
    },
    { to: "/login", label: "Login", icon: HiOutlineLogin },
    { to: "/register", label: "Register", icon: HiOutlineUser },
  ];

  const studentLinks = [
    {
      to: "/student/dashboard",
      label: "Dashboard",
      icon: HiOutlinePresentationChartBar,
    },
    {
      to: "/student/apply",
      label: "Apply for Clearance",
      icon: HiOutlineDocumentAdd,
    },
    {
      to: "/student/certificate",
      label: "Certificate",
      icon: HiOutlineClipboardList,
    },
    {
      to: "/student/profile",
      label: "Profile",
      icon: HiOutlineUserCircle,
    },
  ];

  const adminLinks = [
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
    {
      to: "/admin/reports",
      label: "Reports",
      icon: HiOutlineChartBar,
    },
  ];

  const links = user
    ? user.role === "admin"
      ? adminLinks
      : studentLinks
    : publicLinks;

  return (
    <nav className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white"
        >
          <HiHome className="h-6 w-6" />
          ClearPath
        </Link>
        <button
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500 md:hidden"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
        <div
          className={`${open ? "flex w-full" : "hidden"} flex-col gap-2 md:flex md:w-auto md:flex-row md:items-center`}
        >
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`
                }
                onClick={() => setOpen(false)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </NavLink>
            );
          })}
          {user && (
            <button
              onClick={logout}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-sky-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
