import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Smart Campus Member 4
        </Link>
        <div className="d-flex align-items-center gap-2">
          {!loading && user && (
            <span className="badge text-bg-info">
              {user.fullName} ({user.role})
            </span>
          )}
          {!loading && !user && (
            <button className="btn btn-sm btn-outline-light" onClick={loginWithGoogle}>
              Login
            </button>
          )}
          {!loading && user && (
            <button className="btn btn-sm btn-outline-light" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
