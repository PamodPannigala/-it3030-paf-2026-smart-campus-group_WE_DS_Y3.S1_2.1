import {
  Bell,
  Building,
  Calendar,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  Ticket,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const navLinkClass = ({ isActive }) =>
  `list-group-item list-group-item-action p-3 d-flex align-items-center ${isActive ? "active-nav-link" : ""}`;

const Sidebar = () => {
  const { user, isAdmin, isStaff } = useAuth();

  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading p-3">Campus Hub</div>
      <div className="list-group list-group-flush">
        {!user && (
          <NavLink to="/" className={navLinkClass}>
            <LogIn className="me-2" size={18} />
            Login
          </NavLink>
        )}

        {user && isStaff && (
          <>
            <NavLink to="/admin" className={navLinkClass} end>
              <LayoutDashboard className="me-2" size={18} />
              Operations dashboard
            </NavLink>
            {isAdmin && (
              <>
                <NavLink to="/users" className={navLinkClass}>
                  <Users className="me-2" size={18} />
                  User management
                </NavLink>
                <NavLink to="/admin/facilities" className={navLinkClass}>
                  <Building className="me-2" size={18} />
                  Facility management
                </NavLink>
                <NavLink to="/admin/bookings" className={navLinkClass}>
                  <Calendar className="me-2" size={18} />
                  Booking management
                </NavLink>
                <NavLink to="/admin/tickets" className={navLinkClass}>
                  <Ticket className="me-2" size={18} />
                  Ticket management
                </NavLink>
              </>
            )}
            <NavLink to="/notifications" className={navLinkClass}>
              <Bell className="me-2" size={18} />
              Notifications
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="me-2" size={18} />
              Account
            </NavLink>
          </>
        )}

        {user && !isStaff && (
          <>
            <NavLink to="/home" className={navLinkClass}>
              <LayoutDashboard className="me-2" size={18} />
              Home
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              <Bell className="me-2" size={18} />
              Notifications
            </NavLink>
            <NavLink to="/preferences" className={navLinkClass}>
              <SlidersHorizontal className="me-2" size={18} />
              Preferences
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="me-2" size={18} />
              Settings
            </NavLink>
            <NavLink to="/support" className={navLinkClass}>
              <MessageSquare className="me-2" size={18} />
              Report a problem
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
