import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

const HomePage = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    api.get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => setUnreadCount(0))
      .finally(() => setLoadingCount(false));
  }, []);

  return (
    <div className="d-grid gap-4">
      <section className="bg-white border rounded-4 p-4 shadow-sm">
        <h2 className="mb-2">Good Day, {user?.fullName}</h2>
        <p className="text-muted mb-0">
          Welcome to your campus home screen. You can manage your profile, track updates,
          and keep up with notifications from one place.
        </p>
      </section>

      <section className="row g-3">
        <div className="col-md-4">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h6 className="text-muted mb-2">Unread Notifications</h6>
            <h3 className="mb-0">{loadingCount ? "..." : unreadCount}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h6 className="text-muted mb-2">Account Type</h6>
            <h3 className="mb-0">{user?.role}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
            <h6 className="text-muted mb-2">Login Method</h6>
            <h3 className="mb-0">{user?.authProvider}</h3>
          </div>
        </div>
      </section>

      <section className="bg-white border rounded-4 p-4 shadow-sm">
        <h5 className="mb-3">Quick Actions</h5>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/notifications" className="btn btn-primary">
            Open Notifications
          </Link>
          <Link to="/preferences" className="btn btn-outline-primary">
            Notification Preferences
          </Link>
          <Link to="/settings" className="btn btn-outline-secondary">
            Profile Settings
          </Link>
          <Link to="/support" className="btn btn-outline-secondary">
            Help / Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

