import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout, isStaff, isAdmin } = useAuth();
  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-semibold" : ""}`;

  const brandTo = user ? (isStaff ? "/admin" : "/home") : "/";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm campus-navbar">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-semibold" to={brandTo}>
          Campus Hub
        </NavLink>

        {!loading && user && isStaff && (
          <div className="navbar-nav me-auto ms-3 d-flex flex-row flex-wrap gap-1 align-items-center">
            <span className="nav-link disabled text-white-50 small py-0">Operations</span>
            <NavLink to="/admin" className={linkClass} end>
              Dashboard
            </NavLink>
            {isAdmin && (
              <NavLink to="/users" className={linkClass}>
                Users
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/support" className={linkClass}>
                Support queue
              </NavLink>
            )}
            <NavLink to="/notifications" className={linkClass}>
              Notifications
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              Account
            </NavLink>
          </div>
        )}

        {!loading && user && !isStaff && (
          <div className="navbar-nav me-auto ms-3 d-flex flex-row flex-wrap gap-1 align-items-center">
            <span className="nav-link disabled text-white-50 small py-0">Campus</span>
            <NavLink to="/home" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/notifications" className={linkClass}>
              Notifications
            </NavLink>
            <NavLink to="/preferences" className={linkClass}>
              Preferences
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              Settings
            </NavLink>
            <NavLink to="/support" className={linkClass}>
              Report a problem
            </NavLink>
          </div>
        )}

        <div className="d-flex align-items-center gap-2">
          {!loading && user && (
            <span className="badge text-bg-light text-primary">
              {user.fullName} ({user.role})
            </span>
          )}
          {!loading && !user && (
            <button className="btn btn-sm btn-light" onClick={loginWithGoogle}>
              Login with Google
            </button>
          )}
          {!loading && user && (
            <button className="btn btn-sm btn-light" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
