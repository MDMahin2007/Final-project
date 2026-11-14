import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const StaffLayout = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <Navbar />
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      <Sidebar role="officeStaff" />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  </div>
);

export default StaffLayout;