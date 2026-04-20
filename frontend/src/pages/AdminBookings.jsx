// src/pages/AdminBookings.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Eye, Calendar, Clock, User, FileText, Search, TrendingUp, Package, Calendar as CalendarIcon, ArrowUpRight, FileDown, Trash2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import Chart from 'react-apexcharts';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../assets/logo.png";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [dateFilter, setDateFilter] = useState("");
  const [checkedInFilter, setCheckedInFilter] = useState("ALL");

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/bookings/all");
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to approve this booking?")) {
      try {
        await axios.put(`http://localhost:8080/api/bookings/${bookingId}/approve`);
        fetchAllBookings();
        toast.success("Booking approved successfully!");
      } catch (err) {
        toast.error("Failed to approve booking");
      }
    }
  };

  const rejectBooking = async (bookingId) => {
    if (!rejectionReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/bookings/${bookingId}/reject`, {
        reason: rejectionReason
      });
      fetchAllBookings();
      setSelectedBooking(null);
      setRejectionReason("");
      toast.success("Booking rejected");
    } catch (err) {
      toast.error("Failed to reject booking");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "APPROVED": return <span className="badge bg-success">Approved</span>;
      case "REJECTED": return <span className="badge bg-danger">Rejected</span>;
      case "CANCELLED": return <span className="badge bg-secondary">Cancelled</span>;
      default: return <span className="badge bg-warning">Pending</span>;
    }
  };

     // ========== CHECKED-IN STATUS FUNCTION ==========
  const getCheckedInStatus = (booking) => {
    // Only show for APPROVED bookings
    if (booking.status !== "APPROVED") {
      return <span className="text-muted">—</span>;
    }
    
    // Check if already checked in
    if (booking.checkedIn) {
      return (
        <span className="badge bg-success" style={{ fontSize: '0.75rem' }}>
          <CheckCircle size={10} className="me-1" /> Checked In
        </span>
      );
    }
    
    // Check if booking date and time has passed
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`);
    const now = new Date();
    
    if (now > bookingDateTime) {
      return (
        <span className="badge bg-danger" style={{ fontSize: '0.75rem' }}>
          <XCircle size={10} className="me-1" /> Missed
        </span>
      );
    }
    
    // Upcoming booking
    return (
      <span className="badge bg-warning text-dark" style={{ fontSize: '0.75rem' }}>
        <Clock size={10} className="me-1" /> Pending
      </span>
    );
  };

  // ========== CHECKED-IN STATISTICS FOR CHART (MOVED OUTSIDE) ==========
  const checkedInStats = useMemo(() => {
    const approvedBookings = bookings.filter(b => b.status === "APPROVED");
    const checkedIn = approvedBookings.filter(b => b.checkedIn).length;
    const notCheckedIn = approvedBookings.filter(b => !b.checkedIn).length;
    const missed = approvedBookings.filter(b => {
      if (b.checkedIn) return false;
      const bookingDateTime = new Date(`${b.bookingDate}T${b.endTime}`);
      return new Date() > bookingDateTime;
    }).length;
    const pending = notCheckedIn - missed;
    
    return { checkedIn, pending, missed };
  }, [bookings]);

  // Calculate dashboard statistics
  const totalBookings = bookings.length;
  
  // Get most popular resource
  const mostPopularResource = useMemo(() => {
    const resourceCount = {};
    bookings.forEach(booking => {
      if (booking.resourceName) {
        resourceCount[booking.resourceName] = (resourceCount[booking.resourceName] || 0) + 1;
      }
    });
    return Object.keys(resourceCount).length > 0 
      ? Object.keys(resourceCount).reduce((a, b) => resourceCount[a] > resourceCount[b] ? a : b)
      : "None";
  }, [bookings]);

  // Get new bookings within last 24 hours
  const newBookingsCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return bookings.filter(b => new Date(b.createdAt).getTime() >= cutoff).length;
  }, [bookings]);

  // Booking Growth (last 7 days)
  const bookingGrowth = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: 0
      });
    }
    for (const b of bookings) {
      const t = new Date(b.createdAt);
      if (!isNaN(t.getTime())) {
        const key = `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
        const bucket = buckets.find(bkt => bkt.key === key);
        if (bucket) bucket.count += 1;
      }
    }
    return {
      categories: buckets.map(b => b.label),
      data: buckets.map(b => b.count),
    };
  }, [bookings]);

  // Status Distribution for Donut Chart
  const statusCounts = useMemo(() => {
    const counts = { 'PENDING': 0, 'APPROVED': 0, 'REJECTED': 0, 'CANCELLED': 0 };
    for (const b of bookings) {
      const s = b.status || 'PENDING';
      if (counts[s] != null) counts[s] += 1;
    }
    return counts;
  }, [bookings]);

  const statusList = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  const colorMap = {
    'PENDING': '#f59e0b',
    'APPROVED': '#22c55e',
    'REJECTED': '#ef4444',
    'CANCELLED': '#6b7280'
  };

  // Line Chart Component
  const LineChart = ({ categories = [], series = [], color = '#3b82f6' }) => (
    <Chart type='line' height={250} options={{
      chart: { toolbar: { show: false } },
      stroke: { width: 3, curve: 'smooth' },
      colors: [color],
      grid: { borderColor: '#f0f0f0' },
      xaxis: { categories, labels: { style: { colors: '#9ca3af' } } },
      yaxis: { labels: { style: { colors: '#9ca3af' } } },
      title: { text: 'Booking Trends (Last 7 Days)', style: { fontSize: '14px', fontWeight: '500', color: '#374151' } },
      legend: { show: false }
    }} series={[{ name: 'Bookings', data: series }]} />
  );

  // Donut Chart Component
  const DonutChart = ({ labels = [], series = [], colors = [] }) => (
    <Chart type='donut' height={260} options={{
      chart: { toolbar: { show: false } },
      labels,
      colors,
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: false },
      title: { text: 'Booking Status Distribution', style: { fontSize: '14px', fontWeight: '500', color: '#374151' } },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: true,
                label: 'Total',
                formatter: function(w) {
                  try {
                    const totals = w?.globals?.seriesTotals || [];
                    const total = totals.reduce((a, b) => a + Number(b || 0), 0);
                    return total.toLocaleString();
                  } catch (_) { return ''; }
                }
              }
            }
          }
        }
      }
    }} series={series} />
  );

    // ========== ADD THIS NEW DONUT CHART FOR CHECKED-IN STATUS ==========
  const CheckedInDonutChart = ({ labels = [], series = [], colors = [] }) => (
    <Chart type='donut' height={260} options={{
      chart: { toolbar: { show: false } },
      labels,
      colors,
      legend: { position: 'bottom', fontSize: '12px' },
      dataLabels: { enabled: false },
      title: { text: 'Check-in Status (Approved Bookings)', style: { fontSize: '14px', fontWeight: '500', color: '#374151' } },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: false },
              value: { show: false },
              total: {
                show: true,
                label: 'Total',
                formatter: function(w) {
                  try {
                    const totals = w?.globals?.seriesTotals || [];
                    const total = totals.reduce((a, b) => a + Number(b || 0), 0);
                    return total.toLocaleString();
                  } catch (_) { return ''; }
                }
              }
            }
          }
        }
      }
    }} series={series} />
  );

// PDF Download Function (Adapted for Bookings)
// PDF Download Function (Adapted for Bookings)
const downloadPDF = async () => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Top bar
    pdf.setFillColor(25, 42, 86);
    pdf.rect(0, 0, 157.5, 8, 'F');

    pdf.setFillColor(0, 0, 0);
    pdf.rect(157.5, 0, 52.5, 8, 'F');

    // White spacing
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 8, 210, 5, 'F');

    // ✅ LOGO (FIXED)
    try {
      const img = new Image();
      img.src = logoImg;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const logoDataURL = canvas.toDataURL('image/png');

      pdf.addImage(logoDataURL, 'PNG', 15, 16, 16, 16);
    } catch (err) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(25, 42, 86);
      pdf.text('CampusHub', 15, 25);
    }

    // ✅ Company Name Gradient (FIXED)
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('CampusHub', 35, 23);

    // Tagline
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text('Your Higher Education Partner', 35, 27);

    // Company Info
    pdf.setFontSize(8);
    pdf.setTextColor(0);
    pdf.text('Email: info@campus_hub.org', 130, 17);
    pdf.text('Phone: +94 71 920 7688', 130, 21);
    pdf.text('Web: www.CampusHub.org', 130, 25);
    pdf.text('Address: Colombo, Sri Lanka', 130, 29);

    // Separator
    pdf.setDrawColor(25, 42, 86);
    pdf.setLineWidth(1);
    pdf.line(20, 40, 190, 40);

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text('Bookings Management Report', 20, 55);

    // Date
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      20,
      63
    );

    // Summary
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Summary', 20, 75);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Bookings: ${totalBookings}`, 20, 85);
    pdf.text(`New Bookings (24h): ${newBookingsCount}`, 20, 92);
    pdf.text(`Most Popular Resource: ${mostPopularResource}`, 20, 99);

    pdf.line(20, 105, 190, 105);

    // Table
    const tableColumn = ["ID", "Resource", "User", "Date", "Time", "Purpose", "Status"];
    const tableRows = filteredBookings.map(b => [
      `#${b.id}`,
      b.resourceName || `Resource ${b.resourceId}`,
      b.userEmail || `User ${b.userId}`,
      b.bookingDate,
      `${b.startTime} - ${b.endTime}`,
      b.purpose?.substring(0, 40) || '',
      b.status
    ]);

    autoTable(pdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'striped',

      styles: {
        fontSize: 10,
        cellPadding: 4,   // ⬅️ increases row height
        valign: 'middle'
      },

      headStyles: {
        fillColor: [25, 42, 86],
        textColor: [255, 255, 255],
        fontSize: 10,
        cellPadding: 5,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 20, right: 20 }
    });

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      const pageHeight = pdf.internal.pageSize.height;
      const footerY = pageHeight - 20;

      pdf.setDrawColor(25, 42, 86);
      pdf.line(20, footerY, 190, footerY);

      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text('CampusHub - Bookings Report', 20, footerY + 5);
      pdf.text(`Page ${i} of ${pageCount}`, 160, footerY + 5);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, footerY + 10);
    }

    pdf.save(`CampusHub-Bookings-Report-${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};
    // Apply status filter
  const statusFilteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  // Apply date filter
  const dateFilteredBookings = dateFilter === ""
    ? statusFilteredBookings
    : statusFilteredBookings.filter(b => b.bookingDate === dateFilter);

  // Apply checked-in status filter (only for APPROVED bookings)
  const checkedInFilteredBookings = checkedInFilter === "ALL" 
    ? dateFilteredBookings
    : dateFilteredBookings.filter(b => {
        if (b.status !== "APPROVED") return checkedInFilter === "NOT_CHECKED_IN";
        if (checkedInFilter === "CHECKED_IN") return b.checkedIn === true;
        if (checkedInFilter === "NOT_CHECKED_IN") return b.checkedIn === false;
        if (checkedInFilter === "MISSED") {
          const bookingDateTime = new Date(`${b.bookingDate}T${b.endTime}`);
          return !b.checkedIn && new Date() > bookingDateTime;
        }
        if (checkedInFilter === "PENDING") {
          const bookingDateTime = new Date(`${b.bookingDate}T${b.endTime}`);
          return !b.checkedIn && new Date() <= bookingDateTime;
        }
        return true;
      });

  // Apply search filter (by resource name)
  const filteredBookings = searchTerm.trim() === ""
    ? checkedInFilteredBookings
    : checkedInFilteredBookings.filter(booking => 
        booking.resourceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
      <div className="container py-4">
        <Toaster 
        position="top-center"  // Options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 3000,  // 3 seconds
          style: {
            background: '#3b82f6',  // Blue color
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#fff',
              secondary: '#3b82f6'
            }
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444'
            }
          }
        }}
      />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: '#1a1a2e', fontWeight: '600' }}>Manage Bookings (Admin)</h2>
        <div className="d-flex gap-2">
          <button 
            onClick={() => window.location.href = '/admin/checkin'} 
            className="btn btn-info px-4 py-2 rounded-pill"
            style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e3a8a', borderColor: '#1e3a8a', color: '#ffffff' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="3" x2="9" y2="9"></line>
              <line x1="15" y1="3" x2="15" y2="9"></line>
              <line x1="9" y1="15" x2="9" y2="21"></line>
              <line x1="15" y1="15" x2="15" y2="21"></line>
            </svg>
            QR Check-in
          </button>
          <button 
            onClick={downloadPDF} 
            className="btn btn-dark px-4 py-2 rounded-pill"
            style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileDown size={18} /> Export PDF
          </button>
        </div>
      </div>
      
      {/* Rest of your JSX remains exactly the same */}
      {/* Modern Dashboard Cards - 3 cards with white background */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100" style={{ 
            border: 'none', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
          }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.5px' }}>TOTAL BOOKINGS</p>
                  <h2 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a1a2e' }}>{totalBookings}</h2>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge" style={{ backgroundColor: '#e8f0fe', color: '#4f46e5', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
                      All time bookings
                    </span>
                  </div>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ 
                  width: '52px', 
                  height: '52px', 
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
                }}>
                  <Package size={26} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100" style={{ 
            border: 'none', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
          }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.5px' }}>NEW BOOKINGS</p>
                  <h2 className="mb-2" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a1a2e' }}>
                    {newBookingsCount} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#10b981' }}>last 24h</span>
                  </h2>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
                      <TrendingUp size={12} className="me-1" /> Rolling 24 hours
                    </span>
                  </div>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ 
                  width: '52px', 
                  height: '52px', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}>
                  <TrendingUp size={26} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100" style={{ 
            border: 'none', 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)'
          }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.5px' }}>MOST POPULAR</p>
                  <h5 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a2e' }}>
                    {mostPopularResource}
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge" style={{ backgroundColor: '#fff7ed', color: '#f97316', padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
                      Most booked resource
                    </span>
                  </div>
                </div>
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ 
                  width: '52px', 
                  height: '52px', 
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
                }}>
                  <CalendarIcon size={26} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
            {/* Search and Filter Bar */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            {/* Search Bar */}
            <div className="input-group" style={{ width: "250px", boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px' }}>
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                style={{ borderRadius: '0 12px 12px 0', borderColor: '#dee2e6' }}
                placeholder="Search by resource name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <input
              type="date"
              className="form-control"
              style={{ width: "180px", borderRadius: '12px', borderColor: '#dee2e6' }}
              placeholder="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />

            {/* Checked-in Status Filter */}
            <select
              className="form-select"
              style={{ width: "200px", borderRadius: '12px', borderColor: '#dee2e6' }}
              value={checkedInFilter}
              onChange={(e) => setCheckedInFilter(e.target.value)}
            >
              <option value="ALL">All Check-in Status</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="PENDING">Pending Check-in</option>
              <option value="MISSED">Missed</option>
            </select>

            {/* Status Filter Buttons */}
            <div className="btn-group flex-wrap gap-2">
              <button className={`btn ${filter === "ALL" ? "btn-primary" : "btn-outline-primary"}`} style={{ borderRadius: '10px', fontWeight: '500' }} onClick={() => setFilter("ALL")}>
                All ({bookings.length})
              </button>
              <button className={`btn ${filter === "PENDING" ? "btn-warning" : "btn-outline-warning"}`} style={{ borderRadius: '10px', fontWeight: '500' }} onClick={() => setFilter("PENDING")}>
                Pending ({statusCounts.PENDING})
              </button>
              <button className={`btn ${filter === "APPROVED" ? "btn-success" : "btn-outline-success"}`} style={{ borderRadius: '10px', fontWeight: '500' }} onClick={() => setFilter("APPROVED")}>
                Approved ({statusCounts.APPROVED})
              </button>
              <button className={`btn ${filter === "REJECTED" ? "btn-danger" : "btn-outline-danger"}`} style={{ borderRadius: '10px', fontWeight: '500' }} onClick={() => setFilter("REJECTED")}>
                Rejected ({statusCounts.REJECTED})
              </button>
              <button className={`btn ${filter === "CANCELLED" ? "btn-secondary" : "btn-outline-secondary"}`} style={{ borderRadius: '10px', fontWeight: '500' }} onClick={() => setFilter("CANCELLED")}>
                Cancelled ({statusCounts.CANCELLED})
              </button>
            </div>
          </div>
        </div>
      </div>

      {searchTerm && (
        <div className="mb-3">
          <small className="text-muted">
            Found {filteredBookings.length} booking(s) matching "{searchTerm}"
          </small>
        </div>
      )}

      {/* Scrollable Table View */}
      <div className="table-responsive" style={{ maxHeight: "450px", overflowY: "auto", borderRadius: '16px' }}>
        <table className="table table-hover table-bordered text-center align-middle" style={{ backgroundColor: '#ffffff', borderRadius: '16px' }}>
          <thead className="sticky-top" style={{ backgroundColor: '#1e3a8a' }}>
            <tr>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>ID</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Resource Image</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Resource Name</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>User</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Date</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Time</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Purpose</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Status</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Checked-in</th>
              <th style={{ position: "sticky", top: 0, backgroundColor: "#1e3a8a", padding: '14px 12px', fontWeight: '600', color: '#ffffff', textAlign: "center", verticalAlign: "middle" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="text-muted">
                    <Search size={40} className="mb-2 opacity-50" />
                    <p>No bookings found</p>
                    {searchTerm && <small>Try a different search term</small>}
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>#{booking.id}</td>
                  <td style={{ width: "80px", padding: '12px' }}>
                    {booking.resourceImage ? (
                      <img 
                        src={booking.resourceImage} 
                        alt={booking.resourceName}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "10px" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/50x50?text=No+Image";
                        }}
                      />
                    ) : (
                      <div style={{ width: "50px", height: "50px", backgroundColor: "#f3f4f6", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="text-muted small">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold" style={{ padding: '12px', verticalAlign: 'middle' }}>{booking.resourceName || `Resource #${booking.resourceId}`}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>{booking.userEmail || `User ${booking.userId}`}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>{booking.bookingDate}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>{booking.startTime} - {booking.endTime}</td>
                  <td style={{ maxWidth: "200px", padding: '12px', verticalAlign: 'middle' }}>
                    <div className="text-truncate" title={booking.purpose}>
                      {booking.purpose?.substring(0, 50)}{booking.purpose?.length > 50 ? "..." : ""}
                    </div>
                  </td>
                                    <td style={{ padding: '12px', verticalAlign: 'middle' }}>{getStatusBadge(booking.status)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>{getCheckedInStatus(booking)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-sm btn-outline-info" 
                        onClick={() => setViewModal(booking)}
                        title="View Details"
                        style={{ borderRadius: '8px' }}
                      >
                        <Eye size={14} />
                      </button>
                      
                      {booking.status === "PENDING" && (
                        <>
                          <button 
                            className="btn btn-sm btn-outline-success" 
                            onClick={() => approveBooking(booking.id)}
                            title="Approve"
                            style={{ borderRadius: '8px' }}
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => setSelectedBooking(booking)}
                            title="Reject"
                            style={{ borderRadius: '8px' }}
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      
                      {booking.status === "APPROVED" && (
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => setSelectedBooking(booking)}
                          title="Reject"
                          style={{ borderRadius: '8px' }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      
                      {booking.status === "REJECTED" && (
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => approveBooking(booking.id)}
                          title="Approve"
                          style={{ borderRadius: '8px' }}
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}

                      <button 
                        className="btn btn-sm btn-outline-dark" 
                        onClick={() => {
                          if (window.confirm("Are you sure you want to permanently delete this booking?")) {
                            axios.delete(`http://localhost:8080/api/bookings/${booking.id}`)
                              .then(() => {
                                toast.success("Booking deleted successfully");
                                fetchAllBookings();
                              })
                              .catch(err => toast.error("Failed to delete booking"));
                          }
                        }}
                        title="Delete Permanently"
                        style={{ borderRadius: '8px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

            {/* Charts Section - Below the table */}
      <div className="row mt-4">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm" style={{ border: 'none', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <LineChart 
                categories={bookingGrowth.categories} 
                series={bookingGrowth.data} 
                color="#4f46e5" 
              />
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm" style={{ border: 'none', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <DonutChart 
                labels={statusList.map(s => s.charAt(0) + s.slice(1).toLowerCase())}
                series={statusList.map(s => statusCounts[s])}
                colors={statusList.map(s => colorMap[s])}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm" style={{ border: 'none', borderRadius: '16px' }}>
            <div className="card-body p-4">
              <CheckedInDonutChart 
                labels={['Checked In', 'Pending', 'Missed']}
                series={[checkedInStats.checkedIn, checkedInStats.pending, checkedInStats.missed]}
                colors={['#22c55e', '#f59e0b', '#ef4444']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: '20px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title">Booking Details #{viewModal.id}</h5>
                <button type="button" className="btn-close" onClick={() => setViewModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {viewModal.resourceImage && (
                    <div className="col-md-4">
                      <img 
                        src={viewModal.resourceImage} 
                        alt={viewModal.resourceName}
                        className="img-fluid rounded"
                        style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: '12px' }}
                      />
                    </div>
                  )}
                  <div className={viewModal.resourceImage ? "col-md-8" : "col-md-12"}>
                    <h6 style={{ color: '#1a1a2e', fontWeight: '600' }}>{viewModal.resourceName}</h6>
                    <p><strong>Resource ID:</strong> {viewModal.resourceId}</p>
                    <p><strong>User:</strong> {viewModal.userEmail || `User ${viewModal.userId}`}</p>
                    <p><strong>Date:</strong> {viewModal.bookingDate}</p>
                    <p><strong>Time:</strong> {viewModal.startTime} - {viewModal.endTime}</p>
                    <p><strong>Purpose:</strong> {viewModal.purpose}</p>
                    {viewModal.expectedAttendees > 0 && (
                      <p><strong>Expected Attendees:</strong> {viewModal.expectedAttendees}</p>
                    )}
                    {viewModal.specialRequests && (
                      <p><strong>Special Requests:</strong> {viewModal.specialRequests}</p>
                    )}
                    <p><strong>Status:</strong> {viewModal.status}</p>
                    {viewModal.rejectionReason && (
                      <p><strong>Rejection Reason:</strong> {viewModal.rejectionReason}</p>
                    )}
                    <p><strong>Created:</strong> {new Date(viewModal.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0' }}>
                <button className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ borderRadius: '20px' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title">Reject Booking #{selectedBooking.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <div className="modal-body">
                {selectedBooking.resourceImage && (
                  <img 
                    src={selectedBooking.resourceImage} 
                    alt={selectedBooking.resourceName}
                    className="img-fluid rounded mb-3"
                    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: '12px' }}
                  />
                )}
                <p><strong>Resource:</strong> {selectedBooking.resourceName}</p>
                <p><strong>User:</strong> {selectedBooking.userEmail || `User ${selectedBooking.userId}`}</p>
                <p><strong>Date:</strong> {selectedBooking.bookingDate}</p>
                <p><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
                <div className="mb-3">
                  <label className="form-label">Reason for rejection:</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this booking..."
                    style={{ borderRadius: '12px' }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => rejectBooking(selectedBooking.id)}>Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;