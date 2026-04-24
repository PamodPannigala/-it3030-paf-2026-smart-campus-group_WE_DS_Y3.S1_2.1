import React from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Download } from "lucide-react";

// ── ADELINE UNIVERSITY BRANDING ──
const BRANDING = {
  orgName: "Adeline University",
  tagline: "Your Higher Education Partner",
  email: "info@adelineuniversity.org",
  phone: "+94 71 920 7688",
  website: "www.AdelineUniversity.org",
  address: "Colombo, Sri Lanka",
};

// Logo path — update to your actual logo location
// For Vite/public folder:   const logoImg = "/logo.png";
// For imported asset:       import logoImg from "../../assets/logo.png";
import logoImg from "../../assets/logo.png";

export default function TicketReportGenerator({ tickets }) {
  // Calculate summary statistics
  const getSummary = () => {
    const total = tickets.length;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const newTickets = tickets.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= last24h;
    }).length;

    // Most active category
    const categoryCounts = {};
    tickets.forEach((t) => {
      const cat = t.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const mostPopular =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "None";

    return { total, newTickets, mostPopular };
  };

  const summary = getSummary();

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
    try {
      const btn = document.getElementById("generate-ticket-report-btn");
      const originalText = btn?.innerText;
      if (btn) {
        btn.innerText = "Generating...";
        btn.disabled = true;
      }

      const pdf = new jsPDF("p", "mm", "a4");

      // ── TOP BAR ──
      pdf.setFillColor(25, 42, 86);
      pdf.rect(0, 0, 157.5, 8, "F");
      pdf.setFillColor(0, 0, 0);
      pdf.rect(157.5, 0, 52.5, 8, "F");

      // White spacing
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 8, 210, 5, "F");

      // ── LOGO ──
      try {
        const img = new Image();
        img.src = logoImg;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const logoDataURL = canvas.toDataURL("image/png");
        pdf.addImage(logoDataURL, "PNG", 15, 16, 16, 16);
      } catch (err) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(25, 42, 86);
        pdf.text("CampusHub", 15, 25);
      }

      // ── COMPANY NAME ──
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      pdf.text("Adeline University", 35, 23);

      // Tagline
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text("Your Higher Education Partner", 35, 27);

      // ── COMPANY INFO (right side) ──
      pdf.setFontSize(8);
      pdf.setTextColor(0);
      pdf.text("Email: info@adelineuniversity.org", 130, 17);
      pdf.text("Phone: +94 71 920 7688", 130, 21);
      pdf.text("Web: www.AdelineUniversity.org", 130, 25);
      pdf.text("Address: Colombo, Sri Lanka", 130, 29);

      // ── SEPARATOR ──
      pdf.setDrawColor(25, 42, 86);
      pdf.setLineWidth(1);
      pdf.line(20, 40, 190, 40);

      // ── TITLE ──
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0);
      pdf.text("Tickets Management Report", 20, 55);

      // ── DATE ──
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        20,
        63,
      );

      // ── SUMMARY (clean text, no cards) ──
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary", 20, 75);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Tickets: ${summary.total}`, 20, 85);
      pdf.text(`New Tickets (24h): ${summary.newTickets}`, 20, 92);
      pdf.text(`Most Active Category: ${summary.mostPopular}`, 20, 99);

      pdf.line(20, 105, 190, 105);

      // ── TABLE (6 columns: ID, Title, Reporter, Category, Status, Date) ──
      const tableColumn = ["ID", "Title", "Reporter", "Category", "Status", "Date"];
      const tableRows = tickets.map((t) => [
        `#${t.id}`,
        t.title || "—",
        t.reporterName || "—",
        t.category || "General",
        getStatusLabel(t.status),
        formatDate(t.createdAt),
      ]);

      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 110,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
          halign: "center",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [25, 42, 86],
          textColor: [255, 255, 255],
          fontSize: 10,
          cellPadding: 4,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50],
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { halign: "center" },   // ID
          1: { halign: "left" },     // Title (left align for readability)
          2: { halign: "center" },   // Reporter
          3: { halign: "center" },   // Category
          4: { halign: "center" },   // Status
          5: { halign: "center" },   // Date
        },
      });

      // ── FOOTER ──
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        const pageHeight = pdf.internal.pageSize.height;
        const footerY = pageHeight - 20;

        pdf.setDrawColor(25, 42, 86);
        pdf.line(20, footerY, 190, footerY);

        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text("Adeline University - Tickets Report", 20, footerY + 5);
        pdf.text(`Page ${i} of ${pageCount}`, 160, footerY + 5);
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()}`,
          20,
          footerY + 10,
        );
      }

      pdf.save(
        `CampusHub-Tickets-Report-${new Date().toISOString().split("T")[0]}.pdf`,
      );

      if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
      const btn = document.getElementById("generate-ticket-report-btn");
      if (btn) {
        btn.innerText = "Generate Report";
        btn.disabled = false;
      }
    }
  };

  return (
    <button
      id="generate-ticket-report-btn"
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
  );
}