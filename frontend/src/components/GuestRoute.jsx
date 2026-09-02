import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const GuestRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default GuestRoute;
