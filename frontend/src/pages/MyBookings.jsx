// src/pages/MyBookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, CheckCircle, XCircle, Clock as PendingIcon, AlertCircle, Image as ImageIcon, Download, QrCode, X } from "lucide-react";
import "../styles/MyBookings.css"; // Create this CSS file for hover effects

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      const response = await axios.get(`http://localhost:8080/api/bookings/user/${userId}`);
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "APPROVED":
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" /> Approved</span>;
      case "REJECTED":
        return <span className="badge bg-danger"><XCircle size={12} className="me-1" /> Rejected</span>;
      case "CANCELLED":
        return <span className="badge bg-secondary">Cancelled</span>;
      default:
        return <span className="badge bg-warning"><PendingIcon size={12} className="me-1" /> Pending</span>;
    }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      try {
        await axios.put(`http://localhost:8080/api/bookings/${bookingId}/cancel`);
        alert("Booking cancelled successfully!");
        fetchMyBookings();
        setShowModal(false);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel booking");
      }
    }
  };

  const downloadQRCode = async (bookingId, resourceName) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}/qrcode`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Code_${resourceName}_${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert("QR Code downloaded successfully!");
    } catch (err) {
      console.error("Failed to download QR code:", err);
      alert("Failed to download QR code");
    }
  };
  
  const toggleQRCode = (bookingId) => {
    setShowQRCode(prev => ({ ...prev, [bookingId]: !prev[bookingId] }));
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My Bookings</h2>
        <button onClick={() => navigate("/catalogue")} className="btn btn-outline-primary">
          + New Booking
        </button>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <Calendar size={60} className="text-muted mb-3" />
          <h4>No bookings found</h4>
          <p className="text-muted">You haven't made any bookings yet.</p>
          <button onClick={() => navigate("/catalogue")} className="btn btn-primary mt-2">
            Browse Resources
          </button>
        </div>
      ) : (
        <div className="row">
          {bookings.map(booking => (
            <div key={booking.id} className="col-md-6 col-lg-3 mb-4">
              <div className="card h-100 shadow-sm booking-card-hover">
                {booking.resourceImage && (
                  <img 
                    src={booking.resourceImage} 
                    alt={booking.resourceName}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x180?text=No+Image";
                    }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{booking.resourceName || `Resource #${booking.resourceId}`}</h5>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <hr />
                  
                  <div className="mb-2">
                    <Calendar size={14} className="text-muted me-2" />
                    <small className="text-muted">Date:</small>
                    <div className="fw-semibold">{booking.bookingDate}</div>
                  </div>
                  
                  <div className="mb-3">
                    <Clock size={14} className="text-muted me-2" />
                    <small className="text-muted">Time:</small>
                    <div className="fw-semibold">{booking.startTime} - {booking.endTime}</div>
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
              <h5 className="modal-title">{selectedBooking.resourceName || `Resource #${selectedBooking.resourceId}`}</h5>
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
              
              {/* Status Messages */}
              {selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn && (
                <div className="alert alert-success p-2 mb-3">
                  <small><CheckCircle size={12} className="me-1" /> ✓ Booking confirmed</small>
                </div>
              )}
              
              {selectedBooking.status === "APPROVED" && selectedBooking.checkedIn && (
                <div className="alert alert-info p-2 mb-3">
                  <small><CheckCircle size={12} className="me-1" /> ✓ Checked in on {new Date(selectedBooking.checkedInAt).toLocaleString()}</small>
                </div>
              )}
              
              {selectedBooking.status === "CANCELLED" && (
                <div className="alert alert-secondary p-2 mb-3">
                  <small><XCircle size={12} className="me-1" /> You cancelled this booking</small>
                </div>
              )}
              
              {/* QR Code Section for Approved Bookings not checked in */}
              {selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn && (
                <div className="mt-3 mb-3">
                  <button
                    onClick={() => toggleQRCode(selectedBooking.id)}
                    className="btn btn-outline-primary btn-sm w-100 mb-2"
                    style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <QrCode size={14} />
                    {showQRCode[selectedBooking.id] ? 'Hide QR Code' : 'Show QR Code'}
                  </button>
                  
                  {showQRCode[selectedBooking.id] && (
                    <div className="text-center p-3 border rounded bg-light">
                      <img 
                        src={`http://localhost:8080/api/bookings/${selectedBooking.id}/qrcode`}
                        alt="QR Code"
                        style={{ width: "120px", height: "120px", margin: "0 auto", cursor: "pointer" }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML += '<small class="text-danger">QR code not available</small>';
                        }}
                      />
                      <div className="mt-2 d-flex gap-2 justify-content-center">
                        <button
                          onClick={() => downloadQRCode(selectedBooking.id, selectedBooking.resourceName)}
                          className="btn btn-sm btn-success"
                          style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                          <Download size={12} /> Download QR
                        </button>
                      </div>
                      <small className="text-muted d-block mt-2">Show this QR code at the venue for check-in</small>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {/* Cancel Button - Show for PENDING and APPROVED bookings only (not checked in) */}
              {(selectedBooking.status === "PENDING" || (selectedBooking.status === "APPROVED" && !selectedBooking.checkedIn)) && (
                <button
                  onClick={() => cancelBooking(selectedBooking.id)}
                  className="btn btn-danger w-100"
                >
                  Cancel Booking
                </button>
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