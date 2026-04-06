// src/pages/BookingForm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, FileText, AlertCircle, Info } from "lucide-react";
import axios from "axios";
import "../styles/BookingForm.css";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
    specialRequests: ""
  });

  const [conflicts, setConflicts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({
    date: "",
    startTime: "",
    endTime: "",
    attendees: ""
  });

  // Get day of week from date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const getDayOfWeek = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.getDay();
  };

  // Check if date is valid based on availableWeekends
  const isDateValid = (dateString) => {
    if (!dateString || !resource) return true;
    
    const dayOfWeek = getDayOfWeek(dateString);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (!resource.availableWeekends && isWeekend) {
      return false;
    }
    return true;
  };

  // Check if time is within operating hours
  // This allows: start time >= open time AND start time < close time
  // End time > open time AND end time <= close time
  // This enables back-to-back bookings (e.g., 8-10, 10-12)
  const isTimeValid = (timeString, type) => {
    if (!timeString || !resource) return true;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    const [openHour, openMinute] = (resource.openTime || "08:00:00").split(':').map(Number);
    const [closeHour, closeMinute] = (resource.closeTime || "17:00:00").split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    if (type === 'start') {
      // Start time can be at open time, must be before close time
      return timeInMinutes >= openTimeInMinutes && timeInMinutes < closeTimeInMinutes;
    } else {
      // End time must be after open time, can be at close time
      return timeInMinutes > openTimeInMinutes && timeInMinutes <= closeTimeInMinutes;
    }
  };

  // Check if end time is after start time
  const isEndTimeAfterStartTime = () => {
    if (!formData.startTime || !formData.endTime) return true;
    return formData.startTime < formData.endTime;
  };

  // Validate date field
  const validateDate = (date) => {
    if (!date) {
      setValidationErrors(prev => ({ ...prev, date: "" }));
      return true;
    }
    
    if (!isDateValid(date)) {
      setValidationErrors(prev => ({ ...prev, date: "Weekends are not available for booking" }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, date: "" }));
    return true;
  };

  // Validate start time field
  const validateStartTime = (time) => {
    if (!time) {
      setValidationErrors(prev => ({ ...prev, startTime: "" }));
      return true;
    }
    
    if (!isTimeValid(time, 'start')) {
      const openTime = resource?.openTime?.substring(0,5) || "08:00";
      const closeTime = resource?.closeTime?.substring(0,5) || "17:00";
      setValidationErrors(prev => ({ ...prev, startTime: `Start time must be between ${openTime} and ${closeTime}` }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, startTime: "" }));
    return true;
  };

  // Validate end time field
  const validateEndTime = (time) => {
    if (!time) {
      setValidationErrors(prev => ({ ...prev, endTime: "" }));
      return true;
    }
    
    if (!isTimeValid(time, 'end')) {
      const openTime = resource?.openTime?.substring(0,5) || "08:00";
      const closeTime = resource?.closeTime?.substring(0,5) || "17:00";
      setValidationErrors(prev => ({ ...prev, endTime: `End time must be between ${openTime} and ${closeTime}` }));
      return false;
    }
    
    if (formData.startTime && formData.startTime >= time) {
      setValidationErrors(prev => ({ ...prev, endTime: "End time must be after start time" }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, endTime: "" }));
    return true;
  };

  // Validate attendees field
  const validateAttendees = (attendees) => {
    if (!attendees || attendees === "") {
      setValidationErrors(prev => ({ ...prev, attendees: "Expected attendees is required" }));
      return false;
    }
    
    const numAttendees = parseInt(attendees);
    if (isNaN(numAttendees) || numAttendees < 1) {
      setValidationErrors(prev => ({ ...prev, attendees: "Please enter a valid number of attendees" }));
      return false;
    }
    
    if (resource && numAttendees > resource.capacity) {
      setValidationErrors(prev => ({ ...prev, attendees: `Maximum capacity is ${resource.capacity} people` }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, attendees: "" }));
    return true;
  };

  // Check all validations before submit
  const validateAllFields = () => {
    const isDateOk = validateDate(formData.bookingDate);
    const isStartTimeOk = validateStartTime(formData.startTime);
    const isEndTimeOk = validateEndTime(formData.endTime);
    const isAttendeesOk = validateAttendees(formData.expectedAttendees);
    
    return isDateOk && isStartTimeOk && isEndTimeOk && isAttendeesOk;
  };

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/resources/${id}`);
        setResource(response.data);
      } catch (err) {
        setError("Failed to load resource details");
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate individual fields
    if (name === 'bookingDate') {
      validateDate(value);
    } else if (name === 'startTime') {
      validateStartTime(value);
      // Re-validate end time if start time changes
      if (formData.endTime) {
        validateEndTime(formData.endTime);
      }
    } else if (name === 'endTime') {
      validateEndTime(value);
    } else if (name === 'expectedAttendees') {
      validateAttendees(value);
    }
    
    // Check conflicts when date/time changes and all fields are valid
    if (name === 'bookingDate' || name === 'startTime' || name === 'endTime') {
      if (formData.bookingDate && formData.startTime && formData.endTime) {
        // Only check conflicts if validation passes
        const isDateOk = name === 'bookingDate' ? validateDate(value) : validateDate(formData.bookingDate);
        const isStartOk = name === 'startTime' ? validateStartTime(value) : validateStartTime(formData.startTime);
        const isEndOk = name === 'endTime' ? validateEndTime(value) : validateEndTime(formData.endTime);
        
        if (isDateOk && isStartOk && isEndOk) {
          checkConflicts();
        } else {
          setConflicts([]);
        }
      }
    }
  };

  const checkConflicts = async () => {
    if (!formData.bookingDate || !formData.startTime || !formData.endTime) return;
    
    try {
      // Check against both PENDING and APPROVED bookings
      const response = await axios.get(`http://localhost:8080/api/bookings/check-conflict`, {
        params: {
          resourceId: id,
          date: formData.bookingDate,
          startTime: formData.startTime,
          endTime: formData.endTime
        }
      });
      setConflicts(response.data.conflicts || []);
    } catch (err) {
      console.error("Conflict check failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submit
    const isValid = validateAllFields();
    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Check conflicts again before submit
    await checkConflicts();
    
    if (conflicts.length > 0) {
      alert("This time slot conflicts with an existing booking. Please choose a different time.");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const bookingRequest = {
        resourceId: parseInt(id),
        userId: localStorage.getItem("userId") || 1,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees: parseInt(formData.expectedAttendees),
        specialRequests: formData.specialRequests || "",
        status: "PENDING"
      };
      
      const response = await axios.post("http://localhost:8080/api/bookings", bookingRequest);
      
      if (response.data) {
        navigate(`/booking-success/${response.data.id}`, { 
          state: { booking: response.data } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
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

  return (
    <div className="booking-form-container">
      <div className="container py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/resourceDetail/${id}`)}
          className="btn btn-link text-decoration-none text-dark mb-4"
        >
          <ArrowLeft size={20} className="me-2" /> Back to Resource
        </button>

        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-lg-5">
                <h2 className="mb-4">Book This Resource</h2>
                
                {/* Resource Summary */}
                <div className="resource-summary mb-4 p-3 bg-light rounded">
                  <h5>{resource?.name}</h5>
                  <p className="text-muted mb-0">
                    {resource?.type} • Capacity: {resource?.capacity} people
                  </p>
                </div>

                {/* Operating Hours Info Box */}
                <div className="alert alert-info mb-4 d-flex align-items-start">
                  <Info size={18} className="me-2 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Operating Hours:</strong> {resource?.openTime?.substring(0,5) || "08:00"} - {resource?.closeTime?.substring(0,5) || "17:00"}
                    <br />
                    <strong>Available Days:</strong> {resource?.availableWeekends ? "Monday - Sunday (including weekends)" : "Monday - Friday (weekdays only)"}
                    <br />
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <AlertCircle size={20} className="me-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Booking Date */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <Calendar size={16} className="me-1" /> Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleChange}
                      className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
                      min={getMinDate()}
                      required
                    />
                    {validationErrors.date && (
                      <div className="invalid-feedback">{validationErrors.date}</div>
                    )}
                    {!resource?.availableWeekends && (
                      <small className="text-muted">Note: Weekends are not available for booking</small>
                    )}
                  </div>

                  {/* Time Range */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <Clock size={16} className="me-1" /> Start Time *
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className={`form-control ${validationErrors.startTime ? 'is-invalid' : ''}`}
                        step="3600"
                        required
                      />
                      {validationErrors.startTime && (
                        <div className="invalid-feedback">{validationErrors.startTime}</div>
                      )}
                      <small className="text-muted">Min: {resource?.openTime?.substring(0,5) || "08:00"}</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <Clock size={16} className="me-1" /> End Time *
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className={`form-control ${validationErrors.endTime ? 'is-invalid' : ''}`}
                        step="3600"
                        required
                      />
                      {validationErrors.endTime && (
                        <div className="invalid-feedback">{validationErrors.endTime}</div>
                      )}
                      <small className="text-muted">Max: {resource?.closeTime?.substring(0,5) || "17:00"}</small>
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  {conflicts.length > 0 && !validationErrors.startTime && !validationErrors.endTime && (
                    <div className="alert alert-warning mb-3">
                      <AlertCircle size={16} className="me-2" />
                      <strong>Time conflict detected!</strong> This resource is already booked during this time. Please choose a different time slot.
                    </div>
                  )}

                  {/* Purpose */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FileText size={16} className="me-1" /> Purpose of Booking *
                    </label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="e.g., Group study session, Lecture, Project meeting..."
                      required
                    />
                  </div>

                  {/* Expected Attendees - Required */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <Users size={16} className="me-1" /> Expected Attendees *
                    </label>
                    <input
                      type="number"
                      name="expectedAttendees"
                      value={formData.expectedAttendees}
                      onChange={handleChange}
                      className={`form-control ${validationErrors.attendees ? 'is-invalid' : ''}`}
                      min="1"
                      max={resource?.capacity || 100}
                      placeholder="Number of people"
                      required
                    />
                    {validationErrors.attendees && (
                      <div className="invalid-feedback">{validationErrors.attendees}</div>
                    )}
                  </div>

                  {/* Special Requests - Optional */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="form-control"
                      rows="2"
                      placeholder="Any special requirements or equipment needed?"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/resourceDetail/${id}`)}
                      className="btn btn-outline-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-primary flex-grow-1"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        "Submit Booking Request"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;