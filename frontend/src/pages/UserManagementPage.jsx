import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const emptyCreateForm = () => ({
  fullName: "",
  username: "",
  email: "",
  password: "",
  role: "TECHNICIAN",
});

const UserManagementPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const createStaff = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    // Email validation: must have @ and .
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email.trim())) {
      setError("Please provide a valid email address containing both '@' and '.' (e.g., user@example.com).");
      setCreating(false);
      return;
    }

    try {
      await api.post("/users", {
        fullName: createForm.fullName.trim(),
        username: createForm.username.trim().toLowerCase(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      setMessage("Account created. They can sign in with username or email and the password you set.");
      setCreateForm(emptyCreateForm());
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      setSavingUserId(userId);
      setError("");
      setMessage("");
      await api.patch(`/users/${userId}/role`, { role });
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update role");
    } finally {
      setSavingUserId(null);
    }
  };

  if (!isAdmin) {
    return <div className="alert alert-warning">Admin access required.</div>;
  }

  return (
    <div className="d-grid gap-4">
      <header className="m4-staff-header">
        <div>
          <div className="kicker">Directory</div>
          <h1>User management</h1>
        </div>
      </header>
      <div className="card shadow-sm border-0 campus-card m4-glass-card text-dark text-start">
        <div className="card-body p-4">
          <h3 className="mb-4">Add administrator or technician</h3>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form className="row g-3" onSubmit={createStaff}>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Full name</label>
              <input
                className="form-control"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="letters, digits, underscore"
                required
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Temporary password</label>
              <input
                className="form-control"
                type="password"
                autoComplete="new-password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              >
                <option value="TECHNICIAN">Technician</option>
                <option value="SECURITY">Security</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 campus-card m4-glass-card text-dark text-start">
        <div className="card-body p-4">
          <h2 className="mb-3">All users &amp; roles</h2>
          {loading ? (
            <p className="text-muted mb-0">Loading users...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle text-dark">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr className="text-dark">
                      <td colSpan="7" className="text-center py-4">
                        <div className="text-muted">No users found in the database.</div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="text-dark">
                        <td>{user.fullName}</td>
                        <td>{user.username || "—"}</td>
                        <td>{user.email}</td>
                        <td>{user.authProvider}</td>
                        <td>{user.enabled ? "Enabled" : "Disabled"}</td>
                        <td style={{ maxWidth: 180 }}>
                          <select
                            className="form-select"
                            value={user.role}
                            onChange={(e) => {
                              const nextRole = e.target.value;
                              setUsers((prev) =>
                                prev.map((item) =>
                                  item.id === user.id ? { ...item, role: nextRole } : item
                                )
                              );
                            }}
                          >
                            <option value="USER">USER</option>
                            <option value="TECHNICIAN">TECHNICIAN</option>
                            <option value="SECURITY">SECURITY</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            disabled={savingUserId === user.id}
                            onClick={() => updateRole(user.id, user.role)}
                          >
                            {savingUserId === user.id ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
