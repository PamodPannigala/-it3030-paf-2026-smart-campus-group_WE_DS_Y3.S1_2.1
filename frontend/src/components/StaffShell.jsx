import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Headphones,
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const StaffShell = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  const onLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="staff-console-root">
      <aside className="staff-sidebar" aria-label="Operations menu">
        <div className="staff-sidebar-brand">
          <div className="staff-sidebar-mark">CH</div>
          <span className="staff-sidebar-title">Campus Hub</span>
        </div>
        <ul className="staff-menu">
          <li>
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard className="staff-menu-icon" aria-hidden />
              <span className="label">Dashboard</span>
            </NavLink>
          </li>
          {isAdmin ? (
            <li>
              <NavLink to="/users" className={linkClass}>
                <Users className="staff-menu-icon" aria-hidden />
                <span className="label">User management</span>
              </NavLink>
            </li>
          ) : (
            <li className="disabled" title="Administrators only">
              <span>
                <Users className="staff-menu-icon" aria-hidden />
                <span className="label">User management</span>
              </span>
            </li>
          )}
          {isAdmin ? (
            <li>
              <NavLink to="/admin/support" className={linkClass}>
                <Headphones className="staff-menu-icon" aria-hidden />
                <span className="label">Support queue</span>
              </NavLink>
            </li>
          ) : (
            <li className="disabled" title="Administrators only">
              <span>
                <Headphones className="staff-menu-icon" aria-hidden />
                <span className="label">Support queue</span>
              </span>
            </li>
          )}
          <li>
            <NavLink to="/notifications" className={linkClass}>
              <Bell className="staff-menu-icon" aria-hidden />
              <span className="label">Notifications</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={linkClass}>
              <UserCircle className="staff-menu-icon" aria-hidden />
              <span className="label">Account</span>
            </NavLink>
          </li>
          <li>
            <button type="button" onClick={onLogout}>
              <LogOut className="staff-menu-icon" aria-hidden />
              <span className="label">Log out</span>
            </button>
          </li>
        </ul>
      </aside>
      <div className="staff-main">
        <div className="staff-main-inner">{children}</div>
      </div>
    </div>
  );
};

export default StaffShell;
