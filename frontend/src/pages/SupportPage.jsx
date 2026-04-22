import { useEffect, useState } from "react";
import api from "../services/api";

const SupportPage = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/support-requests/mine");
      setMine(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await api.post("/support-requests", { subject, description });
      setMessage("Your request was sent. Admins have been notified; check Notifications for updates.");
      setSubject("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-grid gap-3">
      <div className="card shadow-sm border-0 campus-card">
        <div className="card-body p-4">
          <h2 className="mb-2">Report a problem</h2>
          <p className="text-muted mb-0">
            Describe your issue. An administrator will review it and you will receive a{" "}
            <strong>system notification</strong> when there is an update.
          </p>
        </div>
      </div>

      <div className="card shadow-sm border-0 campus-card">
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form className="d-grid gap-3" onSubmit={submit}>
            <div>
              <label className="form-label">Subject</label>
              <input
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                required
              />
            </div>
            <div>
              <label className="form-label">Details</label>
              <textarea
                className="form-control"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={4000}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send to admin"}
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0 campus-card">
        <div className="card-body p-4">
          <h5 className="mb-3">Your requests</h5>
          {loading ? (
            <p className="text-muted mb-0">Loading…</p>
          ) : mine.length === 0 ? (
            <p className="text-muted mb-0">No requests yet.</p>
          ) : (
            <div className="d-grid gap-2">
              {mine.map((r) => (
                <div key={r.id} className="border rounded p-3">
                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <strong>{r.subject}</strong>
                    <span className="badge text-bg-secondary">{r.status}</span>
                  </div>
                  <p className="small text-muted mb-1 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                  <p className="mb-0">{r.description}</p>
                  {r.adminNotes && (
                    <div className="mt-2 p-2 bg-light rounded small">
                      <span className="text-muted">Admin: </span>
                      {r.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
