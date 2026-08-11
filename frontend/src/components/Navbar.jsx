import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import {
  HiHome,
  HiOutlineDocumentText,
  HiOutlineLogin,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlinePresentationChartBar,
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
      to: "/student/new-request",
      label: "New Request",
      icon: HiOutlineDocumentText,
    },
    {
      to: "/student/requests",
      label: "My Requests",
      icon: HiOutlineClipboardList,
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
  ];

  const links = user
    ? user.role === "admin"
      ? adminLinks
      : studentLinks
    : publicLinks;

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 md:flex-row">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold text-slate-900"
        >
          <HiHome className="h-6 w-6" />
          ClearPath
        </Link>
        <button
          className="md:hidden rounded-md border border-slate-200 px-3 py-2 text-slate-700"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
        <div
          className={`flex flex-col gap-2 md:flex-row md:items-center ${open ? "block" : "hidden"} md:block`}
        >
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
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
