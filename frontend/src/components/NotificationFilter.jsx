import { Search, Filter, CheckCircle2 } from "lucide-react";

/**
 * Component for filtering and searching notifications.
 */
const NotificationFilter = ({ filter, setFilter, search, setSearch, onMarkAllRead, unreadCount }) => {
  const filters = [
    { id: "ALL", label: "All" },
    { id: "SYSTEM", label: "System" },
    { id: "BOOKING", label: "Booking" },
    { id: "FACILITY", label: "Facility" },
    { id: "TICKETS", label: "Tickets" }
  ];

  return (
    <div className="card-body p-4 border-bottom">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-4">
        <div className="d-flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`btn btn-sm px-3 rounded-pill transition-all ${
                filter === f.id 
                  ? "btn-primary shadow-sm" 
                  : "btn-outline-secondary border-0"
              }`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="d-flex gap-3 flex-grow-1 flex-md-grow-0">
          <div className="position-relative flex-grow-1">
            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted w-4 h-4" />
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-pill border-0 bg-light shadow-none"
              placeholder="Search notifications..."
              style={{ minWidth: "240px", height: "40px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button 
            className="btn btn-sm btn-white border-0 text-primary fw-semibold d-flex align-items-center gap-2 px-3 hover:bg-light transition-all"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilter;
