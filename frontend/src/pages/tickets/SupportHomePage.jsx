import { useState, useEffect } from "react";
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
  Ticket,
  BarChart3,
  Users,
  ChevronRight,
  ChevronLeft,
  Building2,
  HeadphonesIcon,
  Zap,
  GraduationCap,
  Wifi,
  Monitor,
  Printer
} from "lucide-react";

export default function SupportHomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/featured?search=${encodeURIComponent(trimmed)}` : "/featured");
  };

  // Campus Support Slider Data with Background Images
  const slides = [
    {
      badge: "Campus IT Support",
      title: "Smart Campus Help Desk",
      desc: "Your centralized hub for all campus technology needs. From classroom equipment to dorm Wi-Fi, we provide fast, reliable support for students, faculty, and staff across all departments.",
      icon: GraduationCap,
      image: "https://sptel.com/wp-content/uploads/2024/03/4.-How-Can-Schools-Get-Started-with-Smart-Campuses_.jpg"
    },
    {
      badge: "24/7 Student Support",
      title: "Always Here When You Need Us",
      desc: "Round-the-clock technical assistance for residence halls, labs, and library systems. Our support team ensures uninterrupted access to campus resources and learning tools.",
      icon: HeadphonesIcon,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
    },
    {
      badge: "Smart Campus Analytics",
      title: "Data-Driven Campus Operations",
      desc: "Real-time tracking of campus maintenance requests, equipment status, and resolution metrics. We continuously improve our services based on student and faculty feedback.",
      icon: BarChart3,
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80"
    }
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const quickActions = [
    { 
      title: "Report an Issue", 
      desc: "Submit maintenance, lab, classroom, or equipment problems quickly. Attach photos and get automatic tracking from submission to resolution.", 
      icon: Ticket, 
      route: "/create-ticket"
    },
    { 
      title: "My Reports", 
      desc: "Track your ticket progress, check real-time updates, and review all submitted support requests across campus facilities and services.", 
      icon: ClipboardList, 
      route: "/my-reports" 
    },
    { 
      title: "Campus Discussions", 
      desc: "Explore common issues, featured updates, and useful support conversations shared by the campus community and support staff.", 
      icon: Users, 
      route: "/community-tickets" 
    },
  ];

  // Campus metrics for display
  const metrics = [
    { label: "Avg Resolution", value: "3.2h", icon: Clock3 },
    { label: "Satisfaction", value: "96.8%", icon: ShieldCheck },
    { label: "Active Tickets", value: "156", icon: Zap },
    { label: "Support Staff", value: "24", icon: Users }
  ];

  return (
    <div className="support-homepage">
      {/* Campus Slider Hero Section with Background Images */}
      <section className="hero-slider-section">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              {/* Background Image */}
              <div 
                className="slide-bg-image"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              {/* Dark Overlay for readability */}
              <div className="slide-overlay" />
              
              <div className="slide-content">
                <div className="slide-text">
                  <div className="enterprise-badge">
                    <slide.icon size={16} />
                    {slide.badge}
                  </div>
                  <h1>{slide.title}</h1>
                  <p>{slide.desc}</p>
                  
                  <form onSubmit={handleSearch} className="enterprise-search-form">
                    <div className="search-input-wrapper">
                      <Search size={20} />
                      <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="Search by issue, building, room, or category..." 
                      />
                    </div>
                    <button type="submit" className="search-btn">
                      Search
                    </button>
                  </form>
                </div>

                <div className="slide-metrics">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="metric-card">
                      <metric.icon size={24} />
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-label">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider Controls */}
          <button className="slider-btn prev" onClick={prevSlide}>
            <ChevronLeft size={24} />
          </button>
          <button className="slider-btn next" onClick={nextSlide}>
            <ChevronRight size={24} />
          </button>
          
          {/* Slider Indicators */}
          <div className="slider-indicators">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                className={`indicator ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section - Campus Styled */}
      <section className="quick-actions-section enterprise-section">
        <div className="section-header">
          <div className="section-badge">
            <Sparkles size={16} />
            Quick Actions
          </div>
          <h2>Campus Support Portal</h2>
          <p>Everything you need to report, monitor, and resolve campus maintenance and technology issues in one place.</p>
        </div>

        <div className="quick-actions enterprise-actions">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div 
                key={index} 
                className="quick-action-card enterprise-card" 
                onClick={() => navigate(action.route)}
              >
                <div className="card-icon-wrapper">
                  <Icon size={28} />
                </div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
                <div className="cta enterprise-cta">
                  Get Started <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service Categories - Campus Support Categories */}
      <section className="service-categories">
        <h2>Common Campus Issues</h2>
        <div className="categories-grid">
          {[
            { name: "Classroom Tech", desc: "Projectors, smart boards, AV systems, podium PCs", icon: Monitor },
            { name: "Lab Equipment", desc: "Computer labs, printers, scanners, lab software", icon: Printer },
            { name: "Network & Wi-Fi", desc: "Campus Wi-Fi, ethernet, VPN, network access", icon: Wifi },
            { name: "Facilities", desc: "Lighting, HVAC, furniture, locks, plumbing", icon: Wrench }
          ].map((cat, idx) => (
            <div key={idx} className="category-item" onClick={() => navigate("/create-ticket")}>
              <cat.icon size={20} />
              <div>
                <h4>{cat.name}</h4>
                <span>{cat.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section - ORIGINAL STYLING UNCHANGED */}
      <section className="bottom-cta">
        <h2>Need urgent technical support?</h2>
        <p>
          Instantly submit critical maintenance issues for labs, classroom systems,
          projectors, PCs, Wi-Fi, and campus facilities with priority handling.
        </p>
        <button
          onClick={() => navigate("/create-ticket")}
          className="priority-ticket-btn"
        >
          Create Priority Ticket
        </button>
      </section>
    </div>
  );
}