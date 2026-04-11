import { useEffect, useState } from "react";
import api from "../services/api";

const NotificationPreferencesPage = () => {
  const [form, setForm] = useState({
    ticketStatusEnabled: true,
    ticketCommentEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/notifications/preferences");
      setForm(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const savePreferences = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setMessage("");
      await api.patch("/notifications/preferences", form);
      setMessage("Preferences saved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 campus-card">
      <div className="card-body p-4">
        <h2 className="mb-3">Notification Preferences</h2>
        <p className="text-muted small mb-3">
          These switches apply to <strong>ticket-related</strong> categories only. <strong>System</strong> notifications
          (support updates, admin messages, and similar) are always delivered.
        </p>

        {loading ? (
          <p className="text-muted mb-0">Loading preferences...</p>
        ) : (
          <form onSubmit={savePreferences}>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="ticketStatusEnabled"
                checked={form.ticketStatusEnabled}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ticketStatusEnabled: e.target.checked }))
                }
              />
              <label className="form-check-label" htmlFor="ticketStatusEnabled">
                Ticket status notifications
              </label>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="ticketCommentEnabled"
                checked={form.ticketCommentEnabled}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ticketCommentEnabled: e.target.checked }))
                }
              />
              <label className="form-check-label" htmlFor="ticketCommentEnabled">
                Ticket comment notifications
              </label>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </form>
        )}

        {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
