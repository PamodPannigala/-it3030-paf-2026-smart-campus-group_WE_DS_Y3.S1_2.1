import React from "react";
import { Calendar, Clock, CalendarCheck, HelpCircle, MapPin, GraduationCap } from "lucide-react"; // GraduationCap අලුතින් ගත්තා
import "./BookingCard.css"; 

const BookingCard_FU = ({ resource }) => {
  return (
    <div
      className="bg-white p-4 rounded-4 shadow-lg sticky-top booking-card"
      style={{ top: "100px", border: "1px solid #e2e8f0" }}
    >
      {/* --- අලුත් අලංකාර Header කොටස (Gradient සහ Icon සහිතව) --- */}
      <div className="d-flex align-items-center gap-3 mb-4">
        {/* Icon එක තියෙන ලස්සන රවුම */}
        <div 
          className="d-flex justify-content-center align-items-center rounded-circle" 
          style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)' }}
        >
          <GraduationCap size={26} style={{ color: '#4f46e5' }} />
        </div>
        
        <div>
          <span className="text-muted small fw-bold text-uppercase tracking-wider" style={{ fontSize: '0.7rem' }}>
            University Assets
          </span>
          {/* Gradient Text එක */}
          <h3 
            className="fw-bold mb-0" 
            style={{
              background: "linear-gradient(45deg, #2563eb, #9333ea)", // Blue සිට Purple දක්වා
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Resources
          </h3>
        </div>
      </div>

      <hr className="text-muted opacity-25 mb-4" />

      {/* --- Availability Information Display --- */}
      <div className="mb-4">
        
        {/* 1. Location */}
        <label className="form-label fw-bold text-muted small mb-1 text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
          Location
        </label>
        <div className="d-flex align-items-center p-3 mb-3 shadow-sm rounded-3 transition-all info-box-hover" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div className="bg-white p-2 rounded-circle shadow-sm me-3">
            <MapPin size={18} className="text-danger" />
          </div>
          <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
            {resource?.location || "Main Campus Area"}
          </span>
        </div>

        {/* 2. Available Days */}
        <label className="form-label fw-bold text-muted small mb-1 text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
          Available Days
        </label>
        <div className="d-flex align-items-center p-3 mb-3 shadow-sm rounded-3 transition-all info-box-hover" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div className="bg-white p-2 rounded-circle shadow-sm me-3">
            <Calendar size={18} className="text-primary" />
          </div>
          <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
            {resource?.availableDays || "Weekdays Only"} 
          </span>
        </div>

        {/* 3. Operating Hours */}
        <label className="form-label fw-bold text-muted small mb-1 text-uppercase tracking-wider" style={{ fontSize: '0.75rem' }}>
          Operating Hours
        </label>
        <div className="d-flex align-items-center p-3 mb-2 shadow-sm rounded-3 transition-all info-box-hover" style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div className="bg-white p-2 rounded-circle shadow-sm me-3">
            <Clock size={18} className="text-success" />
          </div>
          <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
            {resource?.openTime || "08:00 AM"} - {resource?.closeTime || "05:00 PM"}
          </span>
        </div>

      </div>

      {/* --- Action Buttons --- */}
      <div className="d-flex flex-column gap-3 mt-4">
        {/* 1. Reserve Button */}
        <button className="btn btn-primary-custom w-100 py-3 rounded-3 fw-bold d-flex justify-content-center align-items-center shadow-sm">
          <CalendarCheck size={20} className="me-2" /> Reserve Resource
        </button>

        {/* 2. Raise Ticket Button */}
        <button
          className="btn w-100 py-3 rounded-3 fw-bold d-flex justify-content-center align-items-center transition-all"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            color: "#475569",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.borderColor = "#94a3b8";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
        >
          <HelpCircle size={20} className="me-2 text-warning" /> Raise Issue Ticket
        </button>
      </div>

      <p className="text-center text-muted small mt-3 mb-0">
        Strictly for authorized university students
      </p>
    </div>
  );
};

export default BookingCard_FU;