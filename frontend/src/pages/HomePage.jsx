import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";

const services = [
  {
    title: "Booking",
    description: "Reserve campus rooms and equipment seamlessly.",
    icon: "📅",
    path: "#booking",
  },
  {
    title: "Facilities",
    description: "View availability and rules for sports and study areas.",
    icon: "🏢",
    path: "#facility",
  },
  {
    title: "Tickets",
    description: "Manage your upcoming event passes and entry tickets.",
    icon: "🎟️",
    path: "#tickets",
  },
  {
    title: "Notifications",
    description: "Stay up-to-date with messages and alerts.",
    icon: "🔔",
    path: "/notifications",
  },
  {
    title: "Report an Issue",
    description: "Direct line to operations team for support.",
    icon: "💬",
    path: "/support",
  },
  {
    title: "Settings",
    description: "Update your personal account configuration.",
    icon: "⚙️",
    path: "/settings",
  },
];

const HomePage = () => {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isStaff) {
      navigate("/admin", { replace: true });
    }
  }, [isStaff, navigate]);

  useEffect(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  if (isStaff) {
    return null;
  }

  // Get initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="hq-dashboard-layout">
      {/* Profile Overview Section */}
      <section className="hq-profile-header mb-4 mt-3">
        <div className="hq-profile-card">
          <div className="hq-profile-bg"></div>
          <div className="hq-profile-content">
            <div className="hq-avatar-wrapper">
              <div className="hq-avatar">{initials}</div>
              <div className="hq-status-indicator online"></div>
            </div>
            <div className="hq-user-details">
              <h2>{user?.fullName || "Scholar"}</h2>
              <div className="hq-badge-row">
                <span className="badge-role">{user?.role || "STUDENT"}</span>
                <span className="badge-id">ID: #{user?.id || "---"}</span>
              </div>
              <p className="hq-email-txt">{user?.email}</p>
            </div>
          </div>
          
          <div className="hq-profile-stats">
            <div className="hq-stat-item" onClick={() => navigate('/notifications')}>
              <span className="hq-stat-value text-primary">{unreadCount}</span>
              <span className="hq-stat-label">Unread<br/>Alerts</span>
            </div>
            <div className="hq-stat-item">
              <span className="hq-stat-value">Active</span>
              <span className="hq-stat-label">Session<br/>Status</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <div className="row gy-4 hq-main-grid">
        <div className="col-lg-8">
          <div className="hq-module-header">
            <h3>Campus Hub Services</h3>
            <p>Access your favorite tools, manage your bookings, and stay aligned.</p>
          </div>
          <div className="row gy-3">
            {services.map((svc) => (
              <div className="col-md-6 col-sm-6" key={svc.title}>
                <Link to={svc.path} className="hq-service-card">
                  <div className="hq-service-icon">{svc.icon}</div>
                  <div className="hq-service-info">
                    <h4>{svc.title}</h4>
                    <p>{svc.description}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="hq-side-panel">
            <h4>Quick Updates</h4>
            <div className="hq-update-item">
              <div className="icon">🚀</div>
              <div>
                <h5>System Upgraded</h5>
                <p>Welcome to the new streamlined dashboard design.</p>
              </div>
            </div>
            <div className="hq-update-item empty-state">
              <p>You have {unreadCount} notices demanding attention. <Link to="/notifications">Check inbox.</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
