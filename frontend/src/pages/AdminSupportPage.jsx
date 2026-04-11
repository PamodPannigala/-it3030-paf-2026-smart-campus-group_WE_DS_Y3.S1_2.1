import { useEffect, useState } from "react";
import api from "../services/api";

const AdminSupportPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/support-requests");
      setRows(res.data.map((r) => ({ ...r, adminNotes: r.adminNotes || "" })));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load support requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (row) => {
    try {
      setSavingId(row.id);
      setError("");
      await api.patch(`/support-requests/${row.id}`, {
        status: row.status,
        adminNotes: row.adminNotes || "",
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <header className="staff-page-header">
        <div>
          <div className="kicker">Incidents</div>
          <h1>Support queue</h1>
          <p className="sub">Review user reports, set status and notes — they receive system notifications on each save.</p>
        </div>
      </header>
    <div className="card shadow-sm border-0 campus-card">
      <div className="card-body p-4">
        <h2 className="mb-3 h5 text-muted">Open requests</h2>
        <p className="text-muted small">
          Updates notify the user via <strong>system notifications</strong>.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <p className="text-muted mb-0">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-muted mb-0">No open requests.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Admin notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>
                      <div className="small">{r.userEmail}</div>
                      <div className="text-muted small">#{r.userId}</div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div className="fw-semibold">{r.subject}</div>
                      <div className="small text-muted text-truncate">{r.description}</div>
                    </td>
                    <td style={{ minWidth: 140 }}>
                      <select
                        className="form-select form-select-sm"
                        value={r.status}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) => (x.id === r.id ? { ...x, status: e.target.value } : x))
                          )
                        }
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        value={r.adminNotes || ""}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((x) => (x.id === r.id ? { ...x, adminNotes: e.target.value } : x))
                          )
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={savingId === r.id}
                        onClick={() => save(r)}
                      >
                        {savingId === r.id ? "Saving…" : "Save"}
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
    </>
  );
};

export default AdminSupportPage;
