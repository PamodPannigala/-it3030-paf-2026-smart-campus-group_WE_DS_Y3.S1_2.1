import { Bell, LayoutDashboard, LogIn, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Sidebar.css";

const navLinkClass = ({ isActive }) =>
  `list-group-item list-group-item-action p-3 d-flex align-items-center ${isActive ? "active-nav-link" : ""}`;

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading p-3">Campus Hub</div>
      <div className="list-group list-group-flush">
        <NavLink to="/" className={navLinkClass}>
          <LayoutDashboard className="me-2" size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/auth" className={navLinkClass}>
          <LogIn className="me-2" size={18} />
          Authentication
        </NavLink>
        <NavLink to="/notifications" className={navLinkClass}>
          <Bell className="me-2" size={18} />
          Notifications
        </NavLink>
        <NavLink to="/preferences" className={navLinkClass}>
          <Settings className="me-2" size={18} />
          Preferences
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={navLinkClass}>
            <Users className="me-2" size={18} />
            User Roles
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
