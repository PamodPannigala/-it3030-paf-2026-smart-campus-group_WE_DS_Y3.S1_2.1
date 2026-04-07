import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_ORIGIN } from "../services/api";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setFullName(res.data.fullName || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.patch("/profile", { fullName });
      await refreshUser();
      setMessage("Profile updated.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently?")) return;
    setError("");
    setMessage("");
    try {
      await api.delete("/profile");
      await axios.post(`${API_ORIGIN}/logout`, {}, { withCredentials: true });
      navigate("/?mode=signup", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-3">Settings</h2>

        {loading ? (
          <p className="text-muted mb-0">Loading profile...</p>
        ) : (
          <>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="border rounded p-3 mb-3">
              <div className="row g-2">
                <div className="col-md-6">
                  <small className="text-muted d-block">Email</small>
                  <strong>{profile?.email}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Provider</small>
                  <strong>{profile?.authProvider}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={save} className="d-grid gap-3">
              <div>
                <label className="form-label">Full name</label>
                <input
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="btn btn-outline-danger" type="button" onClick={deleteAccount}>
                  Delete account
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileSettingsPage;

