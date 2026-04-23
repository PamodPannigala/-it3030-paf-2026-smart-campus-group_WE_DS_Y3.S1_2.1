// src/pages/MyBookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  AlertCircle,
  Image as ImageIcon,
  Download,
  QrCode,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../styles/MyBookings.css";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getResourceImageOrCatalogueFallback } from "../utils/resourceImageFallback";

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkedInFilter, setCheckedInFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      fetchMyBookings();
    }
  }, [authLoading, user]);

  const fetchMyBookings = async () => {
    if (!user?.id) {
      setBookings([]);
      setLoading(false);
      setError("Please sign in to view your bookings.");
      return;
    }

    try {
      const response = await api.get("/bookings/my");
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Check if booking is expired (date and time passed)
  const isBookingExpired = (booking) => {
    const bookingDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`);
    const now = new Date();
    return now > bookingDateTime;
  };

  // Filter Logic with Checked-in Status
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Filter by booking status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by checked-in status (only for APPROVED bookings)
    if (checkedInFilter !== "ALL") {
      filtered = filtered.filter(booking => {
        if (booking.status !== "APPROVED") return false;
        if (checkedInFilter === "CHECKED_IN") return booking.checkedIn === true;
        if (checkedInFilter === "NOT_CHECKED_IN") return booking.checkedIn === false;
        if (checkedInFilter === "MISSED") {
          const bookingDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`);
          return !booking.checkedIn && new Date() > bookingDateTime;
        }
        if (checkedInFilter === "PENDING") {
          const bookingDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`);
          return !booking.checkedIn && new Date() <= bookingDateTime;
        }
        return true;
      });
    }
    
    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.bookingDate === dateFilter);
    }
    
    // Filter by resource name search
    if (searchTerm.trim()) {
      filtered = filtered.filter(booking => 
        booking.resourceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  const filteredBookings = getFilteredBookings();

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="badge bg-success">
            <CheckCircle size={12} className="me-1" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="badge bg-danger">
            <XCircle size={12} className="me-1" /> Rejected
          </span>
        );
      case "CANCELLED":
        return <span className="badge bg-secondary">Cancelled</span>;
      default:
        return (
          <span className="badge bg-warning">
            <PendingIcon size={12} className="me-1" /> Pending
          </span>
        );
    }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      try {
        await axios.put(`http://localhost:8082/api/bookings/${bookingId}/cancel`);
        toast.success("Booking cancelled successfully!");
        fetchMyBookings();
        setShowModal(false);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to cancel booking");
      }
    }
  };

  const downloadQRCode = async (bookingId, resourceName) => {
    try {
      const response = await axios.get(`http://localhost:8082/api/bookings/${bookingId}/qrcode`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR_Code_${resourceName}_${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("QR Code downloaded successfully!");
    } catch (err) {
      console.error("Failed to download QR code:", err);
      toast.error("Failed to download QR code");
    }
  };

  const toggleQRCode = (bookingId) => {
    setShowQRCode((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <AlertCircle size={60} className="text-danger mb-3" />
        <h3>Oops! Something went wrong.</h3>
        <p className="text-muted">{error}</p>
        <button onClick={fetchMyBookings} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#3b82f6",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            duration: 3000,
            iconTheme: { primary: "#fff", secondary: "#3b82f6" },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: "#fff", secondary: "#ef4444" },
          },
        }}
      />

      {/* Filter Bar */}
      <div className="filter-bar-container mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          {/* Search Input */}
          <div className="input-group" style={{ width: "250px" }}>
            <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', borderColor: '#3b82f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              style={{ borderRadius: '0 12px 12px 0', borderColor: '#3b82f6', borderLeft: 'none' }}
              placeholder="Search by resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <input
            type="date"
            className="form-control"
            style={{ width: "160px", borderRadius: '12px', borderColor: '#3b82f6' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          {/* Status Filter Dropdown */}
          <select
            className="form-select"
            style={{ width: "150px", borderRadius: '12px', borderColor: '#3b82f6' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Checked-in Status Filter Dropdown */}
          <select
            className="form-select"
            style={{ width: "180px", borderRadius: '12px', borderColor: '#3b82f6' }}
            value={checkedInFilter}
            onChange={(e) => setCheckedInFilter(e.target.value)}
          >
            <option value="ALL">All Check-in Status</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="PENDING">Pending Check-in</option>
            <option value="MISSED">Missed</option>
            <option value="NOT_CHECKED_IN">Not Checked In</option>
          </select>

          {/* Clear Filters Button */}
          {(statusFilter !== "ALL" || checkedInFilter !== "ALL" || dateFilter || searchTerm) && (
            <button
              className="btn btn-outline-primary"
              style={{ borderRadius: '12px', borderColor: '#3b82f6', color: '#3b82f6' }}
              onClick={() => {
                setStatusFilter("ALL");
                setCheckedInFilter("ALL");
                setDateFilter("");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Results Summary */}
        {(searchTerm || dateFilter || statusFilter !== "ALL" || checkedInFilter !== "ALL") && (
          <div className="mt-2">
            <small className="text-muted">
              Found {filteredBookings.length} booking(s)
            </small>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Bookings</h2>
        <button onClick={() => navigate("/catalogue")} className="btn btn-outline-primary">
          + New Booking
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-5">
          <Calendar size={60} className="text-muted mb-3" />
          <h4>No bookings found</h4>
          <p className="text-muted">
            {(searchTerm || dateFilter || statusFilter !== "ALL" || checkedInFilter !== "ALL") 
              ? "No bookings match your filters. Try clearing the filters." 
              : "You haven't made any bookings yet."}
          </p>
          {(searchTerm || dateFilter || statusFilter !== "ALL" || checkedInFilter !== "ALL") ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
                setStatusFilter("ALL");
                setCheckedInFilter("ALL");
              }}
              className="btn btn-outline-secondary mt-2"
            >
              Clear Filters
            </button>
          ) : (
            <button onClick={() => navigate("/catalogue")} className="btn btn-primary mt-2">
              Browse Resources
            </button>
          )}
        </div>
      ) : (
        <div className="row">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="col-md-6 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm booking-card-hover">
                <img
                  src={getResourceImageOrCatalogueFallback(
                    booking.resourceImage,
                    booking.resourceId,
                  )}
                  alt={booking.resourceName}
                  className="card-img-top"
                  style={{
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px 8px 0 0",
                  }}
                  onError={(e) => {
                    e.target.src = getResourceImageOrCatalogueFallback(
                      "",
                      booking.resourceId,
                    );
                  }}
                />
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0 fw-bold">
                      {booking.resourceName || `Resource #${booking.resourceId}`}
                    </h6>
                    {getStatusBadge(booking.status)}
                  </div>

                  <hr className="my-2" />

                  <div className="mb-1">
                    <Calendar size={12} className="text-muted me-1" />
                    <small className="text-muted">Date:</small>
                    <div className="fw-semibold small">{booking.bookingDate}</div>
                  </div>

                  <div className="mb-2">
                    <Clock size={12} className="text-muted me-1" />
                    <small className="text-muted">Time:</small>
                    <div className="fw-semibold small">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </div>

                  {/* View More Button */}
                  <button
                    onClick={() => openModal(booking)}
                    className="btn btn-outline-primary btn-sm w-100 mt-2"
                  >
                    View more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal/Popup Window */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedBooking.resourceName || `Resource #${selectedBooking.resourceId}`}
              </h5>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold">Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              <hr />

              <div className="mb-3">
                <span className="fw-bold">Date:</span>
                <div>{selectedBooking.bookingDate}</div>
              </div>

              <div className="mb-3">
                <span className="fw-bold">Time:</span>
                <div>{selectedBooking.startTime} - {selectedBooking.endTime}</div>
              </div>

              <div className="mb-3">
                <span className="fw-bold">Purpose:</span>
                <div>{selectedBooking.purpose || "Not specified"}</div>
              </div>

              {selectedBooking.expectedAttendees > 0 && (
                <div className="mb-3">
                  <span className="fw-bold">Expected Attendees:</span>
                  <div>{selectedBooking.expectedAttendees}</div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="mb-3">
                  <span className="fw-bold">Special Requests:</span>
                  <div className="text-muted">{selectedBooking.specialRequests}</div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedBooking.rejectionReason && selectedBooking.status === "REJECTED" && (
                <div className="mb-3">
                  <span className="fw-bold text-danger">Rejection Reason:</span>
                  <div className="text-danger">{selectedBooking.rejectionReason}</div>
                </div>
              )}

              {/* Checked-in Status within Modal */}
              {selectedBooking.status === "APPROVED" && (
                <div className="mb-3">
                  <span className="fw-bold">Check-in Status:</span>
                  <div className="mt-1">
                    {selectedBooking.checkedIn ? (
                      <span className="badge bg-success">
                        <CheckCircle size={12} className="me-1" /> Checked In on {new Date(selectedBooking.checkedInAt).toLocaleString()}
                      </span>
                    ) : (
                      <>
                        {isBookingExpired(selectedBooking) ? (
                          <span className="badge bg-danger">
                            <XCircle size={12} className="me-1" /> Missed
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <Clock size={12} className="me-1" /> Pending Check-in
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* QR Code Section for Approved Bookings not checked in and not expired */}
              {selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn && !isBookingExpired(selectedBooking) && (
                <div className="mt-3 mb-3">
                  <button
                    onClick={() => toggleQRCode(selectedBooking.id)}
                    className="btn btn-outline-primary btn-sm w-100 mb-2"
                    style={{
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <QrCode size={14} />
                    {showQRCode[selectedBooking.id] ? "Hide QR Code" : "Show QR Code"}
                  </button>

                  {showQRCode[selectedBooking.id] && (
                    <div className="text-center p-3 border rounded bg-light">
                      <img
                        src={`http://localhost:8082/api/bookings/${selectedBooking.id}/qrcode`}
                        alt="QR Code"
                        style={{
                          width: "120px",
                          height: "120px",
                          margin: "0 auto",
                          cursor: "pointer",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML +=
                            '<small class="text-danger">QR code not available</small>';
                        }}
                      />
                      <div className="mt-2 d-flex gap-2 justify-content-center">
                        <button
                          onClick={() => downloadQRCode(selectedBooking.id, selectedBooking.resourceName)}
                          className="btn btn-sm btn-success"
                          style={{ borderRadius: "8px", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                          <Download size={12} /> Download QR
                        </button>
                      </div>
                      <small className="text-muted d-block mt-2">
                        Show this QR code at the venue for check-in
                      </small>
                    </div>
                  )}
                </div>
              )}

              {/* Expired Booking Message */}
              {selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn && isBookingExpired(selectedBooking) && (
                <div className="alert alert-danger p-2 mb-3">
                  <small><XCircle size={12} className="me-1" /> This booking has expired. Check-in is no longer available.</small>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {/* Cancel Button - Only show if booking is NOT expired and status is PENDING or (APPROVED and not checked in) */}
              {!isBookingExpired(selectedBooking) && (
                (selectedBooking.status === "PENDING" ||
                  (selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn))
              ) && (
                <button onClick={() => cancelBooking(selectedBooking.id)} className="btn btn-danger w-100">
                  Cancel Booking
                </button>
              )}
              
              {/* Show "You cancelled this booking" for cancelled bookings only */}
              {selectedBooking.status === "CANCELLED" && (
                <div className="alert alert-secondary w-100 text-center p-2 mb-0">
                  <small><XCircle size={12} className="me-1" /> You cancelled this booking</small>
                </div>
              )}
              
              <button onClick={closeModal} className="btn btn-secondary w-100 mt-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }

        .modal-container {
          background-color: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #dee2e6;
          background-color: #f8f9fa;
          border-radius: 12px 12px 0 0;
        }

        .modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .modal-close-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #dee2e6;
          background-color: #f8f9fa;
          border-radius: 0 0 12px 12px;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;