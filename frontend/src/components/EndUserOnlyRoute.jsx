import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Blocks staff (admin / technician) from student-only flows (support form, notification prefs).
 */
const EndUserOnlyRoute = ({ children, redirectTo = "/admin" }) => {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return <div className="alert alert-secondary">Checking your session...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (isStaff) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default EndUserOnlyRoute;
