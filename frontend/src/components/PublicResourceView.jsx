import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PublicResourceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://10.155.14.36:8082";

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/resources/${id}`)
      .then((res) => {
        setResource(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend Error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#FAF8FF" }}
      >
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  if (!resource)
    return (
      <div className="text-center mt-5 py-5 h4" style={{ color: "#131B2E" }}>
        Resource Not Found
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#FAF8FF",
        minHeight: "100vh",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div className="container py-4" style={{ maxWidth: "1050px" }}>
        {/* Header Section */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="badge border-0"
              style={{
                backgroundColor: "#F2F3FF",
                color: "#515F74",
                fontSize: "12px",
                fontWeight: "500",
                padding: "5px 10px",
              }}
            >
              {resource.type}
            </span>
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: "#006B3F",
                color: "#FFFFFF",
                fontSize: "11px",
                padding: "5px 10px",
              }}
            >
              ● {resource.status}
            </span>
          </div>
          <h1
            style={{
              color: "#131B2E",
              fontSize: "36px",
              fontWeight: "700",
              letterSpacing: "-0.8px",
            }}
          >
            {resource.name}
          </h1>
          <p style={{ color: "#515F74", fontSize: "14px" }}>
            Serial: {resource.serial || "PH-9902-XJ"}
          </p>
        </div>

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            {/* Feature Image Card - Updated Section */}
            <div
              className="card border-0 shadow-sm mb-4 overflow-hidden"
              style={{
                backgroundColor: "#131B2E",
                borderRadius: "8px",
                height: "280px",
                width: "100%",
              }}
            >
              <div className="h-100 w-100 p-0 position-relative">
                <img
                  src={
                    resource.imageUrl ||
                    "https://via.placeholder.com/500x300?text=Resource+Image"
                  }
                  alt={resource.name}
                  className="w-100 h-100"
                  style={{
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  className="position-absolute bottom-0 start-0 w-100 p-4 text-white"
                  style={{
                    background:
                      "linear-gradient(transparent, rgba(19, 27, 46, 0.85))",
                  }}
                >
                  <p className="mb-0 opacity-75" style={{ fontSize: "12px" }}>
                    Model Alpha-V4
                  </p>
                  <h4 style={{ fontSize: "20px", fontWeight: "500" }}>
                    4K Ultra HD Cinema Grade
                  </h4>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="row g-3 mb-4">
              {[
                { label: "LOCATION", val: resource.location, icon: "📍" },
                {
                  label: "CAPACITY",
                  val: `${resource.capacity} Students`,
                  icon: "👥",
                },
                {
                  label: "AVAILABILITY",
                  val: `${resource.openTime} - ${resource.closeTime}`,
                  icon: "🕒",
                },
                { label: "TYPE", val: resource.type, icon: "📦" },
              ].map((item, idx) => (
                <div className="col-6 col-md-3" key={idx}>
                  <div
                    className="card h-100 border-0 shadow-sm p-3"
                    style={{ backgroundColor: "#FFFFFF", borderRadius: "8px" }}
                  >
                    <div className="mb-2" style={{ fontSize: "18px" }}>
                      {item.icon}
                    </div>
                    <small
                      style={{
                        color: "#515F74",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {item.label}
                    </small>
                    <span
                      style={{
                        color: "#131B2E",
                        fontSize: "15px",
                        fontWeight: "500",
                        display: "block",
                      }}
                    >
                      {item.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Description Card */}
            <div
              className="card border-0 shadow-sm p-4 mb-4"
              style={{ backgroundColor: "#FFFFFF", borderRadius: "8px" }}
            >
              <h5
                style={{
                  color: "#003461",
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                Resource Features
              </h5>
              <p
                style={{
                  color: "#131B2E",
                  fontSize: "15px",
                  lineHeight: "1.5",
                }}
              >
                The {resource.name} provides professional-grade visual clarity.
                {resource.description ||
                  " A versatile, high-quality resource available within , designed to support and enhance your academic and professional activities."}
              </p>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {[
                  "4K Ultra HD",
                  "Wireless Connectivity",
                  "5000 Lumens",
                  "Dual HDMI",
                ].map((f) => (
                  <span
                    key={f}
                    className="badge"
                    style={{
                      backgroundColor: "#F2F3FF",
                      color: "#515F74",
                      padding: "7px 10px",
                      fontSize: "12px",
                      fontWeight: "400",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-4">
            <div
              className="card border-0 shadow-sm p-4 sticky-top"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                top: "20px",
              }}
            >
              <div className="d-grid gap-3 mb-4">
                <button
                  className="btn py-3 border-0 text-white fw-bold shadow-sm"
                  style={{
                    backgroundColor: "#004B87",
                    fontSize: "15px",
                    borderRadius: "8px",
                  }}
                >
                  Book This Resource
                </button>
                <button
                  className="btn py-3 border-0 fw-bold"
                  style={{
                    backgroundColor: "#F2F3FF",
                    color: "#004B87",
                    fontSize: "15px",
                    borderRadius: "8px",
                  }}
                >
                  Report a Technical Issue
                </button>
              </div>

              {/* Map Section */}
              <div className="mb-4">
                <p
                  style={{
                    color: "#515F74",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "12px",
                  }}
                >
                  LOCATION MAP
                </p>
                <div
                  className="rounded-3 overflow-hidden bg-light border p-4 text-center"
                  style={{ minHeight: "140px" }}
                >
                  <div className="fs-3">📍</div>
                  <p className="mt-2 text-muted small">
                    Interactive Floor Plan View
                  </p>
                </div>
                <div
                  className="d-flex gap-2 mt-3"
                  style={{ fontSize: "13px", color: "#515F74" }}
                >
                  <span>
                    ℹ️ {resource.location} is located on the North Mezzanine
                    floor.
                  </span>
                </div>
              </div>

              {/* Admin Area */}
              <div className="pt-3 border-top">
                <p
                  style={{
                    color: "#515F74",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "12px",
                  }}
                >
                  ADMIN CONTROLS
                </p>
                <button
                  onClick={() => navigate(`/admin/inventory?editId=${id}`)}
                  className="btn btn-light w-100 py-2 border-0"
                  style={{
                    backgroundColor: "#F2F3FF",
                    color: "#515F74",
                    fontSize: "13px",
                    fontWeight: "500",
                    borderRadius: "8px",
                  }}
                >
                  Edit Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicResourceView;
