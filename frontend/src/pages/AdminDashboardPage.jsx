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
    (async () => {
      try {
        const countRes = await api.get("/notifications/unread-count");
        if (!cancelled) {
          setStats((s) => ({ ...s, unread: countRes.data.unreadCount ?? 0 }));
        }
        if (isAdmin) {
          const [usersRes, supRes] = await Promise.all([
            api.get("/users"),
            api.get("/support-requests"),
          ]);
          const open = supRes.data.filter((r) => r.status === "OPEN").length;
          if (!cancelled) {
            setStats((s) => ({
              ...s,
              users: usersRes.data.length,
              supportOpen: open,
            }));
          }
        }
      } catch {
        /* non-blocking */
      }
    })();
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
          <p className="sub">
            {isAdmin
              ? "You are signed in as an administrator. Use the overview below to jump into directory, support, and messaging."
              : "You are signed in as a technician. Monitor notifications and alerts; user directory and the support queue are limited to administrators."}
          </p>
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
              <p>Accounts, roles, and creating new administrators or technicians.</p>
              <Link to="/users" className="btn btn-primary">
                Open user management
              </Link>
            </div>
            <div className="staff-action-card">
              <span className="staff-pill">Support</span>
              <h4>Support queue</h4>
              <p>Review reports from campus users and post updates they receive as notifications.</p>
              <Link to="/admin/support" className="btn btn-primary">
                Open support queue
              </Link>
            </div>
          </>
        )}
        <div className="staff-action-card">
          <span className="staff-pill">Messaging</span>
          <h4>Notifications</h4>
          <p>
            {isAdmin
              ? "Broadcast or targeted messages. Students use the same inbox for system notices."
              : "Operational inbox for your campus hub session."}
          </p>
          <Link to="/notifications" className="btn btn-outline-primary">
            Open notifications
          </Link>
        </div>
        <div className="staff-action-card">
          <span className="staff-pill">Profile</span>
          <h4>Account settings</h4>
          <p>Update your display name, username, or password for this operator login.</p>
          <Link to="/settings" className="btn btn-outline-secondary">
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
