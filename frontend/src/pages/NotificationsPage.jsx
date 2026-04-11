import { useEffect, useMemo, useState } from "react";
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
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const createNotification = async (event) => {
    event.preventDefault();
    try {
      setError("");
      await api.post("/notifications", {
        ...form,
        userId: Number(form.userId),
        referenceId: form.referenceId || null,
      });
      setForm((prev) => ({ ...prev, title: "", message: "", referenceId: "" }));
      await loadNotifications();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create notification");
    }
  };

  return (
    <div className="d-grid gap-3">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h2 className="mb-1">{isStaff ? "Operations notifications" : "Notifications"}</h2>
            <p className="text-muted mb-0">
              {isAdmin
                ? `Unread: ${unreadCount}. Use the form below to send a targeted message (user ID).`
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

      {error && <div className="alert alert-danger">{error}</div>}

      {isAdmin && (
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="mb-3">Create Notification (Admin)</h5>
            <form className="row g-3" onSubmit={createNotification}>
              <div className="col-md-4">
                <label className="form-label">Target User ID</label>
                <input
                  className="form-control"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  required
                />
              </div>
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

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {loading ? (
            <p className="text-muted mb-0">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-muted mb-0">No notifications found.</p>
          ) : (
            <div className="d-grid gap-2">
              {notifications.map((item) => {
                const isRead = item.read ?? item.isRead ?? false;
                return (
                  <div key={item.id} className="border rounded p-3">
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <div>
                      <strong>{item.title}</strong>{" "}
                      <span className="badge text-bg-secondary">{categoryLabel(item.category)}</span>
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
                  <p className="mb-1 mt-2">{item.message}</p>
                  <small className="text-muted">
                    {item.referenceType}
                    {item.referenceId ? ` #${item.referenceId}` : ""} |{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </small>
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
