import { Link } from "react-router-dom";

const Member4Panel = () => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-2">Member 4 Dashboard</h2>
        <p className="text-muted">
          This module contains OAuth login, notifications, notification preferences,
          and admin role management.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/auth" className="btn btn-outline-primary">
            Authentication
          </Link>
          <Link to="/notifications" className="btn btn-outline-primary">
            Notifications
          </Link>
          <Link to="/preferences" className="btn btn-outline-primary">
            Preferences
          </Link>
          <Link to="/users" className="btn btn-outline-primary">
            User Roles (Admin)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Member4Panel;
