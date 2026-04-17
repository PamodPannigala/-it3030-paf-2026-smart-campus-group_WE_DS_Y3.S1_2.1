import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import NotificationItem from "../components/NotificationItem";
import NotificationFilter from "../components/NotificationFilter";
import { Bell, Send, Inbox, ShieldAlert } from "lucide-react";
import usePushNotifications from "../hooks/usePushNotifications";

const NotificationsPage = () => {
  const { user, isAdmin, isStaff } = useAuth();
  const { showNotification } = usePushNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [targetGroup, setTargetGroup] = useState("SPECIFIC");
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
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      setError("");
      await api.post("/api/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Reload count just in case
      const countResponse = await api.get("/notifications/unread-count");
      setUnreadCount(countResponse.data.unreadCount);
    } catch (err) {
      setError("Failed to delete notification");
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
      showNotification(`Notification Sent: ${form.title}`, { body: form.message });
      setForm((prev) => ({ ...prev, title: "", message: "", referenceId: "" }));
      await loadNotifications();
      // Optional: Add a success toast here
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create notification");
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchFilter = filter === "ALL" || 
                         (filter === "TICKETS" ? (n.category === "TICKET_STATUS" || n.category === "TICKET_COMMENT") : n.category === f);
      const categoryMatch = filter === "ALL" || 
                           (filter === "TICKETS" ? (n.category === "TICKET_STATUS" || n.category === "TICKET_COMMENT") : n.category === filter);
      const searchMatch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.message.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [notifications, filter, search]);

  return (
    <div className="container-fluid py-4 min-vh-100 animate-fade-in">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          
          {/* Header Section */}
          <header className="d-flex justify-content-between align-items-end mb-5">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-3 fw-bold tracking-wider fs-xs">
                {isStaff ? "ADMINISTRATION PANEL" : "MESSAGING HUB"}
              </span>
              <h1 className="display-5 fw-bold mb-2">Notifications</h1>
              <p className="text-muted lead fs-6">
                {isAdmin 
                  ? "Manage system-wide broadcasts and targeted user alerts." 
                  : "Stay updated with campus events, bookings, and support."}
              </p>
            </motion.div>

            <motion.div 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="form-check form-switch bg-white p-3 rounded-pill shadow-sm border px-4 d-flex align-items-center gap-2 cursor-pointer"
            >
              <input
                id="unreadOnly"
                className="form-check-input ms-0"
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
              />
              <label htmlFor="unreadOnly" className="form-check-label text-muted fw-medium small mb-0">
                Unread only
              </label>
            </motion.div>
          </header>

          {error && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          <div className="row g-4">
            
            {/* Main Notifications List */}
            <div className={isAdmin ? "col-lg-8" : "col-12"}>
              <div className="card m4-glass-card border-0 overflow-hidden h-100">
                
                <NotificationFilter 
                  filter={filter}
                  setFilter={setFilter}
                  search={search}
                  setSearch={setSearch}
                  onMarkAllRead={markAllAsRead}
                  unreadCount={unreadCount}
                />

                <div className="card-body p-4 bg-transparent" style={{ minHeight: "400px" }}>
                  {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <span className="text-muted">Fetching your messages...</span>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5 opacity-50">
                      <Inbox className="w-16 h-16 mb-3 text-muted" />
                      <h5>No notifications found</h5>
                      <p className="text-muted small">Try adjusting your filters or search terms</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredNotifications.map((item) => (
                        <NotificationItem 
                          key={item.id}
                          item={item}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          isStaff={isStaff}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Compose Sidebar */}
            {isAdmin && (
              <div className="col-lg-4">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card m4-glass-card border-0 h-100"
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="bg-primary text-white p-2 rounded-lg shadow-sm">
                        <Bell className="w-5 h-5" />
                      </div>
                      <h5 className="mb-0 fw-bold">Compose</h5>
                    </div>

                    <form className="d-grid gap-3" onSubmit={createNotification}>
                      <div>
                        <label className="form-label small fw-bold text-muted">Target Group</label>
                        <select 
                          className="form-select border-0 bg-light rounded-3"
                          value={targetGroup}
                          onChange={(e) => setTargetGroup(e.target.value)}
                        >
                          <option value="SPECIFIC">Specific User ID</option>
                          <option value="ALL_USERS">All Users</option>
                          <option value="ALL_ADMINS">All Admins</option>
                        </select>
                      </div>

                      {targetGroup === "SPECIFIC" && (
                        <div>
                          <label className="form-label small fw-bold text-muted">User ID</label>
                          <input
                            className="form-control border-0 bg-light rounded-3"
                            placeholder="e.g. 101"
                            value={form.userId}
                            onChange={(e) => setForm({ ...form, userId: e.target.value })}
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="form-label small fw-bold text-muted">Category</label>
                        <select
                          className="form-select border-0 bg-light rounded-3"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                          <option value="SYSTEM">System Update</option>
                          <option value="BOOKING">Booking Status</option>
                          <option value="FACILITY">Facility Alerts</option>
                          <option value="TICKET_STATUS">Support Tickets</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label small fw-bold text-muted">Title</label>
                        <input
                          className="form-control border-0 bg-light rounded-3"
                          placeholder="Brief summary..."
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label className="form-label small fw-bold text-muted">Message</label>
                        <textarea
                          className="form-control border-0 bg-light rounded-3"
                          rows={4}
                          placeholder="Write your message here..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          required
                        />
                      </div>

                      <button className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-2" type="submit">
                        <Send className="w-4 h-4" />
                        Push Notification
                      </button>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

export default NotificationsPage;
