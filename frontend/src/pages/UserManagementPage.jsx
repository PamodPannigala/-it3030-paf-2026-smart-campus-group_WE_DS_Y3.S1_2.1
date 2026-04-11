import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const UserManagementPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);

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

  const updateRole = async (userId, role) => {
    try {
      setSavingUserId(userId);
      setError("");
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
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-3">User Role Management</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <p className="text-muted mb-0">Loading users...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
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
                {users.map((user) => (
                  <tr key={user.id}>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
