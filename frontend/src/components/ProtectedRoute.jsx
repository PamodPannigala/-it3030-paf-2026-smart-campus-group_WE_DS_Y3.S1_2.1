import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="alert alert-secondary">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (staffOnly && user.role !== "ADMIN" && user.role !== "TECHNICIAN") {
    return <div className="alert alert-warning">Staff access required.</div>;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <div className="alert alert-warning">Admin access required.</div>;
  }

  return children;
};

export default ProtectedRoute;
