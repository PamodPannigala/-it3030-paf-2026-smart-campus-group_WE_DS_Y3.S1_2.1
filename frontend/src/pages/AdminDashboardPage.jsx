import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminDashboardPage = () => {
  const { isAdmin, isStaff, user } = useAuth();
  const [stats, setStats] = useState({
    unread: 0,
    users: null,
    supportOpen: null,
  });

  useEffect(() => {
    let cancelled = false;
    
    // Fetch notifications config unconditionally
    (async () => {
      try {
        const countRes = await api.get("/notifications/unread-count");
        if (!cancelled) setStats((s) => ({ ...s, unread: countRes.data.unreadCount ?? 0 }));
      } catch { /* ... */ }
    })();

    // Fetch admin-only resources independently
    if (isAdmin) {
      (async () => {
        try {
          const usersRes = await api.get("/users");
          if (!cancelled) setStats((s) => ({ ...s, users: usersRes.data.length }));
        } catch { /* ... */ }
      })();

      (async () => {
        try {
          const supRes = await api.get("/support-requests");
          if (!cancelled) {
             const open = supRes.data.filter((r) => r.status === "OPEN").length;
             setStats((s) => ({ ...s, supportOpen: open }));
          }
        } catch { /* ... */ }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  return (
    <>
      <header className="staff-page-header">
        <div>
          <div className="kicker">Welcome</div>
          <h1>{user?.fullName || "Operator"}</h1>
        </div>
      </header>

      <section className="staff-overview" aria-label="Overview">
        <div className="staff-stat-card">
          <h3>Unread notifications</h3>
          <p>{stats.unread}</p>
        </div>
        {isAdmin && (
          <>
            <div className="staff-stat-card alt">
              <h3>Registered users</h3>
              <p>{stats.users ?? "—"}</p>
            </div>
            <div className="staff-stat-card dark">
              <h3>Open support requests</h3>
              <p>{stats.supportOpen ?? "—"}</p>
            </div>
          </>
        )}
        {!isAdmin && (
          <div className="staff-stat-card dark">
            <h3>Your role</h3>
            <p style={{ fontSize: "1.1rem" }}>Technician</p>
          </div>
        )}
      </section>

      <section className="staff-action-grid" aria-label="Quick links">
        {isAdmin && (
          <>
            <div className="staff-action-card">
              <span className="staff-pill">Directory</span>
              <h4>User management</h4>
              <Link to="/users" className="btn btn-primary w-100 mt-2">
                User management
              </Link>
            </div>
            <div className="staff-action-card">
              <span className="staff-pill">Support</span>
              <h4>Support queue</h4>
              <Link to="/admin/support" className="btn btn-primary w-100 mt-2">
                Support queue
              </Link>
            </div>
          </>
        )}
        <div className="staff-action-card">
          <span className="staff-pill">Messaging</span>
          <h4>Notifications</h4>
          <Link to="/notifications" className="btn btn-primary w-100 mt-2">
            Notifications
          </Link>
        </div>
        <div className="staff-action-card">
          <span className="staff-pill">Profile</span>
          <h4>Account settings</h4>
          <Link to="/settings" className="btn btn-primary w-100 mt-2">
            Account settings
          </Link>
        </div>
      </section>

      {isStaff && (
        <p className="small text-muted mt-4 mb-0">
          Signed in as <strong>{user?.email}</strong> · role <code>{user?.role}</code>
        </p>
      )}
    </>
  );
};

export default AdminDashboardPage;
