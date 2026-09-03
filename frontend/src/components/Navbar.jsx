import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import {
  HiHome,
  HiOutlineLogin,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlinePresentationChartBar,
  HiOutlineUserAdd,
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
    { to: "/admin/login", label: "Admin Login", icon: HiOutlineLogin },
    { to: "/register", label: "Register", icon: HiOutlineUser },
    { to: "/admin/register", label: "Admin Register", icon: HiOutlineUserAdd },
  ];

  const studentLinks = [
    {
      to: "/student/dashboard",
      label: "Dashboard",
      icon: HiOutlinePresentationChartBar,
    },
    {
      to: "/student/certificate",
      label: "Certificate",
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
    {
      to: "/admin/add-admin",
      label: "Register Admin",
      icon: HiOutlineUserAdd,
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
          className={`${open ? "flex" : "hidden"} flex-col gap-2 md:flex md:flex-row md:items-center`}
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
