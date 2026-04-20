// src/pages/BookingSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Users, FileText, ArrowLeft } from "lucide-react";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  if (!booking) {
    navigate("/catalogue");
    return null;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 text-center p-4">
            <div className="mb-4">
              <CheckCircle size={80} className="text-success" />
            </div>
            
            <h2 className="mb-2">Booking Request Submitted!</h2>
            <p className="text-muted mb-4">
              Your booking request has been sent for approval
            </p>

            <div className="booking-details text-start mb-4 p-3 bg-light rounded">
              <h5 className="mb-3">Booking Details:</h5>
              <p><strong>Booking ID:</strong> #{booking.id}</p>
              <p><strong>Status:</strong> <span className="badge bg-warning">Pending Approval</span></p>
              <p><strong>Date:</strong> {booking.bookingDate}</p>
              <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
              <p><strong>Purpose:</strong> {booking.purpose}</p>
              {booking.expectedAttendees > 0 && (
                <p><strong>Attendees:</strong> {booking.expectedAttendees}</p>
              )}
            </div>

            <div className="alert alert-info text-start">
              <strong>Next Steps:</strong>
              <ul className="mb-0 mt-2">
                <li>An admin will review your request</li>
                <li>You'll receive a notification when approved/rejected</li>
                <li>Check your bookings in "My Bookings" page</li>
              </ul>
            </div>

            <div className="d-flex gap-3 mt-3">
              <button
                onClick={() => navigate("/my-bookings")}
                className="btn btn-primary flex-grow-1"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/catalogue")}
                className="btn btn-outline-secondary flex-grow-1"
              >
                Browse More Resources
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;