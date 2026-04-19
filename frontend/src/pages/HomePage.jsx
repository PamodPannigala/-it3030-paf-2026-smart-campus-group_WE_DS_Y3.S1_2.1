import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user, isStaff } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const servicesRef = useRef(null);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
      title: 'Smart Campus Ecosystem',
      subtitle: 'Revolutionizing university life with modern technology and seamless integrations'
    },
    {
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
      title: 'Unified Digital Environment',
      subtitle: 'Manage your time, events, and education from one secure portal'
    },
    {
      image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop",
      title: '24/7 Operations Support',
      subtitle: 'Connect with campus technicians and get immediate resolutions'
    }
  ];

  // Quality data for Smart Campus
  const qualityData = [
    { percentage: '99.9%', description: 'System Uptime Rating' },
    { percentage: '24/7', description: 'Facility Access Control' },
    { percentage: '12K+', description: 'Active Daily Users' },
    { percentage: '100%', description: 'Secure SSO Integration' },
    { percentage: '5min', description: 'Average Ticket Response' },
    { percentage: 'Zero', description: 'Paper Waste Generated' }
  ];

  // Service cards data
  const services = [
    {
      title: 'FACILITY BOOKING',
      description: 'Reserve study rooms, auditoriums, and labs instantly.',
      icon: '🏢',
      path: '#booking'
    },
    {
      title: 'EVENT TICKETS',
      description: 'Get passes for sports, seminars, and special campus events.',
      icon: '🎟️',
      path: '#tickets'
    },
    {
      title: 'NOTIFICATIONS',
      description: 'Campus-wide alerts, deadlines, and real-time announcements.',
      icon: '🔔',
      path: '/notifications'
    },
    {
      title: 'SUPPORT DESK',
      description: 'Report IT issues or operational faults directly to admins.',
      icon: '💬',
      path: '/support'
    },
    {
      title: 'ACCOUNT SETTINGS',
      description: 'Manage your profile, password, and communication preferences.',
      icon: '⚙️',
      path: '/settings'
    },
    {
      title: 'CAMPUS DIRECTORY',
      description: 'Find staff, departments, and services available on site.',
      icon: '📞',
      path: '#directory'
    }
  ];

  // Slideshow effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  const handleServiceClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    if (isStaff) {
      navigate('/admin', { replace: true });
    }
  }, [isStaff, navigate]);

  useEffect(() => {
    document.title = "Campus Hub | Home";
  }, []);

  if (isStaff) return null;

  return (
    <div className="home-container">

        {/* Slideshow */}
        <section className="slideshow-container">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay">
                <div className="slide-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slide indicators */}
          <div className="slide-indicators">
            {slides.map((_, index) => (
              <button
                type="button"
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* Hero Section */}
        <section id="home" className="hero animate-on-scroll" ref={heroRef}>
          <div className="hero-content">
            <h1>Transform Your Campus Experience</h1>
            <p>Join thousands of scholars and staff using our secure digital hub for facility management, rapid support, and seamless connectivity.</p>
            {!user ? (
               <button className="cta-button" onClick={() => navigate('/login')}>
                 Get Started Today
               </button>
            ) : (
               <button className="cta-button" onClick={() => navigate('/notifications')}>
                 View My Dashboard
               </button>
            )}
          </div>
        </section>

        {/* Quality Data Section */}
        <section className="quality-data animate-on-scroll" ref={statsRef}>
          <div className="home-inner-container">
            <h2>System Impact & Reliability</h2>
            <div className="data-grid">
              {qualityData.map((data, index) => (
                <div key={index} className="data-card">
                  <span className="percentage">{data.percentage}</span>
                  <span className="description">{data.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section id="services" className="grid-section animate-on-scroll" ref={servicesRef}
        style={{
          background: `linear-gradient(rgba(10,20,40,0.85), rgba(0,119,182,0.85)), url("https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop") no-repeat center center/cover`,
          backgroundAttachment: 'fixed'
          }}
          >
          <div className="home-inner-container">
            <div className="grid-header">
              <h2>Comprehensive Campus Services</h2>
              <p>Everything you need for successful operations in one place</p>
            </div>

            <div className="services-grid">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className="service-card"
                  onClick={() => handleServiceClick(service.path)}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="additional-section animate-on-scroll">
          <div className="home-inner-container">
            <div className="content-wrapper">
              <div className="left-side">
                <h2>Why Users Choose Campus Hub</h2>
                <p>
                  At Campus Hub, we're committed to revolutionizing operations through integrated technology.
                  Our platform combines live scheduling, intelligent alerting, and a centralized support queue 
                  to ensure students and staff are always in sync.
                </p>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="fs-5 me-3 text-primary">✔</span>
                    <span>24/7 Operations Support Desk</span>
                  </div>
                  <div className="feature-item">
                    <span className="fs-5 me-3 text-primary">✔</span>
                    <span>Real-Time Facility Booking</span>
                  </div>
                  <div className="feature-item">
                    <span className="fs-5 me-3 text-primary">✔</span>
                    <span>Role-based Security Integrations</span>
                  </div>
                  <div className="feature-item">
                    <span className="fs-5 me-3 text-primary">✔</span>
                    <span>Direct-to-Device Push Alerts</span>
                  </div>
                </div>
                <button 
                  className="learn-more-btn"
                  onClick={() => navigate('/services')}
                >
                  Explore All Modules
                </button>
              </div>
              <div className="right-side">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Modern Campus Technology"
                  className="feature-image"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section animate-on-scroll">
          <div className="home-inner-container">
            <div className="newsletter-content">
              <h2>Stay Connected with Campus Direct</h2>
              <p>Get the latest event announcements, policy updates, and critical alerts delivered to your inbox.</p>
              <div className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your university email address"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Subscribe</button>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Home;
