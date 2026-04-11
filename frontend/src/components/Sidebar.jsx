import { Bell, LayoutDashboard, LogIn, Settings, Users } from "lucide-react";
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

        {user && (
          <>
            <NavLink to={isStaff ? "/admin" : "/home"} className={navLinkClass}>
              <LayoutDashboard className="me-2" size={18} />
              {isStaff ? "Staff dashboard" : "Home"}
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <Settings className="me-2" size={18} />
              Settings
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              <Bell className="me-2" size={18} />
              Notifications
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={navLinkClass}>
                <Users className="me-2" size={18} />
                Manage Users
              </NavLink>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

