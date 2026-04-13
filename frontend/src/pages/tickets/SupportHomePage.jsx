import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../../styles/SupportHomePage.css';
import {
  Search,
  Wrench,
  ClipboardList,
  MessageSquareQuote,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock3,
} from "lucide-react";

export default function SupportHomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/featured?search=${encodeURIComponent(trimmed)}` : "/featured");
  };

  const quickActions = [
    { 
      title: "Report an Issue", 
      desc: "Submit maintenance, lab, classroom, or equipment problems quickly with image support.", 
      icon: Wrench, 
      route: "/create-ticket" // <-- Updated route to CreateTicket page
    },
    { title: "My Reports", desc: "Track ticket progress, check updates, and review submitted support requests.", icon: ClipboardList, route: "/my-reports" },
    { title: "Support Discussions", desc: "Explore common issues, featured updates, and useful support conversations.", icon: MessageSquareQuote, route: "/community-tickets" },
  ];

  return (
    <div className="support-homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div>
            <div className="sparkles-badge"><Sparkles /> Smart Campus Help Desk</div>
            <h1>Fast & Reliable <br /> Support for Campus Issues</h1>
            <p>Report classroom, lab, equipment, and facility issues instantly. Our support team helps students and staff resolve problems quickly with real-time tracking and smart updates.</p>

            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input">
                <Search />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by issue, building, room, or category" />
              </div>
              <button type="submit" className="search-button">Search</button>
            </form>
          </div>

          <div className="hero-side">
            <div className="hero-card">
              <ShieldCheck />
              <h3>Trusted Support</h3>
              <p>Secure issue reporting for students, staff, and administrators.</p>
            </div>
            <div className="hero-card">
              <Clock3 />
              <h3>Quick Resolution</h3>
              <p>Track issue lifecycle from submission to successful completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions-section">
        <h2>Quick Support Actions</h2>
        <p>Everything you need to report, monitor, and resolve campus maintenance issues in one place.</p>

        <div className="quick-actions">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div key={index} className="quick-action-card" onClick={() => navigate(action.route)}>
                <div style={{ width: '64px', height: '64px', marginBottom: '1.5rem', display: 'flex', alignItems:'center', justifyContent:'center', background:'#ebf8ff', borderRadius:'1rem' }}>
                  <Icon style={{ width: '32px', height: '32px', color: '#2563eb' }} />
                </div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
                <div className="cta">Explore <ArrowRight /></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bottom-cta">
        <h2>Need urgent technical support?</h2>
        <p>
          Instantly submit critical maintenance issues for labs, classroom systems,
          projectors, PCs, Wi-Fi, and campus facilities with priority handling.
        </p>
        <button
          onClick={() => navigate("/create-ticket")} // <-- Navigate to CreateTicket
          className="priority-ticket-btn"
        >
          Create Priority Ticket
        </button>
      </section>
    </div>
  );
}