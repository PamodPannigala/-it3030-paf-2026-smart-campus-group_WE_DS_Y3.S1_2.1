import React from "react";
import { Users, Wifi, Monitor, ShieldCheck, Zap } from "lucide-react";
import "./InfoSection.css";

const InfoSection_FU = ({ resource }) => {
  return (
    <div
      className="p-4 p-md-5 rounded-4 shadow-sm"
      style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
    >
      {/* Description */}
      <div className="mb-5">
        <h4 className="fw-bold mb-3 text-dark">About this Space</h4>
        <p
          className="text-muted leading-relaxed"
          style={{ fontSize: "1.05rem", lineHeight: "1.8" }}
        >
          {resource.description}
        </p>
      </div>

      <hr className="text-muted opacity-25 mb-4" />

      {/* Amenities Grid */}
      <h4 className="fw-bold mb-4 text-dark">Premium Amenities</h4>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="mb-0 fw-bold text-dark">Capacity</p>
              <small className="text-muted">
                Up to {resource.capacity} individuals
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Wifi className="text-primary" size={24} />
            </div>
            <div>
              <p className="mb-0 fw-bold text-dark">Connectivity</p>
              <small className="text-muted">Gigabit Fiber WiFi</small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Monitor className="text-primary" size={24} />
            </div>
            <div>
              <p className="mb-0 fw-bold text-dark">Equipment</p>
              <small className="text-muted">4K Displays & Workstations</small>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Zap className="text-primary" size={24} />
            </div>
            <div>
              <p className="mb-0 fw-bold text-dark">Power</p>
              <small className="text-muted">Uninterrupted Power Supply</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection_FU;
