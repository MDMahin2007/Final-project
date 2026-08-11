import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import NewRequest from "./pages/student/NewRequest.jsx";
import MyRequests from "./pages/student/MyRequests.jsx";
import RequestDetails from "./pages/student/RequestDetails.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import ManageRequests from "./pages/admin/ManageRequests.jsx";
import ReviewRequest from "./pages/admin/ReviewRequest.jsx";
import AdminRequestDetails from "./pages/admin/AdminRequestDetails.jsx";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<StudentLayout />}>
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/new-request" element={<NewRequest />} />
            <Route path="student/requests" element={<MyRequests />} />
            <Route path="student/requests/:id" element={<RequestDetails />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/requests" element={<ManageRequests />} />
            <Route
              path="admin/requests/:id"
              element={<AdminRequestDetails />}
            />
            <Route
              path="admin/requests/:id/review"
              element={<ReviewRequest />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
