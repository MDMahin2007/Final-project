import { Navigate } from "react-router-dom";

// The new workflow has one request, created directly from the dashboard.
const NewRequest = () => <Navigate to="/student/dashboard" replace />;

export default NewRequest;
