// src/pages/tickets/CreateTicket.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../../services/ticketApi";
import "../../styles/CreateTicket.css";

export default function CreateTicket({ userName = "", userEmail = "" }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const initialForm = {
    title: "",
    description: "",
    priority: "LOW",
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
  const [fileError, setFileError] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.some((f) => !f.type.startsWith("image/"))) {
      setFileError("Only image files are allowed.");
      e.target.value = "";
      return;
    }

    if (form.attachments.length + files.length > 3) {
      setFileError("You can upload a maximum of 3 images only.");
      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));

    setFileError("");
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
    setFileError("");
  };

  const validateForm = () => {
    const errs = {};

    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (!form.category.trim()) errs.category = "Category is required.";
    if (!form.contactNumber.trim())
      errs.contactNumber = "Contact Number is required.";
    if (!form.incidentDate) errs.incidentDate = "Incident Date is required.";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      // ✅ SEND NORMAL OBJECT ONLY
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

      setErrors({
        general:
          err.response?.data?.message ||
          "Failed to create ticket. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setFileError("");
    setPreviewImage("");
  };

  return (
    <div className="page-shell">
      <div className="form-card">
        <h2>Create a Ticket</h2>
        <p>Fill in the details below to submit a new support ticket.</p>

        {errors.general && (
          <div className="alert-error">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name*</label>
              <input
                type="text"
                name="reporterName"
                value={form.reporterName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email*</label>
              <input
                type="email"
                name="reporterEmail"
                value={form.reporterEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && (
                <div className="field-error">{errors.title}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Description*</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && (
                <div className="field-error">{errors.description}</div>
              )}
            </div>

            <div className="form-group">
              <label>Priority*</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location*</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
              />
              {errors.location && (
                <div className="field-error">{errors.location}</div>
              )}
            </div>

            <div className="form-group">
              <label>Category*</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
              />
              {errors.category && (
                <div className="field-error">{errors.category}</div>
              )}
            </div>

            <div className="form-group">
              <label>Contact Number*</label>
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
              />
              {errors.contactNumber && (
                <div className="field-error">{errors.contactNumber}</div>
              )}
            </div>

            <div className="form-group">
              <label>Incident Date*</label>
              <input
                type="date"
                name="incidentDate"
                value={form.incidentDate}
                onChange={handleChange}
              />
              {errors.incidentDate && (
                <div className="field-error">{errors.incidentDate}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Attachments</label>
              <div className="upload-box">
                <div className="image-preview-container">
                  {form.attachments.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file);

                    return (
                      <div
                        className="image-preview-item"
                        key={`${file.name}-${idx}`}
                      >
                        <img
                          src={previewUrl}
                          alt="preview"
                          onClick={() => setPreviewImage(previewUrl)}
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeAttachment(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
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
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current.click()}
                  disabled={form.attachments.length >= 3}
                >
                  {form.attachments.length >= 3
                    ? "Maximum Reached"
                    : "Choose Images"}
                </button>

                {fileError && (
                  <div className="field-error">{fileError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
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
      </div>

      {previewImage && (
        <div
          className="image-modal"
          onClick={() => setPreviewImage("")}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "80%",
              maxHeight: "80%",
              borderRadius: "12px",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={() => setPreviewImage("")}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              fontSize: "28px",
              color: "#fff",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}