import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_ORIGIN } from "../services/api";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { refreshUser, isStaff } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
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
      setUsername(res.data.username || "");
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
      await api.patch("/profile", {
        fullName,
        username: profile?.authProvider === "LOCAL" ? username : undefined,
      });
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
    <>
      {isStaff && (
        <header className="m4-staff-header">
          <div>
            <div className="kicker">Profile</div>
            <h1>Account settings</h1>
            <p className="sub">Operator profile for this console session.</p>
          </div>
        </header>
      )}
    <div className="card shadow-sm border-0 campus-card m4-glass-card">
      <div className="card-body p-4">
        <h2 className="mb-3">{isStaff ? "Your details" : "Settings"}</h2>

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
                {profile?.authProvider === "LOCAL" && (
                  <div className="col-md-6">
                    <small className="text-muted d-block">Username</small>
                    <strong>{profile?.username || "—"}</strong>
                  </div>
                )}
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
              {profile?.authProvider === "LOCAL" && (
                <div>
                  <label className="form-label">Username (for sign-in)</label>
                  <input
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="3–32 characters: letters, digits, underscore"
                  />
                  <div className="form-text">Leave empty to clear your username (you can still sign in with email).</div>
                </div>
              )}
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
    </>
  );
};

export default ProfileSettingsPage;

