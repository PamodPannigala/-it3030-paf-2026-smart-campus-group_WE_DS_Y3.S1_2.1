// src/pages/tickets/CreateTicket.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTicket } from "../../services/ticketApi";

export default function CreateTicket({ userName = "", userEmail = "" }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Dropdown options 
  const PRIORITY_OPTIONS = useMemo(
    () => [
      { value: "", label: "Select priority" },
      { value: "LOW", label: "Low" },
      { value: "MEDIUM", label: "Medium" },
      { value: "HIGH", label: "High" },
      { value: "URGENT", label: "Urgent" },
    ],
    []
  );

  const CATEGORY_OPTIONS = useMemo(
    () => [
      { value: "", label: "Select a category" },
      { value: "SOFTWARE", label: " Software Issue" },
      { value: "HARDWARE", label: " Hardware Problem" },
      { value: "NETWORK", label: " Network/Connectivity" },
      { value: "ELECTRICAL", label: " Electrical Issue" },
      { value: "CARPENTRY", label: " Carpentry/Woodwork" },
      { value: "PLUMBING", label: " Plumbing" },
      { value: "CLEANING", label: " Cleaning/Maintenance" },
      { value: "SECURITY", label: " Security Concern" },
      { value: "GENERAL", label: " General Support" },
    ],
    []
  );

  const LOCATION_OPTIONS = useMemo(
    () => [
      { value: "", label: "Select location" },
      { value: "MAIN_BUILDING", label: "Main Building" },
      { value: "ENGINEERING", label: "Engineering Block" },
      { value: "COMPUTING", label: "Computing Center" },
      { value: "LIBRARY", label: "Library" },
      { value: "ADMIN", label: "Administration" },
      { value: "AUDITORIUM", label: "Auditorium" },
      { value: "CAFETERIA", label: "Cafeteria" },
      { value: "HOSTEL", label: "Hostel Area" },
      { value: "OUTDOOR", label: "Outdoor Area" },
      { value: "OTHER", label: "Other" },
    ],
    []
  );

  const initialForm = {
    title: "",
    description: "",
    priority: "",
    reporterName: userName || localStorage.getItem("userName") || "",
    reporterEmail: userEmail || localStorage.getItem("userEmail") || "",
    location: "",
    category: "",
    contactNumber: "",
    incidentDate: "",
    attachments: [],
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [dateLimits, setDateLimits] = useState({ min: "", max: "" });
  const [fileError, setFileError] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set date limits on mount (like example)
  useEffect(() => {
    const today = new Date();
    const maxDate = today.toISOString().split("T")[0];

    const minDateObj = new Date();
    minDateObj.setDate(today.getDate() - 30);
    const minDate = minDateObj.toISOString().split("T")[0];

    setDateLimits({ min: minDate, max: maxDate });
    
    // Set default date to today if empty
    setForm((prev) => ({
      ...prev,
      incidentDate: prev.incidentDate || maxDate,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    
    // Special handling for contactNumber: only digits, max 10 characters (like example)
    if (name === "contactNumber") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    
    // Special handling for reporterName: only letters, spaces, hyphens, and apostrophes
    if (name === "reporterName") {
      // Allow letters, spaces, hyphens, apostrophes (for names like O'Connor, Mary-Jane)
      processedValue = value.replace(/[^a-zA-Z\s\-']/g, "");
      // Prevent multiple consecutive spaces
      processedValue = processedValue.replace(/\s{2,}/g, " ");
    }

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    setFileError("");
    const newFiles = Array.from(e.target.files || []);

    if (newFiles.length === 0) return;

    const invalidFiles = newFiles.filter((file) => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setFileError("Only image files are allowed. Please upload JPG, PNG, WEBP, or GIF files only.");
      e.target.value = "";
      return;
    }

    if (form.attachments.length + newFiles.length > 3) {
      setFileError("You can upload a maximum of 3 images only.");
      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }));
    e.target.value = "";
  };

  const removeAttachment = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, index) => index !== indexToRemove),
    }));
    setFileError("");
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      incidentDate: dateLimits.max || "",
      reporterName: userName || localStorage.getItem("userName") || "",
      reporterEmail: userEmail || localStorage.getItem("userEmail") || "",
    });
    setErrors({});
    setFileError("");
  };

  // Enhanced validation (like example)
  const validateForm = () => {
    const newErrors = {};

    // Name validation - enhanced with full name requirements
    if (!form.reporterName.trim()) {
      newErrors.reporterName = "Name is required.";
    } else {
      const name = form.reporterName.trim();
      
      // Check minimum length (at least 2 characters)
      if (name.length < 2) {
        newErrors.reporterName = "Name must be at least 2 characters.";
      }
      // Check for numbers (should not contain any digits)
      else if (/\d/.test(name)) {
        newErrors.reporterName = "Name cannot contain numbers.";
      }
      // Check for valid characters only (letters, spaces, hyphens, apostrophes)
      else if (!/^[a-zA-Z\s\-']+$/.test(name)) {
        newErrors.reporterName = "Name can only contain letters, spaces, hyphens, and apostrophes.";
      }
      // Ensure it's a full name (at least two words, e.g., "First Last")
      else {
        const nameParts = name.split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length < 2) {
          newErrors.reporterName = "Please enter your full name (first and last name).";
        }
        // Check each part is at least 2 characters
        else if (nameParts.some(part => part.length < 2)) {
          newErrors.reporterName = "Each part of your name must be at least 2 characters.";
        }
      }
    }

    if (!form.reporterEmail.trim()) {
      newErrors.reporterEmail = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reporterEmail)) {
      newErrors.reporterEmail = "Please enter a valid email address.";
    }

    if (!form.title.trim()) {
      newErrors.title = "Title is required.";
    } else if (form.title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (form.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters.";
    }

    if (!form.priority) {
      newErrors.priority = "Please select a priority level.";
    }

    if (!form.category) {
      newErrors.category = "Please select a category.";
    }

    if (!form.location) {
      newErrors.location = "Please select a location.";
    }

    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (form.contactNumber.length < 10) {
      newErrors.contactNumber = "Contact number must be 10 digits.";
    }

    if (!form.incidentDate) {
      newErrors.incidentDate = "Incident date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector(".field-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);

    try {
      const response = await createTicket(form);

      localStorage.setItem("userEmail", form.reporterEmail);
      localStorage.setItem("userName", form.reporterName);

      navigate("/ticket-success", {
        state: {
          ticketId: response.data.id,
          ticketTitle: response.data.title,
          ticketEmail: response.data.reporterEmail,
          newTicket: response.data,
        },
      });
    } catch (err) {
      console.error("Ticket creation failed:", err);
      if (err.response?.data && typeof err.response.data === "object") {
        setErrors(err.response.data);
      } else {
        setErrors({
          general:
            err.response?.data?.message ||
            "Failed to create ticket. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getImageText = () => {
    const count = form.attachments.length;
    if (count === 0) return "No images selected. You may upload up to 3 images.";
    if (count === 1) return "1 image selected.";
    return `${count} images selected.`;
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { background: #f6f7f8; color: #1c1c1c; font-family: Arial, sans-serif; }
        .page-shell { max-width: 1180px; margin: 0 auto; padding: 32px 24px 60px; }
        .report-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        .report-main { display: flex; flex-direction: column; gap: 18px; }
        .page-header, .form-card, .side-card, .premium-actions {
          background: #ffffff; border: 1px solid #edeff1; border-radius: 18px;
        }
        .page-header { padding: 28px 30px; }
        .eyebrow {
          display: inline-block; font-size: 13px; font-weight: 700; color: #2563eb;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .page-header h1 { font-size: 36px; line-height: 1.15; color: #111827; margin-bottom: 12px; }
        .page-header p { font-size: 16px; line-height: 1.7; color: #4b5563; max-width: 820px; }
        .form-card { padding: 26px 28px 30px; }
        .section-title { font-size: 21px; font-weight: 700; color: #111827; margin-bottom: 6px; }
        .section-subtitle { font-size: 14px; line-height: 1.6; color: #6b7280; margin-bottom: 22px; }
        .alert { margin-bottom: 16px; padding: 14px 16px; border-radius: 12px; font-size: 14px; font-weight: 600; line-height: 1.6; }
        .alert-error { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
        form { display: flex; flex-direction: column; gap: 24px; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .full-width { grid-column: 1 / -1; }
        label { font-size: 14px; font-weight: 700; color: #374151; }
        .required { color: #dc2626; margin-left: 3px; }
        input, select, textarea {
          width: 100%; border: 1px solid #d1d5db; border-radius: 12px; background: #ffffff;
          color: #111827; font-size: 15px; padding: 14px 15px; outline: none;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
        }
        input[readonly] { background: #f3f4f6; color: #4b5563; cursor: not-allowed; }
        textarea { resize: vertical; min-height: 170px; line-height: 1.6; }
        .hint { font-size: 12.5px; color: #6b7280; line-height: 1.5; }
        .upload-box { border: 1.5px dashed #cbd5e1; border-radius: 16px; background: #f9fafb; padding: 20px; }
        .inline-note { margin-top: 10px; font-size: 13px; color: #6b7280; line-height: 1.6; }
        .upload-trigger {
          border: 1px solid #d1d5db; background: #e0dfdf; color: #374151; font-size: 14px;
          font-weight: 600; padding: 10px 16px; border-radius: 999px; cursor: pointer;
        }
        .upload-trigger:disabled { background: #e5e7eb; color: #9ca3af; border-color: #e5e7eb; cursor: not-allowed; }
        .image-preview-container { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .image-preview-item {
          position: relative; width: 120px; height: 120px; border-radius: 14px; overflow: hidden;
          border: 1px solid #d1d5db; background: #ffffff;
        }
        .image-preview-item img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: zoom-in; }
        .remove-image-btn {
          position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border: none;
          border-radius: 999px; background: rgba(17, 24, 39, 0.88); color: #ffffff; font-size: 16px; cursor: pointer;
        }
        .file-error, .field-error { font-size: 13px; color: #dc2626; line-height: 1.5; font-weight: 600; }
        .action-row { display: flex; justify-content: flex-end; gap: 12px; padding-top: 4px; }
        .btn {
          border: none; border-radius: 999px; padding: 13px 22px; font-size: 14px;
          font-weight: 700; cursor: pointer;
        }
        .btn-secondary { background: #e5e7eb; color: #111827; }
        .btn-primary { background: #2563eb; color: #ffffff; box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .report-side { display: flex; flex-direction: column; gap: 18px; }
        .side-panel { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 18px; }
        .premium-actions {
          background: linear-gradient(145deg, #ffffff 0%, #f8fbff 100%);
          border: 1px solid #e6eef8; border-radius: 22px; padding: 22px 20px;
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.04);
        }
        .premium-actions h3, .side-card h3 { font-size: 17px; color: #111827; margin-bottom: 14px; }
        .premium-actions p { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 18px; }
        .action-links { display: flex; flex-direction: column; gap: 12px; }
        .action-link {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; text-decoration: none;
          color: #111827; padding: 14px 16px; border-radius: 16px; background: #ffffff; border: 1px solid #e5e7eb;
        }
        .action-link-title { font-size: 15px; font-weight: 700; color: #111827; }
        .action-link-sub { font-size: 12px; color: #6b7280; margin-top: 3px; }
        .action-arrow { font-size: 18px; color: #94a3b8; flex-shrink: 0; }
        .side-card { padding: 22px 20px; }
        .side-card ul { padding-left: 18px; color: #4b5563; }
        .side-card li { margin-bottom: 10px; line-height: 1.6; font-size: 14px; }
        .status-pill {
          display: inline-block; padding: 6px 10px; font-size: 12px; font-weight: 700;
          border-radius: 999px; background: #dbeafe; color: #1d4ed8; margin-right: 8px; margin-bottom: 8px;
        }
        .image-modal {
          display: flex; position: fixed; z-index: 9999; inset: 0; background: rgba(15, 23, 42, 0.92);
          align-items: center; justify-content: center; padding: 30px;
        }
        .image-modal-content { max-width: 90vw; max-height: 85vh; border-radius: 16px; object-fit: contain; background: #fff; }
        .image-modal-close {
          position: absolute; top: 18px; right: 24px; font-size: 40px; color: #fff; cursor: pointer; border: none; background: transparent;
        }
        @media (max-width: 1024px) {
          .report-layout { grid-template-columns: 1fr; }
          .report-side { order: -1; }
        }
        @media (max-width: 768px) {
          .page-shell { padding: 20px 14px 40px; }
          .page-header { padding: 22px 20px; }
          .page-header h1 { font-size: 29px; }
          .form-card { padding: 22px 18px 24px; }
          .form-grid { grid-template-columns: 1fr; }
          .action-row { flex-direction: column; }
          .btn { width: 100%; }
        }
      `}</style>

      <div className="page-shell">
        <div className="report-layout">
          <main className="report-main">
            <section className="page-header">
              <span className="eyebrow">Support Ticket</span>
              <h1>Create a Ticket</h1>
              <p>
                Submit a new support request by filling out the form below. 
                Provide clear details so our team can assist you faster and more effectively.
              </p>
            </section>

            <section className="form-card">
              <div className="section-title">Ticket Submission Form</div>
              <div className="section-subtitle">
                Fields marked with <span className="required">*</span> are required. 
                Your contact information helps us reach you with updates.
              </div>

              {errors.general && <div className="alert alert-error">{errors.general}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  {/* Name Field - Updated with validation */}
                  <div className="form-group">
                    <label>
                      Name<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="reporterName"
                      value={form.reporterName}
                      onChange={handleChange}
                      placeholder="Enter your full name (e.g., John Smith)"
                      autoComplete="name"
                    />
                    <div className="hint">First and last name required. Letters only.</div>
                    {errors.reporterName && (
                      <div className="field-error">{errors.reporterName}</div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="form-group">
                    <label>
                      Email<span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="reporterEmail"
                      value={form.reporterEmail}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                    {errors.reporterEmail && (
                      <div className="field-error">{errors.reporterEmail}</div>
                    )}
                  </div>

                  {/* Title Field */}
                  <div className="form-group full-width">
                    <label>
                      Issue Title<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      maxLength="120"
                      placeholder="Brief summary of your issue (e.g., 'Projector not working in Lab 3')"
                      value={form.title}
                      onChange={handleChange}
                    />
                    <div className="hint">Minimum 5 characters required.</div>
                    {errors.title && (
                      <div className="field-error">{errors.title}</div>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div className="form-group">
                    <label>
                      Category<span className="required">*</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <div className="field-error">{errors.category}</div>
                    )}
                  </div>

                  {/* Priority Dropdown */}
                  <div className="form-group">
                    <label>
                      Priority<span className="required">*</span>
                    </label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >
                      {PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.priority && (
                      <div className="field-error">{errors.priority}</div>
                    )}
                  </div>

                  {/* Location Dropdown */}
                  <div className="form-group">
                    <label>
                      Location<span className="required">*</span>
                    </label>
                    <select
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                    >
                      {LOCATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.location && (
                      <div className="field-error">{errors.location}</div>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="form-group">
                    <label>
                      Contact Number<span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="07XXXXXXXX"
                      value={form.contactNumber}
                      onChange={handleChange}
                      maxLength="10"
                    />
                    <div className="hint">10 digits only, no spaces or dashes.</div>
                    {errors.contactNumber && (
                      <div className="field-error">{errors.contactNumber}</div>
                    )}
                  </div>

                  {/* Incident Date */}
                  <div className="form-group">
                    <label>
                      Incident Date<span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      name="incidentDate"
                      min={dateLimits.min}
                      max={dateLimits.max}
                      value={form.incidentDate}
                      onChange={handleChange}
                    />
                    <div className="hint">Can select dates within the last 30 days.</div>
                    {errors.incidentDate && (
                      <div className="field-error">{errors.incidentDate}</div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="form-group full-width">
                    <label>
                      Description<span className="required">*</span>
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe your issue in detail. Include what happened, when it started, and how it's affecting your work."
                      value={form.description}
                      onChange={handleChange}
                      rows={5}
                    />
                    <div className="hint">
                      Be specific. Minimum 20 characters required. Clear descriptions help us resolve issues faster.
                    </div>
                    {errors.description && (
                      <div className="field-error">{errors.description}</div>
                    )}
                  </div>

                  {/* Attachments */}
                  <div className="form-group full-width">
                    <label>Upload Images</label>
                    <div className="upload-box">
                      <div className="image-preview-container">
                        {form.attachments.map((file, index) => (
                          <div
                            className="image-preview-item"
                            key={`${file.name}-${index}`}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Attachment ${index + 1}`}
                              onClick={() =>
                                setPreviewImage(URL.createObjectURL(file))
                              }
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeAttachment(index)}
                              aria-label={`Remove attachment ${index + 1}`}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleFileChange}
                      />

                      <button
                        type="button"
                        className="upload-trigger"
                        disabled={form.attachments.length >= 3}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {form.attachments.length >= 3
                          ? "Maximum Reached"
                          : "Choose Images"}
                      </button>

                      <div className="inline-note">{getImageText()}</div>
                      <div className="inline-note">
                        Supported files: JPG, PNG, WEBP, GIF. Max 3 images.
                      </div>

                      {fileError && (
                        <div className="file-error">{fileError}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="action-row">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </div>
              </form>
            </section>
          </main>

          <aside className="report-side">
            <div className="side-panel">
              <section className="premium-actions">
                <h3>Quick Links</h3>
                <p>Navigate to other sections or check your existing tickets.</p>

                <div className="action-links">
                  <Link to="/support" className="action-link">
                    <div>
                      <div className="action-link-title">Dashboard</div>
                      <div className="action-link-sub">Return to main page</div>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>

                  <Link to="/my-reports" className="action-link">
                    <div>
                      <div className="action-link-title">My Tickets</div>
                      <div className="action-link-sub">View your ticket history</div>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>

                  <Link to="/community-tickets" className="action-link">
                    <div>
                      <div className="action-link-title">Support Discussions</div>
                      <div className="action-link-sub">Explore common issues and useful support conversations</div>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                </div>
              </section>

              <section className="side-card">
                <h3>What happens next?</h3>
                <ul>
                  <li>Your ticket is logged into our support system.</li>
                  <li>Our team reviews the priority and category.</li>
                  <li>You'll receive email updates as we work on your issue.</li>
                  <li>Track progress anytime from "My Tickets".</li>
                </ul>
              </section>

              <section className="side-card">
                <h3>Ticket Statuses</h3>
                <span className="status-pill">Open</span>
                <span className="status-pill">In Progress</span>
                <span className="status-pill">Resolved</span>
                <span className="status-pill">Closed</span>
              </section>

              <section className="side-card">
                <h3>Tips for faster resolution</h3>
                <ul>
                  <li>Use a clear, descriptive title.</li>
                  <li>Select the correct category and priority.</li>
                  <li>Include specific location details.</li>
                  <li>Upload photos if the issue is visible.</li>
                  <li>Use "Urgent" priority only for critical issues.</li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="image-modal" onClick={() => setPreviewImage("")}>
          <button
            className="image-modal-close"
            onClick={() => setPreviewImage("")}
            aria-label="Close preview"
          >
            &times;
          </button>
          <img
            className="image-modal-content"
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}