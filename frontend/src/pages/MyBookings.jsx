// src/pages/MyBookings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, CheckCircle, XCircle, Clock as PendingIcon, AlertCircle, Image as ImageIcon } from "lucide-react";
import "../styles/MyBookings.css"; // Create this CSS file for hover effects

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      } catch (err) {
        alert(err.response?.data?.message || "Failed to cancel booking");
      }
    }
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
              {/* Added hover effect class "booking-card-hover" */}
              <div className="card h-100 shadow-sm booking-card-hover">
                {/* Resource Image */}
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
                  
                  <div className="mb-2">
                    <Clock size={14} className="text-muted me-2" />
                    <small className="text-muted">Time:</small>
                    <div className="fw-semibold">{booking.startTime} - {booking.endTime}</div>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">Purpose:</small>
                    <div className="small">{booking.purpose}</div>
                  </div>
                  
                  {booking.expectedAttendees > 0 && (
                    <div className="mb-2">
                      <small className="text-muted">Expected Attendees:</small>
                      <div className="small">{booking.expectedAttendees}</div>
                    </div>
                  )}
                  
                  {booking.specialRequests && (
                    <div className="mb-2">
                      <small className="text-muted">Special Requests:</small>
                      <div className="small text-muted">{booking.specialRequests}</div>
                    </div>
                  )}
                  
                  {/* Rejection Reason Message */}
                  {booking.rejectionReason && booking.status === "REJECTED" && (
                    <div className="alert alert-danger alert-sm p-2 mb-2 mt-2">
                      <small><strong>Reason:</strong> {booking.rejectionReason}</small>
                    </div>
                  )}
                  
                  {/* Status Messages */}
                  {booking.status === "APPROVED" && (
                    <div className="alert alert-success alert-sm p-2 mt-2 mb-0">
                      <small><CheckCircle size={12} className="me-1" /> ✓ Booking confirmed</small>
                    </div>
                  )}
                  
                  {booking.status === "CANCELLED" && (
                    <div className="alert alert-secondary alert-sm p-2 mt-2 mb-0">
                      <small><XCircle size={12} className="me-1" /> You cancelled this booking</small>
                    </div>
                  )}
                  
                  
                  
                  {/* Cancel Button - Show for PENDING and APPROVED bookings only */}
                  {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="btn btn-outline-danger btn-sm w-100 mt-2"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;