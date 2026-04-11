import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import { CheckCircle2 } from "lucide-react";

const slides = [
  {
    gradient: "linear-gradient(125deg, #0a1428 0%, #0077b6 55%, #00b4d8 100%)",
    title: "Smart campus operations",
    subtitle: "One hub for notices, support, and your profile — built for clarity and speed.",
  },
  {
    gradient: "linear-gradient(125deg, #1c2526 0%, #005f92 50%, #0077b6 100%)",
    title: "Stay informed",
    subtitle: "System updates and responses from administrators land in your notifications inbox.",
  },
  {
    gradient: "linear-gradient(125deg, #0a1428 0%, #ff9500 35%, #0077b6 90%)",
    title: "Get help when you need it",
    subtitle: "Report a problem directly to the operations team and track progress from your account.",
  },
];

const qualityData = [
  { percentage: "24/7", description: "Access to your hub dashboard" },
  { percentage: "1 place", description: "Notifications, settings & support" },
  { percentage: "Secure", description: "Session-based sign-in you control" },
  { percentage: "Fast", description: "Lightweight tools for daily campus tasks" },
  { percentage: "Clear", description: "Preferences for how we reach you" },
  { percentage: "Human", description: "Real staff on the other end of support" },
];

const services = [
  {
    title: "Notifications",
    description: "Unread counts, read receipts, and campus-wide updates in one stream.",
    emoji: "🔔",
    path: "/notifications",
  },
  {
    title: "Preferences",
    description: "Choose how ticket-style alerts behave when modules are connected.",
    emoji: "⚙️",
    path: "/preferences",
  },
  {
    title: "Report a problem",
    description: "Send details to administrators and get system messages when it’s handled.",
    emoji: "💬",
    path: "/support",
  },
  {
    title: "Profile & security",
    description: "Update your name, username, or password for local sign-in.",
    emoji: "👤",
    path: "/settings",
  },
];

const HomePage = () => {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (isStaff) {
      navigate("/admin", { replace: true });
    }
  }, [isStaff, navigate]);

  useEffect(() => {
    api
      .get("/notifications/unread-count")
      .then((res) => setUnreadCount(res.data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  if (isStaff) {
    return null;
  }

  return (
    <div className="home-landing">
      <section className="home-slideshow" aria-label="Highlights">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`home-slide ${i === slide ? "active" : ""}`}
            style={{ background: s.gradient }}
          >
            <div className="home-slide-overlay">
              <div className="home-slide-content">
                <h2>{s.title}</h2>
                <p>{s.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        <div className="home-slide-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === slide ? "active" : ""}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </section>

      <section className="home-hero">
        <h1>Your campus hub, simplified</h1>
        <p>
          Welcome back, {user?.fullName?.split(" ")[0] || "scholar"}. Jump into notifications, tune your preferences,
          or reach the operations team — everything stays in sync with your account.
        </p>
        <Link className="home-cta" to="/notifications">
          Go to notifications
        </Link>
      </section>

      <section className="home-stats">
        <h2>Designed around your day</h2>
        <div className="home-stats-grid">
          {qualityData.map((d, i) => (
            <div key={i} className="home-stat-tile">
              <span className="pct">{d.percentage}</span>
              <span className="desc">{d.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-services">
        <div className="home-services-head">
          <h2>What you can do here</h2>
          <p>Shortcuts to the tools included in this module — same routes and behavior as before.</p>
        </div>
        <div className="home-service-grid">
          {services.map((svc) => (
            <Link key={svc.path} to={svc.path} className="home-service-card">
              <div className="emoji" aria-hidden>
                {svc.emoji}
              </div>
              <h3>{svc.title}</h3>
              <p>{svc.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-why">
        <div className="home-why-grid">
          <div>
            <h2>Why use Campus Hub?</h2>
            <p className="lead">
              This slice focuses on trustworthy authentication and dependable notifications — so you always know when
              something needs your attention, and you have a direct line to people who can help.
            </p>
            <div className="home-check">
              <CheckCircle2 size={20} aria-hidden />
              <span>Session-based security with optional Google sign-in.</span>
            </div>
            <div className="home-check">
              <CheckCircle2 size={20} aria-hidden />
              <span>System notices separated from future ticket-style alerts.</span>
            </div>
            <div className="home-check">
              <CheckCircle2 size={20} aria-hidden />
              <span>Support workflow that writes back to your notification inbox.</span>
            </div>
            <div className="home-check">
              <CheckCircle2 size={20} aria-hidden />
              <span>Unread count on this page: {unreadCount} — open notifications to clear them.</span>
            </div>
          </div>
          <div className="home-why-visual">
            <div className="home-why-visual-inner">
              <strong>{unreadCount}</strong>
              unread message{unreadCount === 1 ? "" : "s"} waiting
              <div className="small text-muted mt-2" style={{ color: "var(--ch-muted)" }}>
                Campus Hub · {user?.role || "USER"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-newsletter">
        <div className="home-newsletter-inner">
          <h2>Stay in the loop</h2>
          <p>
            This demo doesn’t send marketing email — use notifications inside the app for real campus updates from your
            team.
          </p>
          <div className="home-newsletter-form">
            <input type="email" placeholder="Campus email (display only)" readOnly aria-readonly />
            <button type="button" onClick={() => navigate("/notifications")}>
              Open inbox
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
