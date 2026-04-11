import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="campus-footer pt-5 pb-4 mt-auto border-top">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <span className="ch-logo-icon">C</span>
              Campus Hub
            </h5>
            <p className="text-muted small pe-lg-4">
              Your centralized gateway to university services, event bookings, facility management, and support systems. Building a smarter campus experience.
            </p>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-semibold mb-3">Quick Links</h6>
            <ul className="list-unstyled footer-links small">
              <li><Link to="/home">Dashboard</Link></li>
              <li><Link to="/notifications">Announcements</Link></li>
              <li><Link to="/support">Help Center</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-semibold mb-3">Services</h6>
            <ul className="list-unstyled footer-links small">
              <li><a href="#booking">Booking</a></li>
              <li><a href="#facility">Facility</a></li>
              <li><a href="#tickets">Tickets</a></li>
            </ul>
          </div>
          <div className="col-lg-4 col-md-12">
            <h6 className="text-white fw-semibold mb-3">Stay Connected</h6>
            <p className="text-muted small">Join our campus newsletter for important updates.</p>
            <div className="input-group input-group-sm mb-3 footer-subscribe">
              <input type="email" className="form-control" placeholder="University email" />
              <button className="btn btn-primary px-3" type="button">Subscribe</button>
            </div>
            <div className="footer-socials mt-3 gap-2 d-flex">
              <div className="social-icon">IN</div>
              <div className="social-icon">X</div>
              <div className="social-icon">FB</div>
            </div>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12 border-top border-secondary pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <span className="text-muted small">© {new Date().getFullYear()} Campus Hub Operations. All rights reserved.</span>
            <div className="d-flex gap-3 mt-2 mt-md-0 small">
              <a href="#" className="text-muted text-decoration-none">Privacy</a>
              <a href="#" className="text-muted text-decoration-none">Terms</a>
              <a href="#" className="text-muted text-decoration-none">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
