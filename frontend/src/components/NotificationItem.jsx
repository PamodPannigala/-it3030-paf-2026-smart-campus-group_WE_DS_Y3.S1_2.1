import { motion } from "framer-motion";
import { Check, Trash2, Bell, Calendar, Building2, Ticket, Info, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

const categoryIcon = (category) => {
  switch (category) {
    case "SYSTEM": return <Info className="w-4 h-4 text-blue-500" />;
    case "BOOKING": return <Calendar className="w-4 h-4 text-emerald-500" />;
    case "FACILITY": return <Building2 className="w-4 h-4 text-purple-500" />;
    case "TICKET_STATUS":
    case "TICKET_COMMENT": return <Ticket className="w-4 h-4 text-orange-500" />;
    default: return <Bell className="w-4 h-4 text-gray-400" />;
  }
};

const NotificationItem = ({ item, onMarkRead, onDelete, isStaff }) => {
  const isRead = item.read ?? item.isRead ?? false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={clsx(
        "m4-notif-item border rounded-xl p-4 mb-3 shadow-sm",
        !isRead && "unread bg-blue-50/50 border-blue-100"
      )}
    >
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-start gap-3 flex-grow-1">
          <div className={clsx(
            "p-2 rounded-lg bg-white shadow-sm border",
            !isRead ? "border-blue-200" : "border-gray-100"
          )}>
            {categoryIcon(item.category)}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="mb-0 fw-bold">{item.title}</h6>
              {!isRead && (
                <span className="badge rounded-pill bg-primary" style={{ fontSize: "0.65rem" }}>NEW</span>
              )}
            </div>
            <p className="mb-2 text-muted small">{item.message}</p>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                {new Date(item.createdAt).toLocaleString()}
              </span>
              {item.referenceId && (
                <button className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-medium d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                  View Details <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          {!isRead && (
            <button
              className="btn btn-sm btn-light border p-2 rounded-circle text-success transition-all hover:bg-success hover:text-white"
              onClick={() => onMarkRead(item.id)}
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            className="btn btn-sm btn-light border p-2 rounded-circle text-danger transition-all hover:bg-danger hover:text-white"
            onClick={() => onDelete(item.id)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
