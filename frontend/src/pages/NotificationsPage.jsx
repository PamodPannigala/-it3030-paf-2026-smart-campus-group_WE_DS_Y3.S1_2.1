import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function categoryLabel(category) {
  switch (category) {
    case "SYSTEM":
      return "System";
    case "BOOKING":
      return "Booking";
    case "FACILITY":
      return "Facility";
    case "TICKET_STATUS":
      return "Ticket (status)";
    case "TICKET_COMMENT":
      return "Ticket (comment)";
    default:
      return category;
  }
}

const NotificationsPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [targetGroup, setTargetGroup] = useState("SPECIFIC"); // SPECIFIC, ALL_USERS, ALL_ADMINS
  const [form, setForm] = useState({
    userId: "",
    category: "SYSTEM",
    title: "",
    message: "",
    referenceType: "SYSTEM",
    referenceId: "",
  });

  const defaultTargetUserId = useMemo(() => user?.id ?? "", [user?.id]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, userId: defaultTargetUserId }));
  }, [defaultTargetUserId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const [listResponse, countResponse] = await Promise.all([
        api.get("/notifications", { params: { unreadOnly } }),
        api.get("/notifications/unread-count"),
      ]);
      setNotifications(listResponse.data);
      setUnreadCount(countResponse.data.unreadCount);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      await loadNotifications();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      setError("");
      // Simple loop for now, or add backend endpoint if many
      const unread = notifications.filter(n => !(n.read ?? n.isRead));
      await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`)));
      await loadNotifications();
    } catch (err) {
      setError("Failed to mark all as read");
    }
  };

  const createNotification = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/notifications", {
        ...form,
        targetGroup,
        userId: targetGroup === "SPECIFIC" ? Number(form.userId) : null,
        referenceId: form.referenceId || null,
      });
      setForm((prev) => ({ ...prev, title: "", message: "", referenceId: "" }));
      await loadNotifications();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create notification");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchFilter = filter === "ALL" || 
                         (filter === "TICKETS" ? (n.category === "TICKET_STATUS" || n.category === "TICKET_COMMENT") : n.category === filter);
      const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.message.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [notifications, filter, search]);

  return (
    <div className="d-grid gap-3">
      {isStaff && (
        <header className="m4-staff-header">
          <div>
            <div className="kicker">Messaging</div>
            <h1>Notifications</h1>
            <p className="sub">
              {isAdmin
                ? "Your inbox plus optional targeted sends to a user by ID."
                : "Operational inbox — compose is limited to administrators."}
            </p>
          </div>
        </header>
      )}
      <div className="card shadow-sm border-0 campus-card m4-glass-card">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <div className="d-flex flex-wrap gap-2">
              {["ALL", "SYSTEM", "BOOKING", "FACILITY", "TICKETS"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "TICKETS" ? "Tickets" : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search notifications..."
                style={{ maxWidth: "200px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-sm btn-outline-secondary" onClick={markAllAsRead}>
                Mark All Read
              </button>
            </div>
          </div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h2 className="mb-1">{isStaff ? "Operations notifications" : "Notifications"}</h2>
              <p className="text-muted mb-0">
                {isAdmin
                  ? `Unread: ${unreadCount}. Use the form below to send targeted or broadcast messages.`
                  : isStaff
                    ? `Unread: ${unreadCount}. Operational messages for your role.`
                    : `Unread: ${unreadCount}. Updates from support and the campus hub appear here.`}
              </p>
            </div>
            <div className="form-check form-switch">
              <input
                id="unreadOnly"
                className="form-check-input"
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              <label htmlFor="unreadOnly" className="form-check-label">
                Show unread only
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <div className="card shadow-sm border-0 campus-card m4-glass-card">
          <div className="card-body p-4">
            <h5 className="mb-3">Create Notification (Admin)</h5>
            <form className="row g-3" onSubmit={createNotification}>
              <div className="col-md-4">
                <label className="form-label">Target Group</label>
                <select 
                  className="form-select"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                >
                  <option value="SPECIFIC">Specific User ID</option>
                  <option value="ALL_USERS">All Users</option>
                  <option value="ALL_ADMINS">All Admins</option>
                </select>
              </div>
              {targetGroup === "SPECIFIC" && (
                <div className="col-md-4">
                  <label className="form-label">User ID</label>
                  <input
                    className="form-control"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="SYSTEM">SYSTEM</option>
                  <option value="BOOKING">BOOKING</option>
                  <option value="FACILITY">FACILITY</option>
                  <option value="TICKET_STATUS">TICKET_STATUS</option>
                  <option value="TICKET_COMMENT">TICKET_COMMENT</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Reference Type</label>
                <input
                  className="form-control"
                  value={form.referenceType}
                  onChange={(e) => setForm({ ...form, referenceType: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Reference ID (optional)</label>
                <input
                  className="form-control"
                  value={form.referenceId}
                  onChange={(e) => setForm({ ...form, referenceId: e.target.value })}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <button className="btn btn-primary" type="submit">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 campus-card m4-glass-card">
        <div className="card-body p-4">
          {loading ? (
            <p className="text-muted mb-0">Loading notifications...</p>
          ) : filteredNotifications.length === 0 ? (
            <p className="text-muted mb-0">No notifications found.</p>
          ) : (
            <div className="d-grid gap-2">
              {filteredNotifications.map((item) => {
                const isRead = item.read ?? item.isRead ?? false;
                return (
                  <div key={item.id} className="border rounded p-3 m4-notif-item">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong>{item.title}</strong>
                        <span className="badge text-bg-secondary">{categoryLabel(item.category)}</span>
                        {!isRead && <span className="badge rounded-pill bg-primary" style={{ fontSize: "0.6rem" }}>New</span>}
                      </div>
                      <p className="mb-2 text-dark">{item.message}</p>
                      <div className="d-flex flex-wrap align-items-center gap-3">
                        <small className="text-muted">
                          {item.referenceType}
                          {item.referenceId ? ` #${item.referenceId}` : ""} |{" "}
                          {new Date(item.createdAt).toLocaleString()}
                        </small>
                        {item.referenceId && (item.category.startsWith("TICKET") || item.category === "SYSTEM") && (
                           <Link 
                             to={item.category === "SYSTEM" ? "/settings" : (isStaff ? "/admin/support" : "/support")}
                             className="btn btn-sm btn-link p-0 text-decoration-none"
                           >
                             View details →
                           </Link>
                        )}
                      </div>
                    </div>
                    {!isRead && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => markAsRead(item.id)}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
