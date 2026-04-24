// src/pages/BookingForm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Info,
} from "lucide-react";
import axios from "axios";
import "../styles/BookingForm.css";
import { useAuth } from "../context/AuthContext";
import { getResourceImageOrCatalogueFallback } from "../utils/resourceImageFallback";
import api from "../services/api";

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    bookedByName: "",
    bookedByEmail: "",
    contactNumber: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
    specialRequests: "",
  });

  const [conflicts, setConflicts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({
    bookedByName: "",
    bookedByEmail: "",
    contactNumber: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
    purpose: "",
    specialRequests: "",
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

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Format minutes to time string (HH:MM)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Check if time is within operating hours (handles overnight hours like 17:00 to 05:00)
  const isTimeWithinOperatingHours = (timeString, type) => {
    if (!timeString || !resource) return true;

    const timeInMinutes = timeToMinutes(timeString);
    const openTimeStr = resource.openTime || "08:00:00";
    const closeTimeStr = resource.closeTime || "17:00:00";

    let openTimeInMinutes = timeToMinutes(openTimeStr);
    let closeTimeInMinutes = timeToMinutes(closeTimeStr);

    // Check if operating hours cross midnight (e.g., 17:00 to 05:00)
    const crossesMidnight = closeTimeInMinutes < openTimeInMinutes;

    if (crossesMidnight) {
      // Operating hours cross midnight
      if (type === "start") {
        // Start time: from open time to midnight, OR from midnight to close time
        return (
          timeInMinutes >= openTimeInMinutes ||
          timeInMinutes < closeTimeInMinutes
        );
      } else {
        // End time: same logic but with different boundaries
        return (
          timeInMinutes > openTimeInMinutes ||
          timeInMinutes <= closeTimeInMinutes
        );
      }
    } else {
      // Normal operating hours (same day)
      if (type === "start") {
        return (
          timeInMinutes >= openTimeInMinutes &&
          timeInMinutes < closeTimeInMinutes
        );
      } else {
        return (
          timeInMinutes > openTimeInMinutes &&
          timeInMinutes <= closeTimeInMinutes
        );
      }
    }
  };

  // Get the minimum allowed start time based on current time if booking is today (3 minutes gap)
  const getMinStartTime = () => {
    if (!resource) return "";

    const today = new Date().toISOString().split("T")[0];
    if (formData.bookingDate !== today)
      return resource.openTime?.substring(0, 5) || "08:00";

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    const openTimeMinutes = timeToMinutes(resource.openTime || "08:00:00");

    // If current time is after open time, use current time + 3 minutes
    if (currentTimeMinutes > openTimeMinutes) {
      let nextTimeMinutes = currentTimeMinutes + 3;

      // Round up to nearest minute (no rounding to 30 minutes)
      const nextHour = Math.floor(nextTimeMinutes / 60) % 24;
      const nextMinute = nextTimeMinutes % 60;
      return `${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`;
    }

    return resource.openTime?.substring(0, 5) || "08:00";
  };

  // Get max allowed end time (no restriction, just operating hour end)
  const getMaxEndTime = () => {
    return resource?.closeTime?.substring(0, 5) || "17:00";
  };

  // Check if time is within operating hours (using the new function)
  const isTimeValid = (timeString, type) => {
    if (!timeString || !resource) return true;
    return isTimeWithinOperatingHours(timeString, type);
  };

  // Check if end time is after start time (handles overnight)
  const isEndTimeAfterStartTime = () => {
    if (!formData.startTime || !formData.endTime) return true;

    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);

    const openTimeMinutes = timeToMinutes(resource?.openTime || "08:00:00");
    const closeTimeMinutes = timeToMinutes(resource?.closeTime || "17:00:00");
    const crossesMidnight = closeTimeMinutes < openTimeMinutes;

    if (crossesMidnight) {
      // For overnight bookings, end time can be less than start time (e.g., 22:00 to 02:00)
      return true;
    }

    return startMinutes < endMinutes;
  };

  // Get max date (current date + 5 years = up to 2031)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setFullYear(today.getFullYear() + 5);
    return maxDate.toISOString().split("T")[0];
  };

  // Validate date field with date range (present to 2031)
  const validateDate = (date) => {
    if (!date) {
      setValidationErrors((prev) => ({ ...prev, date: "" }));
      return true;
    }

    if (!isDateValid(date)) {
      setValidationErrors((prev) => ({
        ...prev,
        date: "Weekends are not available for booking",
      }));
      return false;
    }

    // Check date range (from today to 2031)
    const today = new Date().toISOString().split("T")[0];
    const maxDate = getMaxDate();
    
    if (date < today) {
      setValidationErrors((prev) => ({
        ...prev,
        date: "Booking date cannot be in the past",
      }));
      return false;
    }
    
    if (date > maxDate) {
      setValidationErrors((prev) => ({
        ...prev,
        date: "Booking date cannot be more than 5 years from now (maximum: 2031)",
      }));
      return false;
    }

    setValidationErrors((prev) => ({ ...prev, date: "" }));
    return true;
  };

  // Validate purpose field (max 250 characters)
  const validatePurpose = (purpose) => {
    if (!purpose) {
      setValidationErrors((prev) => ({ ...prev, purpose: "" }));
      return true;
    }
    
    if (purpose.length > 250) {
      setValidationErrors((prev) => ({
        ...prev,
        purpose: "Purpose must not exceed 250 characters",
      }));
      return false;
    }
    
    setValidationErrors((prev) => ({ ...prev, purpose: "" }));
    return true;
  };

  // Validate special requests field (max 250 characters)
  const validateSpecialRequests = (specialRequests) => {
    if (!specialRequests) {
      setValidationErrors((prev) => ({ ...prev, specialRequests: "" }));
      return true;
    }
    
    if (specialRequests.length > 250) {
      setValidationErrors((prev) => ({
        ...prev,
        specialRequests: "Special requests must not exceed 250 characters",
      }));
      return false;
    }
    
    setValidationErrors((prev) => ({ ...prev, specialRequests: "" }));
    return true;
  };

  // Validate start time field
  const validateStartTime = (time) => {
    if (!time) {
      setValidationErrors((prev) => ({ ...prev, startTime: "" }));
      return true;
    }

    if (!isTimeValid(time, "start")) {
      const openTime = resource?.openTime?.substring(0, 5) || "08:00";
      const closeTime = resource?.closeTime?.substring(0, 5) || "17:00";
      setValidationErrors((prev) => ({
        ...prev,
        startTime: `Start time must be between ${openTime} and ${closeTime}`,
      }));
      return false;
    }

    // Check if booking is today and start time is not in the past (3 minutes gap)
    const today = new Date().toISOString().split("T")[0];
    if (formData.bookingDate === today) {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = timeToMinutes(time);

      // Allow start time to be at least current time + 3 minutes
      const minStartMinutes = currentTimeMinutes + 3;
      if (startMinutes < minStartMinutes) {
        const minTime = minutesToTime(minStartMinutes);
        setValidationErrors((prev) => ({
          ...prev,
          startTime: `Start time must be at least 3 minutes from now (current time: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
        }));
        return false;
      }
    }

    setValidationErrors((prev) => ({ ...prev, startTime: "" }));
    return true;
  };

  // Validate end time field
  const validateEndTime = (time) => {
    if (!time) {
      setValidationErrors((prev) => ({ ...prev, endTime: "" }));
      return true;
    }

    if (!isTimeValid(time, "end")) {
      const openTime = resource?.openTime?.substring(0, 5) || "08:00";
      const closeTime = resource?.closeTime?.substring(0, 5) || "17:00";
      setValidationErrors((prev) => ({
        ...prev,
        endTime: `End time must be between ${openTime} and ${closeTime}`,
      }));
      return false;
    }

    if (!isEndTimeAfterStartTime()) {
      setValidationErrors((prev) => ({
        ...prev,
        endTime: "End time must be after start time",
      }));
      return false;
    }

    setValidationErrors((prev) => ({ ...prev, endTime: "" }));
    return true;
  };

  // Validate attendees field (skip if resource type is EQUIPMENT)
  const validateAttendees = (attendees) => {
    // Skip validation for EQUIPMENT type
    if (resource?.type === "EQUIPMENT") {
      setValidationErrors((prev) => ({ ...prev, attendees: "" }));
      return true;
    }

    if (!attendees || attendees === "") {
      setValidationErrors((prev) => ({
        ...prev,
        attendees: "Expected attendees is required",
      }));
      return false;
    }

    const numAttendees = parseInt(attendees);
    if (isNaN(numAttendees) || numAttendees < 1) {
      setValidationErrors((prev) => ({
        ...prev,
        attendees: "Please enter a valid number of attendees",
      }));
      return false;
    }

    if (resource && numAttendees > resource.capacity) {
      setValidationErrors((prev) => ({
        ...prev,
        attendees: `Maximum capacity is ${resource.capacity} people`,
      }));
      return false;
    }

    setValidationErrors((prev) => ({ ...prev, attendees: "" }));
    return true;
  };

  // Validate Name - Only letters and spaces, no numbers or special characters
    // Validate Name - Only letters and spaces, no numbers or special characters, cannot start with space
  const validateBookedByName = (bookedByName) => {
    // Don't trim here - we need to check for leading space
    if (!bookedByName || bookedByName.trim() === "") {
      setValidationErrors((prev) => ({ ...prev, bookedByName: "Name is required" }));
      return false;
    }
    // Check if name starts with a space
    if (bookedByName.startsWith(" ")) {
      setValidationErrors((prev) => ({
        ...prev,
        bookedByName: "Name cannot start with a space",
      }));
      return false;
    }
    if (bookedByName.length > 255) {
      setValidationErrors((prev) => ({
        ...prev,
        bookedByName: "Name must not exceed 255 characters",
      }));
      return false;
    }
    // Allow only letters and spaces (no numbers, no special characters)
    // Also ensure no multiple consecutive spaces (optional but good practice)
    const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
    if (!nameRegex.test(bookedByName)) {
      setValidationErrors((prev) => ({
        ...prev,
        bookedByName: "Name must contain only letters and single spaces (no numbers, no special characters, no double spaces)",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, bookedByName: "" }));
    return true;
  };

  // Validate Email - Convert to lowercase, no capital letters allowed
  const validateBookedByEmail = (bookedByEmail) => {
    const value = bookedByEmail?.trim() || "";
    if (!value) {
      setValidationErrors((prev) => ({ ...prev, bookedByEmail: "Email is required" }));
      return false;
    }
    // Check if email contains capital letters
    if (/[A-Z]/.test(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        bookedByEmail: "Email cannot contain capital letters. Please use lowercase only.",
      }));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        bookedByEmail: "Please enter a valid email address",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, bookedByEmail: "" }));
    return true;
  };

  // Validate Contact Number - Must start with 07, exactly 10 digits, only numbers allowed
  const validateContactNumber = (contactNumber) => {
    const value = contactNumber?.trim() || "";
    if (!value) {
      setValidationErrors((prev) => ({
        ...prev,
        contactNumber: "Contact number is required",
      }));
      return false;
    }
    // Check if only digits are entered (no letters, no symbols, no +)
    const digitsOnlyRegex = /^\d+$/;
    if (!digitsOnlyRegex.test(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        contactNumber: "Contact number must contain only digits (0-9)",
      }));
      return false;
    }
    // Check if starts with 07 and is exactly 10 digits
    const contactRegex = /^07[0-9]{8}$/;
    if (!contactRegex.test(value)) {
      setValidationErrors((prev) => ({
        ...prev,
        contactNumber: "Contact number must start with '07' and contain exactly 10 digits (e.g., 0712345678)",
      }));
      return false;
    }
    setValidationErrors((prev) => ({ ...prev, contactNumber: "" }));
    return true;
  };

  // Check all validations before submit
  const validateAllFields = () => {
    const isBookedByNameOk = validateBookedByName(formData.bookedByName);
    const isBookedByEmailOk = validateBookedByEmail(formData.bookedByEmail);
    const isContactNumberOk = validateContactNumber(formData.contactNumber);
    const isDateOk = validateDate(formData.bookingDate);
    const isStartTimeOk = validateStartTime(formData.startTime);
    const isEndTimeOk = validateEndTime(formData.endTime);
    const isAttendeesOk = validateAttendees(formData.expectedAttendees);
    const isPurposeOk = validatePurpose(formData.purpose);
    const isSpecialRequestsOk = validateSpecialRequests(formData.specialRequests);

    return isBookedByNameOk && isBookedByEmailOk && isContactNumberOk && isDateOk && isStartTimeOk && isEndTimeOk && isAttendeesOk && isPurposeOk && isSpecialRequestsOk;
  };

  useEffect(() => {
    if (!user) return;
    // Convert email to lowercase when setting from user
    const userEmail = (user.email || "").toLowerCase();
    setFormData((prev) => ({
      ...prev,
      bookedByName: prev.bookedByName || user.fullName || user.username || "",
      bookedByEmail: prev.bookedByEmail || userEmail,
    }));
  }, [user]);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/resources/${id}`,
        );
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
    let { name, value } = e.target;
    let errorMessage = "";
    let isValid = true;
    
    // Special handling for name: remove numbers and special characters (allow only letters and spaces)
    if (name === "bookedByName") {
      // Check if user is trying to enter invalid characters
      const invalidChars = value.replace(/[A-Za-z\s]/g, '');
      if (invalidChars && invalidChars.length > 0) {
        errorMessage = `Invalid character(s) "${invalidChars}" - only letters and spaces allowed`;
        isValid = false;
      }
      // Allow only letters and spaces, remove everything else as user types
      let cleaned = value.replace(/[^A-Za-z\s]/g, '');
      // Prevent leading space
      if (cleaned.startsWith(" ")) {
        cleaned = cleaned.substring(1);
        if (!errorMessage) {
          errorMessage = "Name cannot start with a space";
          isValid = false;
        }
      }
      // Prevent multiple consecutive spaces
      const hadMultipleSpaces = /\s{2,}/.test(cleaned);
      if (hadMultipleSpaces) {
        if (!errorMessage) {
          errorMessage = "Name cannot contain multiple consecutive spaces";
          isValid = false;
        }
      }
      cleaned = cleaned.replace(/\s+/g, ' ');
      value = cleaned;
      
      if (isValid && value && value.length > 0) {
        // Check if it starts with space again
        if (value.startsWith(" ")) {
          errorMessage = "Name cannot start with a space";
          isValid = false;
        } else {
          errorMessage = "";
        }
      }
      setValidationErrors((prev) => ({ ...prev, bookedByName: errorMessage }));
    }
    
    // Special handling for email: convert to lowercase immediately and validate
    if (name === "bookedByEmail") {
      value = value.toLowerCase();
      // Check for capital letters (should not happen due to toLowerCase, but just in case)
      if (/[A-Z]/.test(value)) {
        errorMessage = "Email cannot contain capital letters";
        isValid = false;
      }
      // Check email format in real-time (basic check)
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMessage = "Please enter a valid email address";
        isValid = false;
      } else if (value && !errorMessage) {
        errorMessage = "";
      }
      setValidationErrors((prev) => ({ ...prev, bookedByEmail: errorMessage }));
    }
    
    // Special handling for contact number: allow only digits
    if (name === "contactNumber") {
      // Check if user entered non-digit characters
      const nonDigits = value.replace(/\d/g, '');
      if (nonDigits && nonDigits.length > 0) {
        errorMessage = `Invalid character(s) "${nonDigits}" - only digits allowed`;
        isValid = false;
      }
      // Remove everything except digits
      let cleaned = value.replace(/\D/g, '');
      // Check length
      if (cleaned.length > 0 && cleaned.length < 10 && !errorMessage) {
        errorMessage = `Need ${10 - cleaned.length} more digit(s)`;
        isValid = false;
      } else if (cleaned.length === 10 && !errorMessage) {
        // Check if starts with 07
        if (!cleaned.startsWith("07")) {
          errorMessage = "Contact number must start with '07'";
          isValid = false;
        } else {
          errorMessage = "";
          isValid = true;
        }
      } else if (cleaned.length > 10) {
        errorMessage = "Contact number cannot exceed 10 digits";
        isValid = false;
        cleaned = cleaned.slice(0, 10);
      }
      // Limit to 10 digits
      if (cleaned.length > 10) {
        cleaned = cleaned.slice(0, 10);
      }
      value = cleaned;
      setValidationErrors((prev) => ({ ...prev, contactNumber: errorMessage }));
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate individual fields with real-time feedback
    if (name === "bookedByName") {
      // Already handled above
    } else if (name === "bookedByEmail") {
      // Already handled above
    } else if (name === "contactNumber") {
      // Already handled above
    } else if (name === "bookingDate") {
      validateDate(value);
    } else if (name === "startTime") {
      validateStartTime(value);
      // Re-validate end time if start time changes
      if (formData.endTime) {
        validateEndTime(formData.endTime);
      }
    } else if (name === "endTime") {
      validateEndTime(value);
    } else if (name === "expectedAttendees") {
      validateAttendees(value);
    } else if (name === "purpose") {
      validatePurpose(value);
    } else if (name === "specialRequests") {
      validateSpecialRequests(value);
    }

    // Check conflicts when date/time changes and all fields are valid
    if (name === "bookingDate" || name === "startTime" || name === "endTime") {
      if (formData.bookingDate && formData.startTime && formData.endTime) {
        // Only check conflicts if validation passes
        const isDateOk =
          name === "bookingDate"
            ? validateDate(value)
            : validateDate(formData.bookingDate);
        const isStartOk =
          name === "startTime"
            ? validateStartTime(value)
            : validateStartTime(formData.startTime);
        const isEndOk =
          name === "endTime"
            ? validateEndTime(value)
            : validateEndTime(formData.endTime);

        if (isDateOk && isStartOk && isEndOk) {
          checkConflicts();
        } else {
          setConflicts([]);
        }
      }
    }
  };
  const checkConflicts = async () => {
    if (!formData.bookingDate || !formData.startTime || !formData.endTime)
      return;

    try {
      // Check against both PENDING and APPROVED bookings
      const response = await axios.get(
        `http://localhost:8082/api/bookings/check-conflict`,
        {
          params: {
            resourceId: id,
            date: formData.bookingDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
          },
        },
      );
      setConflicts(response.data.conflicts || []);
    } catch (err) {
      console.error("Conflict check failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id) {
      setError("Please sign in to create a booking.");
      return;
    }

    // Validate all fields before submit
    const isValid = validateAllFields();
    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector(".is-invalid");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Check conflicts again before submit
    await checkConflicts();

    if (conflicts.length > 0) {
      alert(
        "This time slot conflicts with an existing booking. Please choose a different time.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const bookingRequest = {
        resourceId: parseInt(id),
        bookedByName: formData.bookedByName.trim(),
        bookedByEmail: formData.bookedByEmail.trim(),
        contactNumber: formData.contactNumber.trim(),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        expectedAttendees:
          resource?.type === "EQUIPMENT"
            ? 0
            : parseInt(formData.expectedAttendees),
        specialRequests: formData.specialRequests || "",
        status: "PENDING",
      };

      const response = await api.post("/bookings", bookingRequest);

      if (response.data) {
        navigate(`/booking-success/${response.data.id}`, {
          state: { booking: response.data },
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
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
          onClick={() => navigate(`/resourseDetail/${id}`)}
          className="btn btn-link text-decoration-none text-dark mb-4 fw-bold"
        >
          <ArrowLeft size={20} className="me-2" /> Back to Resource
        </button>

        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-lg-5">
                <h2 className="mb-4">Book This Resource</h2>

                {/* Resource Summary with Image */}
                <div className="resource-summary mb-4 p-3 bg-light rounded d-flex align-items-center gap-3">
                  {/* Resource Image */}
                  <img
                    src={getResourceImageOrCatalogueFallback(resource?.imageUrl || resource?.image, resource?.id)}
                    alt={resource?.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                    onError={(e) => {
                      e.target.src = getResourceImageOrCatalogueFallback(null, resource?.id);
                    }}
                  />
                  <div>
                    <h5 className="mb-1">{resource?.name}</h5>
                    <p className="text-muted mb-0">
                      {resource?.location || "Location not available"}
                    </p>
                    <p className="text-muted mb-0">
                      {resource?.type} •{" "}
                      {resource?.type !== "EQUIPMENT" &&
                        `Capacity: ${resource?.capacity} people`}
                    </p>
                  </div>
                </div>

                {/* Operating Hours Info Box */}
                <div className="alert alert-info mb-4 d-flex align-items-start">
                  <Info size={18} className="me-2 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Operating Hours:</strong>{" "}
                    {resource?.openTime?.substring(0, 5) || "08:00"} -{" "}
                    {resource?.closeTime?.substring(0, 5) || "17:00"}
                    <br />
                    <strong>Available Days:</strong>{" "}
                    {resource?.availableWeekends
                      ? "Monday - Sunday (including weekends)"
                      : "Monday - Friday (weekdays only)"}
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
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Name *</label>
                      <input
                        type="text"
                        name="bookedByName"
                        value={formData.bookedByName}
                        onChange={handleChange}
                        className={`form-control ${validationErrors.bookedByName ? "is-invalid" : formData.bookedByName ? "is-valid" : ""}`}
                        placeholder="Enter your name (letters and spaces only)"
                        maxLength={255}
                        required
                      />
                      {validationErrors.bookedByName && (
                        <div className="invalid-feedback" style={{ display: 'block' }}>
                          {validationErrors.bookedByName}
                        </div>
                      )}
                      {!validationErrors.bookedByName && formData.bookedByName && (
                        <div className="valid-feedback" style={{ display: 'block' }}>
                          ✓ Looks good!
                        </div>
                      )}
                      <small className="text-muted">
                        Only letters and spaces allowed
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input
                        type="email"
                        name="bookedByEmail"
                        value={formData.bookedByEmail}
                        onChange={handleChange}
                        className={`form-control ${validationErrors.bookedByEmail ? "is-invalid" : formData.bookedByEmail && !validationErrors.bookedByEmail ? "is-valid" : ""}`}
                        placeholder="Enter your email (lowercase only)"
                        maxLength={255}
                        required
                      />
                      {validationErrors.bookedByEmail && (
                        <div className="invalid-feedback" style={{ display: 'block' }}>
                          {validationErrors.bookedByEmail}
                        </div>
                      )}
                      {!validationErrors.bookedByEmail && formData.bookedByEmail && (
                        <div className="valid-feedback" style={{ display: 'block' }}>
                          ✓ Looks good!
                        </div>
                      )}
                      <small className="text-muted">
                        Only lowercase letters allowed
                      </small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`form-control ${validationErrors.contactNumber ? "is-invalid" : formData.contactNumber && !validationErrors.contactNumber ? "is-valid" : ""}`}
                      placeholder="e.g., 0712345678"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                    {validationErrors.contactNumber && (
                      <div className="invalid-feedback" style={{ display: 'block' }}>
                        {validationErrors.contactNumber}
                      </div>
                    )}
                    {!validationErrors.contactNumber && formData.contactNumber && formData.contactNumber.length === 10 && (
                      <div className="valid-feedback" style={{ display: 'block' }}>
                        ✓ Valid number!
                      </div>
                    )}
                    <small className="text-muted">
                      Must start with '07' and contain exactly 10 digits
                    </small>
                  </div>

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
                      className={`form-control ${validationErrors.date ? "is-invalid" : ""}`}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                    />
                    {validationErrors.date && (
                      <div className="invalid-feedback">
                        {validationErrors.date}
                      </div>
                    )}
                    {!resource?.availableWeekends && (
                      <small className="text-muted">
                        Note: Weekends are not available for booking
                      </small>
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
                        className={`form-control ${validationErrors.startTime ? "is-invalid" : ""}`}
                        step="60"
                        min={getMinStartTime()}
                        required
                      />
                      {validationErrors.startTime && (
                        <div className="invalid-feedback">
                          {validationErrors.startTime}
                        </div>
                      )}
                      <small className="text-muted">
                        Min: {getMinStartTime()}
                      </small>
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
                        className={`form-control ${validationErrors.endTime ? "is-invalid" : ""}`}
                        step="60"
                        required
                      />
                      {validationErrors.endTime && (
                        <div className="invalid-feedback">
                          {validationErrors.endTime}
                        </div>
                      )}
                      <small className="text-muted">
                        Max: {getMaxEndTime()}
                      </small>
                    </div>
                  </div>

                  {/* Conflict Warning */}
                  {conflicts.length > 0 &&
                    !validationErrors.startTime &&
                    !validationErrors.endTime && (
                      <div className="alert alert-warning mb-3">
                        <AlertCircle size={16} className="me-2" />
                        <strong>Time conflict detected!</strong> This resource
                        is already booked during this time. Please choose a
                        different time slot.
                      </div>
                    )}

                  {/* Purpose */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FileText size={16} className="me-1" /> Purpose of Booking
                      *
                    </label>
                    <textarea
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className={`form-control ${validationErrors.purpose ? "is-invalid" : ""}`}
                      rows="3"
                      placeholder="e.g., Group study session, Lecture, Project meeting... (Max 250 characters)"
                      required
                      maxLength={250}
                    />
                    {validationErrors.purpose && (
                      <div className="invalid-feedback">
                        {validationErrors.purpose}
                      </div>
                    )}
                    <small className="text-muted">
                      {formData.purpose.length}/250 characters
                    </small>
                  </div>

                  {/* Expected Attendees - Only show for non-EQUIPMENT resources */}
                  {resource?.type !== "EQUIPMENT" && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <Users size={16} className="me-1" /> Expected Attendees
                        *
                      </label>
                      <input
                        type="number"
                        name="expectedAttendees"
                        value={formData.expectedAttendees}
                        onChange={handleChange}
                        className={`form-control ${validationErrors.attendees ? "is-invalid" : ""}`}
                        min="1"
                        max={resource?.capacity || 100}
                        placeholder="Number of people"
                        required
                      />
                      {validationErrors.attendees && (
                        <div className="invalid-feedback">
                          {validationErrors.attendees}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Special Requests - Optional */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className={`form-control ${validationErrors.specialRequests ? "is-invalid" : ""}`}
                      rows="2"
                      placeholder="Any special requirements or equipment needed? (Max 250 characters)"
                      maxLength={250}
                    />
                    {validationErrors.specialRequests && (
                      <div className="invalid-feedback">
                        {validationErrors.specialRequests}
                      </div>
                    )}
                    <small className="text-muted">
                      {formData.specialRequests.length}/250 characters
                    </small>
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