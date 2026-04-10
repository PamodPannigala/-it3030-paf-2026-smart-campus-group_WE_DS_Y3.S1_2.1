import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-semibold" to={user ? "/home" : "/"}>
          Campus Hub
        </NavLink>

        {!loading && user && (
          <div className="navbar-nav me-auto ms-3 d-flex flex-row gap-2">
            <NavLink to="/home" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/notifications" className={linkClass}>
              Notifications
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              Settings
            </NavLink>
            {user.role === "ADMIN" && (
              <>
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
                <NavLink to="/users" className={linkClass}>
                  Users
                </NavLink>
              </>
            )}
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
