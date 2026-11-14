import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import StaffLayout from "./layouts/StaffLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import Apply from "./pages/student/Apply.jsx";
import Certificate from "./pages/student/Certificate.jsx";
import Profile from "./pages/student/Profile.jsx";
import StudentRequests from "./pages/student/Requests.jsx";
import RequestDetails from "./pages/student/RequestDetails.jsx";
import StaffQueue from "./pages/staff/Queue.jsx";
import StaffReview from "./pages/staff/Review.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageRequests from "./pages/admin/ManageRequests.jsx";
import Offices from "./pages/admin/Offices.jsx";
import StaffManagement from "./pages/admin/Staff.jsx";
import Reports from "./pages/admin/Reports.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route element={<GuestRoute />}>
            <Route path="login" element={<Login />} />
            <Route
              path="admin/login"
              element={<Navigate to="/login" replace />}
            />
            <Route path="register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/apply" element={<Apply />} />
            <Route path="student/requests" element={<StudentRequests />} />
            <Route path="student/requests/:id" element={<RequestDetails />} />
            <Route path="student/certificate" element={<Certificate />} />
            <Route path="student/profile" element={<Profile />} />
            <Route
              path="student/new-request"
              element={<Navigate to="/student/apply" replace />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="officeStaff" />}>
          <Route element={<StaffLayout />}>
            <Route path="staff/requests" element={<StaffQueue />} />
            <Route path="staff/requests/:id" element={<StaffReview />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role={["superAdmin", "admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path="admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/requests" element={<ManageRequests />} />
            <Route path="admin/offices" element={<Offices />} />
            <Route path="admin/staff" element={<StaffManagement />} />
            <Route path="admin/reports" element={<Reports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
