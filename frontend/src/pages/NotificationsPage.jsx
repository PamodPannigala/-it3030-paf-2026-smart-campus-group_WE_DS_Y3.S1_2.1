import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import NotificationItem from "../components/NotificationItem";
import NotificationFilter from "../components/NotificationFilter";
import { Bell, Send, Inbox, ShieldAlert, Building2, Clock, Calendar, Info } from "lucide-react";
import usePushNotifications from "../hooks/usePushNotifications";

const NotificationsPage = () => {
  const MotionDiv = motion.div;
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
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
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

  const loadNotifications = useCallback(async () => {
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
  }, [unreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setError("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      setError("");
      await api.post("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Reload count just in case
      const countResponse = await api.get("/notifications/unread-count");
      setUnreadCount(countResponse.data.unreadCount);
    } catch {
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

  const fetchDetails = useCallback(async (notification) => {
    if (!notification.referenceType || !notification.referenceId) return;
    
    setDetailsLoading(true);
    setDetails(null);
    try {
      let endpoint = "";
      switch (notification.referenceType) {
        case "BOOKING": endpoint = `/bookings/${notification.referenceId}`; break;
        case "FACILITY": endpoint = `/resources/${notification.referenceId}`; break;
        case "TICKET": endpoint = `/tickets/${notification.referenceId}`; break;
        default: return;
      }
      const response = await api.get(endpoint);
      setDetails(response.data);
    } catch (err) {
      console.error("Failed to fetch notification details:", err);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedNotification) {
      fetchDetails(selectedNotification);
    }
  }, [selectedNotification, fetchDetails]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const categoryMatch = filter === "ALL" || 
                           (filter === "TICKETS" ? (n.category === "TICKET_STATUS" || n.category === "TICKET_COMMENT") : n.category === filter);
      const searchMatch = (n.title?.toLowerCase() || "").includes(search.toLowerCase()) || 
                         (n.message?.toLowerCase() || "").includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [notifications, filter, search]);

  return (
    <div className="d-grid gap-4 animate-fade-in">
      {/* Admin Banner */}
      {isStaff && (
        <header className="m4-staff-header">
          <div>
            <div className="kicker">Management Console</div>
            <h1>Notification Hub</h1>
            <p className="sub">
              Broadcast system-wide alerts or send targeted communications to specific campus users.
            </p>
          </div>
        </header>
      )}

          {/* User Side Picture Banner */}
          {!isStaff && (
            <div className="card border-0 rounded-4 overflow-hidden mb-5 shadow-sm" style={{ 
              height: "220px",
              background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=2070&auto=format&fit=crop') center/cover`
            }}>
              <div className="card-body d-flex flex-column justify-content-center px-5 text-white">
                <h2 className="display-6 fw-bold mb-1 text-white text-start">Your Messaging Hub</h2>
                <p className="lead fs-6 mb-0 opacity-90 text-start">Stay updated with the latest campus announcements and booking alerts.</p>
              </div>
            </div>
          )}
          
          {/* Header Section (Original, modified for staff) */}
          {!isStaff && (
            <header className="d-flex justify-content-between align-items-end mb-4">
              <MotionDiv initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-2 fw-bold tracking-wider fs-xs">
                  INBOX & ALERTS
                </span>
              </MotionDiv>

              <MotionDiv
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
              </MotionDiv>
            </header>
          )}

          {isStaff && (
             <header className="d-flex justify-content-end mb-4">
                <MotionDiv
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="form-check form-switch bg-white p-3 rounded-pill shadow-sm border px-4 d-flex align-items-center gap-2 cursor-pointer"
                >
                  <input
                    id="unreadOnlyStaff"
                    className="form-check-input ms-0"
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                  />
                  <label htmlFor="unreadOnlyStaff" className="form-check-label text-muted fw-medium small mb-0">
                    Filter Unread
                  </label>
                </MotionDiv>
             </header>
          )}

          {error && (
            <MotionDiv initial={{ height: 0 }} animate={{ height: "auto" }} className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5" />
              {error}
            </MotionDiv>
          )}

          <div className="row g-4">
            
            {/* Main Notifications List */}
            <div className={isAdmin ? "col-lg-8" : "col-12"}>
              <div className="card m4-glass-card border-0 overflow-hidden">
                
                <NotificationFilter 
                  filter={filter}
                  setFilter={setFilter}
                  search={search}
                  setSearch={setSearch}
                  onMarkAllRead={markAllAsRead}
                  unreadCount={unreadCount}
                />

                <div className="card-body px-4 pb-4 pt-0 bg-transparent">
                  {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <span className="text-muted">Fetching your messages...</span>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="d-flex flex-column align-items-center py-5 opacity-50">
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
                          onViewDetails={() => setSelectedNotification(item)}
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
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card m4-glass-card border-0"
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
                </MotionDiv>
              </div>
            )}
            


    </div>
    {/* Notification Detail Modal - Moved outside main container to fix viewport positioning */}
    <AnimatePresence>
      {selectedNotification && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="m4-modal-overlay"
          onClick={() => { setSelectedNotification(null); setDetails(null); }}
        >
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="m4-modal-content m4-glass-card p-4"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "600px", width: "95%" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <span className="badge bg-primary-subtle text-primary mb-2 px-3 py-2 rounded-pill fw-bold">
                  {selectedNotification.category?.replace(/_/g, ' ') || 'GENERAL'}
                </span>
                <h3 className="fw-bold mb-0 display-6">{selectedNotification.title}</h3>
              </div>
              <button className="btn-close shadow-none" onClick={() => { setSelectedNotification(null); setDetails(null); }}></button>
            </div>
            
            <div className="mb-4">
              <p className="text-muted lead fs-6" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                {selectedNotification.message}
              </p>
            </div>

            {/* Dynamic Details Section */}
            <AnimatePresence mode="wait">
              {detailsLoading ? (
                <div className="d-flex justify-content-center py-4">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
              ) : details ? (
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-4 bg-light border shadow-inner mb-4"
                >
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Info className="w-4 h-4 text-primary" /> Related Information
                  </h6>
                  
                  <div className="row g-3">
                    {selectedNotification.referenceType === "BOOKING" && (
                      <>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Resource</label>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <Building2 className="w-4 h-4" /> {details.resourceName || `ID: ${details.resourceId}`}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Time Slot</label>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <Clock className="w-4 h-4" /> {details.startTime} - {details.endTime}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Date</label>
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            <Calendar className="w-4 h-4" /> {details.bookingDate}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Status</label>
                          <span className={`badge rounded-pill ${details.status === 'APPROVED' ? 'bg-success' : 'bg-warning'}`}>
                            {details.status}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.referenceType === "FACILITY" && (
                      <>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Facility Name</label>
                          <div className="fw-semibold">{details.name}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Location</label>
                          <div className="fw-semibold">{details.location}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Capacity</label>
                          <div className="fw-semibold">{details.capacity} People</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Status</label>
                          <span className="badge bg-success rounded-pill">{details.status}</span>
                        </div>
                      </>
                    )}

                    {selectedNotification.referenceType === "TICKET" && (
                      <>
                        <div className="col-12">
                          <label className="small text-muted d-block mb-1">Ticket Title</label>
                          <div className="fw-semibold">{details.title}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Priority</label>
                          <span className="badge bg-danger rounded-pill">{details.priority}</span>
                        </div>
                        <div className="col-sm-6">
                          <label className="small text-muted d-block mb-1">Current Status</label>
                          <span className="badge bg-info text-dark rounded-pill">{details.status}</span>
                        </div>
                      </>
                    )}
                  </div>
                </MotionDiv>
              ) : selectedNotification.referenceId && !detailsLoading && (
                <div className="alert alert-light border small text-muted text-center py-3 rounded-4 mb-4">
                  The related record is no longer available.
                </div>
              )}
            </AnimatePresence>

            <div className="d-flex justify-content-between align-items-center border-top pt-4">
              <span className="text-muted small d-flex align-items-center gap-2">
                <Clock className="w-3 h-3" /> Received {new Date(selectedNotification.createdAt).toLocaleString()}
              </span>
              <button 
                className="btn btn-primary px-5 rounded-pill fw-bold shadow-sm" 
                onClick={() => { setSelectedNotification(null); setDetails(null); }}
              >
                Close
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
