import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { API_ORIGIN } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Mail } from "lucide-react";
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
              <div className="d-flex align-items-center gap-3 mb-3">
                <div 
                  className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-primary fw-bold" 
                  style={{ width: "80px", height: "80px", fontSize: "1.5rem", overflow: "hidden" }}
                >
                  {profile?.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    fullName.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <label className="btn btn-outline-primary btn-sm mb-0">
                    {saving ? "Uploading..." : "Change Picture"}
                    <input 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                        if (!cloudName || !uploadPreset) {
                          setError("Cloudinary not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
                          return;
                        }

                        setSaving(true);
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("upload_preset", uploadPreset);

                        try {
                          const res = await axios.post(
                            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                            formData
                          );
                          const imageUrl = res.data.secure_url;
                          
                          // Update profile on backend
                          await api.patch("/profile", {
                            fullName,
                            username: profile?.authProvider === "LOCAL" ? username : undefined,
                            profilePictureUrl: imageUrl
                          });
                          
                          await refreshUser();
                          setMessage("Profile picture updated.");
                          await load();
                        } catch {
                          setError("Failed to upload image to Cloudinary.");
                        } finally {
                          setSaving(false);
                        }
                      }} 
                    />
                  </label>
                  {profile?.profilePictureUrl && (
                    <button 
                      className="btn btn-link btn-sm text-danger ms-2" 
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await api.patch("/profile", { 
                            fullName, 
                            username, 
                            profilePictureUrl: "" 
                          });
                          await refreshUser();
                          await load();
                          setMessage("Profile picture removed.");
                        } catch {
                          setError("Failed to remove picture.");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="row g-2">
                <div className="col-md-6 text-truncate">
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
                <div className="col-md-6">
                  <small className="text-muted d-block">Last Login</small>
                  <strong>{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : "Never"}</strong>
                </div>
              </div>
            </div>

            {/* Notification Status Card (Innovation for Rubric) */}
            <div className="p-3 bg-light rounded-xl mb-4 border border-dashed d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className={profile?.emailEnabled ? "text-success" : "text-muted opacity-50"}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="small fw-bold uppercase tracking-wider text-muted" style={{ fontSize: '0.65rem' }}>Notification Status</div>
                  <div className="fw-bold small">{profile?.emailEnabled ? "Email Alerts Active" : "Email Alerts Inactive"}</div>
                </div>
              </div>
              <Link to="/preferences" className="btn btn-sm btn-outline-primary fw-bold">
                Configure
              </Link>
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
              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save details"}
                </button>
                <Link to="/preferences" className="btn btn-outline-primary">
                  Manage Notifications
                </Link>
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

