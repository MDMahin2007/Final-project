import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <Sidebar role="student" />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;
