import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminDashboardPage = () => {
  const { isAdmin, isStaff, user } = useAuth();

  return (
    <div className="d-grid gap-4">
      <div className="border-bottom pb-3">
        <h2 className="mb-1">Operations console</h2>
        <p className="text-muted mb-0">
          {isAdmin
            ? "Signed in as administrator — manage accounts, review support submissions, and broadcast notifications."
            : "Signed in as technician — monitor notifications and campus alerts. User management and the support queue are restricted to administrators."}
        </p>
      </div>

      <div className="row g-3">
        {isAdmin && (
          <>
            <div className="col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Directory &amp; access</h5>
                  <p className="card-text text-muted small">
                    View everyone on the hub, enable or disable access, and assign roles (user, technician, admin).
                  </p>
                  <Link to="/users" className="btn btn-primary">
                    Open user management
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Support &amp; incidents</h5>
                  <p className="card-text text-muted small">
                    Review problems reported by students and staff. Update status and notes — users are notified
                    automatically.
                  </p>
                  <Link to="/admin/support" className="btn btn-primary">
                    Open support queue
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Notifications</h5>
              <p className="card-text text-muted small">
                Read operational messages and, if you are an admin, send targeted announcements to a user by ID.
              </p>
              <Link to="/notifications" className="btn btn-outline-primary">
                Open notifications
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Your account</h5>
              <p className="card-text text-muted small">
                Update your name or sign-in details. This is your operator profile, separate from student self-service
                pages.
              </p>
              <Link to="/settings" className="btn btn-outline-secondary">
                Account settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isStaff && (
        <div className="alert alert-light border mb-0 small">
          <strong>Signed in:</strong> {user?.fullName} · {user?.email} · role <code>{user?.role}</code>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
