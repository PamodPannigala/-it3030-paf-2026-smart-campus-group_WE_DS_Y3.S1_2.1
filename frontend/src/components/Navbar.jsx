import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout, isStaff, isAdmin } = useAuth();
  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? "active fw-semibold" : ""}`;

  const brandTo = user ? (isStaff ? "/admin" : "/home") : "/";

  // Get initials for avatar
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar navbar-expand-lg campus-navbar sticky-top">
      <div className="container-fluid px-3 px-md-4">
        <NavLink className="navbar-brand" to={brandTo}>
          <span className="ch-logo-icon">C</span>
          Campus Hub
        </NavLink>

        <button className="navbar-toggler border-0 shadow-none text-white opacity-75" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon" style={{filter: 'invert(1) grayscale(100%) brightness(200%)'}}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          {!loading && user && isStaff && (
            <div className="navbar-nav me-auto ms-lg-4 d-flex gap-1 align-items-center">
              <span className="nav-link disabled text-white-50 small py-0 d-none d-lg-block">Operations</span>
              <NavLink to="/admin" className={linkClass} end>Dashboard</NavLink>
              {isAdmin && <NavLink to="/users" className={linkClass}>Users</NavLink>}
              {isAdmin && <NavLink to="/admin/support" className={linkClass}>Support queue</NavLink>}
              <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
            </div>
          )}

          {!loading && user && !isStaff && (
            <div className="navbar-nav me-auto ms-lg-4 d-flex gap-1 align-items-center">
              <span className="nav-link disabled text-white-50 small py-0 d-none d-lg-block">Services</span>
              <NavLink to="/home" className={linkClass}>Home</NavLink>
              <NavLink to="/booking" className={linkClass}>Booking</NavLink>
              <NavLink to="/facilities" className={linkClass}>Facilities</NavLink>
              <NavLink to="/tickets" className={linkClass}>Tickets</NavLink>
              <NavLink to="/notifications" className={linkClass}>Notifications</NavLink>
              <NavLink to="/settings" className={linkClass}>Settings</NavLink>
            </div>
          )}

          <div className="d-flex align-items-center gap-3 ms-auto mt-3 mt-lg-0">
            {!loading && user && (
              <div className="d-flex align-items-center gap-2">
                <div className="text-end d-none d-sm-block">
                  <div className="text-white fw-semibold lh-1" style={{ fontSize: '0.9rem' }}>{user.fullName}</div>
                  <div className="text-white-50 small lh-1 mt-1">{user.role}</div>
                </div>
                <div className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                  {initials}
                </div>
                <button className="btn btn-sm btn-outline-light ms-2 rounded-pill px-3" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
            {!loading && !user && (
              <button className="btn btn-light rounded-pill px-4 fw-semibold" onClick={loginWithGoogle}>
                Login with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
