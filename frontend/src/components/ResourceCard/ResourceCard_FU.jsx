import React from "react";
import { MapPin, Users, ArrowRight } from "lucide-react";
import "./ResourceCard.css";

const ResourceCard = ({ item, onClick }) => {
  return (
    <div className="col">
      <div className="resource-card h-100 shadow-sm border-0">
        {/* පින්තූරය සහිත කොටස */}
        <div className="card-image-wrapper">
          <img
            src={
              item.imageUrl ||
              "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            }
            alt={item.name}
          />
          {/* Status Badge එක */}
          <span
            className={`status-badge shadow ${item.status === "ACTIVE" ? "bg-success text-white" : "bg-danger text-white"}`}
          >
            {item.status.replace("_", " ")}
          </span>
        </div>

        {/* විස්තර සහිත කොටස */}
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-primary fw-bold small text-uppercase tracking-wider">
              {item.type}
            </span>
            <div className="d-flex align-items-center text-muted small">
              <Users size={14} className="me-1" />
              <span>{item.capacity} Max</span>
            </div>
          </div>

          <h5 className="fw-bold mb-3 text-slate-900">{item.name}</h5>

          <div className="d-flex align-items-center text-muted mb-4 small">
            <MapPin size={16} className="text-danger me-2" />
            {item.location}
          </div>

          <button
            className="btn w-100 border-2 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 text-primary border-primary hover-bg-primary transition-all"
            style={{ fontSize: "0.9rem" }}
            onClick={onClick}
          >
            Explore Resource <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
