import React, { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Download, FileText } from "lucide-react";

// CampusHub branding constants
const BRANDING = {
  orgName: "CampusHub",
  tagline: "Your Higher Education Partner",
  email: "info@campus_hub.org",
  phone: "+94719207688",
  website: "www.CampusHub.org",
  address: "Colombo, Sri Lanka",
};

const COLORS = {
  primary: "#1e3a5f",
  secondary: "#2563eb",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#f8fafc",
};

export default function TicketReportGenerator({ tickets }) {
  const reportRef = useRef(null);

  // Calculate summary statistics
  const getSummary = () => {
    const total = tickets.length;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newTickets = tickets.filter(t => {
      const created = new Date(t.createdAt);
      return created >= last24h;
    }).length;

    // Most active category
    const categoryCounts = {};
    tickets.forEach(t => {
      const cat = t.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const mostPopular = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

    return { total, newTickets, mostPopular };
  };

  const summary = getSummary();

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      const normalized = value.replace("T", " ").split(".")[0];
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "—";
    }
  };

  const formatDate = (value) => {
    if (!value) return "—";
    try {
      const normalized = value.replace("T", " ").split(".")[0];
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "—";
    }
  };

  const formatTime = (value) => {
    if (!value) return "—";
    try {
      const normalized = value.replace("T", " ").split(".")[0];
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "—";
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      OPEN: "Open",
      "IN PROGRESS": "In Progress",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
      CLOSED: "Closed",
      REJECTED: "Rejected",
    };
    return map[status] || status;
  };

  const generatePDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      // Show loading state
      const btn = document.getElementById("generate-report-btn");
      const originalText = btn?.innerText;
      if (btn) {
        btn.innerText = "Generating...";
        btn.disabled = true;
      }

      // Capture the report div as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      
      // A4 dimensions in points (1pt = 1/72 inch)
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with timestamp
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, "-");
      
      pdf.save(`CampusHub-Tickets-Report-${dateStr}.pdf`);

      // Reset button
      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
      const btn = document.getElementById("generate-report-btn");
      if (btn) {
        btn.innerText = "Generate Report";
        btn.disabled = false;
      }
    }
  };

  return (
    <>
      {/* Generate Report Button */}
      <button
        id="generate-report-btn"
        onClick={generatePDF}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 20px",
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgba(5, 150, 105, 0.2)",
          transition: "all 0.2s",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-1px)";
          e.target.style.boxShadow = "0 6px 8px -1px rgba(5, 150, 105, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 4px 6px -1px rgba(5, 150, 105, 0.2)";
        }}
      >
        <Download size={18} />
        Generate Report
      </button>

      {/* Hidden Report Template - This gets converted to PDF */}
      <div
        ref={reportRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "794px", // A4 width in pixels at 96 DPI
          background: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#0f172a",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
            color: "white",
            padding: "30px 40px",
            borderBottom: "4px solid #f59e0b",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  margin: "0 0 4px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                {BRANDING.orgName}
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  opacity: 0.9,
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                {BRANDING.tagline}
              </p>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "11px",
                lineHeight: "1.8",
                opacity: 0.9,
              }}
            >
              <div>📧 {BRANDING.email}</div>
              <div>📞 {BRANDING.phone}</div>
              <div>🌐 {BRANDING.website}</div>
              <div>📍 {BRANDING.address}</div>
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div style={{ padding: "30px 40px 20px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1e3a5f",
              margin: "0 0 8px 0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FileText size={24} color="#2563eb" />
            Tickets Management Report
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              margin: 0,
            }}
          >
            Generated on: {new Date().toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        {/* Summary Section */}
        <div
          style={{
            padding: "0 40px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { label: "Total Tickets", value: summary.total, color: "#2563eb" },
            { label: "New Tickets (24h)", value: summary.newTickets, color: "#059669" },
            { label: "Most Active Category", value: summary.mostPopular, color: "#d97706" },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: `${item.color}08`,
                border: `1px solid ${item.color}30`,
                borderRadius: "10px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: item.color,
                  marginBottom: "4px",
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div style={{ padding: "0 40px 30px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1e3a5f",
              margin: "0 0 16px 0",
              paddingBottom: "8px",
              borderBottom: "2px solid #e2e8f0",
            }}
          >
            Ticket Details
          </h3>

          {tickets.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#f8fafc",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "14px",
              }}
            >
              No tickets found in the system
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#1e3a5f",
                    color: "white",
                  }}
                >
                  {["ID", "Title", "Reporter", "Category", "Priority", "Status", "Date", "Time"].map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          padding: "12px 10px",
                          textAlign: "left",
                          fontWeight: "700",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: "2px solid #1e3a5f",
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      #{ticket.id}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.title || "—"}
                    </td>
                    <td style={{ padding: "10px" }}>{ticket.reporterName || "—"}</td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background: "#e0e7ff",
                          color: "#4338ca",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        {ticket.category || "General"}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background:
                            ticket.priority === "HIGH"
                              ? "#fef2f2"
                              : ticket.priority === "MEDIUM"
                              ? "#fffbeb"
                              : "#f1f5f9",
                          color:
                            ticket.priority === "HIGH"
                              ? "#dc2626"
                              : ticket.priority === "MEDIUM"
                              ? "#d97706"
                              : "#64748b",
                        }}
                      >
                        {ticket.priority || "Low"}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background:
                            ticket.status === "OPEN"
                              ? "#fef2f2"
                              : ticket.status === "RESOLVED"
                              ? "#ecfdf5"
                              : ticket.status === "CLOSED"
                              ? "#eff6ff"
                              : ticket.status === "REJECTED"
                              ? "#f5f3ff"
                              : "#fffbeb",
                          color:
                            ticket.status === "OPEN"
                              ? "#dc2626"
                              : ticket.status === "RESOLVED"
                              ? "#059669"
                              : ticket.status === "CLOSED"
                              ? "#2563eb"
                              : ticket.status === "REJECTED"
                              ? "#7c3aed"
                              : "#d97706",
                        }}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td style={{ padding: "10px" }}>{formatDate(ticket.createdAt)}</td>
                    <td style={{ padding: "10px" }}>{formatTime(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            color: "#94a3b8",
          }}
        >
          <div>
            <strong>{BRANDING.orgName}</strong> - Tickets Report
          </div>
          <div>
            Generated on {new Date().toLocaleDateString("en-US")} • Page 1 of 1
          </div>
        </div>
      </div>
    </>
  );
}