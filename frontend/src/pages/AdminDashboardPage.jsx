import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-2">Admin Dashboard</h2>
        <p className="text-muted mb-3">Manage users and send notifications.</p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/users" className="btn btn-outline-primary">
            Manage Users
          </Link>
          <Link to="/notifications" className="btn btn-outline-primary">
            Send / View Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

