import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
