import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-2">Staff dashboard</h2>
        <p className="text-muted mb-3">
          Technicians and admins land here after sign-in. Admins can manage users, the support queue, and
          notifications.
        </p>
        <div className="d-flex flex-wrap gap-2">
          {isAdmin && (
            <Link to="/users" className="btn btn-outline-primary">
              Manage users
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/support" className="btn btn-outline-primary">
              Support queue
            </Link>
          )}
          <Link to="/notifications" className="btn btn-outline-primary">
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

