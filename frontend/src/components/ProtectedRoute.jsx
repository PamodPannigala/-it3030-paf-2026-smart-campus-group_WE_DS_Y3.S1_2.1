import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="alert alert-secondary">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <div className="alert alert-warning">Admin access required.</div>;
  }

  return children;
};

export default ProtectedRoute;
