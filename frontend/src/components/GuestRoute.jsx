import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { getRoleHome } from "../utils/roles.js";

const GuestRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
