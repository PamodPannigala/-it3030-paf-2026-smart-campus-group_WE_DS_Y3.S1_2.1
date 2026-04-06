import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const { user, loading, login, logout, refreshUser } = useAuth();

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-3">Authentication</h2>
        {loading && <p className="text-muted">Loading session...</p>}

        {!loading && !user && (
          <>
            <p className="text-muted mb-3">
              Sign in with Google to use notifications and user management.
            </p>
            <button className="btn btn-primary" onClick={login}>
              Sign In With Google
            </button>
          </>
        )}

        {!loading && user && (
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Name</small>
                  <strong>{user.fullName}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Email</small>
                  <strong>{user.email}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Role</small>
                  <strong>{user.role}</strong>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <small className="text-muted d-block">Provider</small>
                  <strong>{user.authProvider}</strong>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={refreshUser}>
                Refresh
              </button>
              <button className="btn btn-outline-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
