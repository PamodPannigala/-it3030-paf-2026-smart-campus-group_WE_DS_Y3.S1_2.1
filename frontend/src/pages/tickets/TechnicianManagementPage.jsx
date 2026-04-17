import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

// Status configuration for consistent styling
const STATUS_CONFIG = {
  ACTIVE: { color: "#10b981", bg: "#d1fae5", text: "#065f46", label: "Active" },
  BUSY: { color: "#f59e0b", bg: "#fef3c7", text: "#92400e", label: "Busy" },
  OFFLINE: { color: "#6b7280", bg: "#f3f4f6", text: "#374151", label: "Offline" },
  ON_LEAVE: { color: "#8b5cf6", bg: "#ede9fe", text: "#5b21b6", label: "On Leave" }
};

// Specialization options
const SPECIALIZATIONS = [
  { value: "", label: "Select Specialization" },
  { value: "Hardware", label: "Hardware" },
  { value: "Software", label: "Software" },
  { value: "Network", label: "Network" },
  { value: "Electrical", label: "Electrical" },
  { value: "Plumbing", label: "Plumbing" },
  { value: "Carpentry", label: "Carpentry" },
  { value: "HVAC", label: "HVAC" },
  { value: "General", label: "General" }
];

// Team options
const TEAMS = [
  { value: "", label: "Select Team" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "IT Support", label: "IT Support" },
  { value: "Facilities", label: "Facilities" },
  { value: "Security", label: "Security" },
  { value: "Cleaning", label: "Cleaning" }
];

// Validation rules
const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address"
  },
  phone: {
    required: false,
    pattern: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    message: "Please enter a valid phone number"
  },
  specialization: {
    required: false
  },
  team: {
    required: false
  },
  status: {
    required: true
  }
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6"
  };

  return (
    <div style={{
      position: "fixed",
      top: "24px",
      right: "24px",
      background: "white",
      borderLeft: `4px solid ${colors[type] || colors.info}`,
      borderRadius: "8px",
      padding: "16px 20px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 1000,
      animation: "slideIn 0.3s ease-out",
      minWidth: "300px"
    }}>
      <span style={{ fontSize: "20px" }}>
        {type === "success" && "✅"}
        {type === "error" && "❌"}
        {type === "warning" && "⚠️"}
        {type === "info" && "ℹ️"}
      </span>
      <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>{message}</span>
      <button onClick={onClose} style={{
        marginLeft: "auto",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "18px",
        color: "#9ca3af"
      }}>×</button>
    </div>
  );
};

// Modal component for confirmations
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const colors = {
    danger: { bg: "#dc2626", hover: "#b91c1c", light: "#fef2f2" },
    warning: { bg: "#f59e0b", hover: "#d97706", light: "#fffbeb" },
    info: { bg: "#2563eb", hover: "#1d4ed8", light: "#eff6ff" }
  };

  const theme = colors[type] || colors.danger;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "400px",
        width: "90%",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        animation: "modalSlideIn 0.2s ease-out"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: theme.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          fontSize: "24px"
        }}>
          {type === "danger" && "🗑️"}
          {type === "warning" && "⚠️"}
          {type === "info" && "ℹ️"}
        </div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "700", color: "#111827" }}>{title}</h3>
        <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: theme.bg,
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const SkeletonCard = () => (
  <div style={{
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
      <div style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite"
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: "20px",
          width: "60%",
          borderRadius: "4px",
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          marginBottom: "8px"
        }} />
        <div style={{
          height: "14px",
          width: "40%",
          borderRadius: "4px",
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite"
        }} />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
      <div style={{
        height: "60px",
        borderRadius: "8px",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite"
      }} />
      <div style={{
        height: "60px",
        borderRadius: "8px",
        background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite"
      }} />
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ onAction }) => (
  <div style={{
    textAlign: "center",
    padding: "80px 40px",
    background: "white",
    borderRadius: "20px",
    border: "2px dashed #e5e7eb"
  }}>
    <div style={{
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
      fontSize: "40px"
    }}>
      🔧
    </div>
    <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", fontWeight: "700", color: "#111827" }}>
      No Technicians Found
    </h3>
    <p style={{ margin: "0 0 24px 0", fontSize: "15px", color: "#6b7280", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
      Get started by adding your first technician to manage your technical support team effectively.
    </p>
    <button
      onClick={onAction}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "999px",
        padding: "14px 28px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        transition: "all 0.2s",
        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
      }}
    >
      <span>+</span> Add First Technician
    </button>
  </div>
);

// Form input component with validation
const FormInput = ({ label, name, type = "text", value, onChange, error, required, placeholder, icon, ...props }) => (
  <div style={{ marginBottom: error ? "8px" : "0" }}>
    <label style={{
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "6px"
    }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#9ca3af",
          fontSize: "16px"
        }}>{icon}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: icon ? "12px 12px 12px 40px" : "12px",
          border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`,
          borderRadius: "10px",
          fontSize: "14px",
          transition: "all 0.2s",
          outline: "none",
          boxSizing: "border-box",
          backgroundColor: error ? "#fef2f2" : "white"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? "#ef4444" : "#2563eb";
          e.target.style.boxShadow = error 
            ? "0 0 0 3px rgba(239, 68, 68, 0.1)" 
            : "0 0 0 3px rgba(37, 99, 235, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />
    </div>
    {error && (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "6px",
        fontSize: "12px",
        color: "#ef4444"
      }}>
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Form select component with validation
const FormSelect = ({ label, name, value, onChange, options, error, required, icon }) => (
  <div style={{ marginBottom: error ? "8px" : "0" }}>
    <label style={{
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#374151",
      marginBottom: "6px"
    }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#9ca3af",
          fontSize: "16px"
        }}>{icon}</span>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: icon ? "12px 40px 12px 40px" : "12px 40px 12px 12px",
          border: `2px solid ${error ? "#ef4444" : "#e5e7eb"}`,
          borderRadius: "10px",
          fontSize: "14px",
          backgroundColor: error ? "#fef2f2" : "white",
          cursor: "pointer",
          appearance: "none",
          transition: "all 0.2s",
          outline: "none",
          boxSizing: "border-box"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? "#ef4444" : "#2563eb";
          e.target.style.boxShadow = error 
            ? "0 0 0 3px rgba(239, 68, 68, 0.1)" 
            : "0 0 0 3px rgba(37, 99, 235, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#ef4444" : "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#9ca3af",
        fontSize: "12px",
        pointerEvents: "none"
      }}>▼</span>
    </div>
    {error && (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "6px",
        fontSize: "12px",
        color: "#ef4444"
      }}>
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    )}
  </div>
);

// Stats card component
const StatCard = ({ label, value, icon, trend, trendUp }) => (
  <div style={{
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  }}>
    <div style={{
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      background: "#eff6ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px"
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>{value}</div>
      {trend && (
        <div style={{
          fontSize: "12px",
          color: trendUp ? "#10b981" : "#ef4444",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          gap: "2px"
        }}>
          {trendUp ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
  </div>
);

export default function TechnicianManagementPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, techId: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    team: "",
    status: "ACTIVE"
  });

  // Validation function
  const validateField = useCallback((name, value) => {
    const rule = VALIDATION_RULES[name];
    if (!rule) return null;

    if (rule.required && (!value || value.toString().trim() === "")) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      return `${name} must be at least ${rule.minLength} characters`;
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      return `${name} must be no more than ${rule.maxLength} characters`;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    return null;
  }, []);

  // Validate all form fields
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    return { isValid, errors };
  }, [formData, validateField]);

  // Show toast notification
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  // Load all technicians
  const loadTechnicians = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/tickets/technicians`);
      setTechnicians(res.data || []);
    } catch (err) {
      console.error("Load technicians error:", err);
      showToast("Failed to load technicians", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  // Handle form input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  // Add new technician
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(VALIDATION_RULES).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const { isValid, errors } = validateForm();
    setFormErrors(errors);

    if (!isValid) {
      showToast("Please fix the form errors", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/tickets/technicians`, formData);
      showToast("Technician added successfully!", "success");
      setShowAddForm(false);
      resetForm();
      loadTechnicians();
    } catch (err) {
      console.error("Add technician error:", err);
      showToast("Failed to add technician: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update technician
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(VALIDATION_RULES).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const { isValid, errors } = validateForm();
    setFormErrors(errors);

    if (!isValid) {
      showToast("Please fix the form errors", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.put(`${BACKEND_URL}/api/tickets/technicians/${editingTech.id}`, formData);
      showToast("Technician updated successfully!", "success");
      setShowAddForm(false);
      setEditingTech(null);
      resetForm();
      loadTechnicians();
    } catch (err) {
      console.error("Update technician error:", err);
      showToast("Failed to update technician: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete technician
  const handleDelete = async (id) => {
    setConfirmModal({ isOpen: true, techId: id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.techId) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/tickets/technicians/${confirmModal.techId}`);
      showToast("Technician deleted successfully!", "success");
      loadTechnicians();
    } catch (err) {
      console.error("Delete technician error:", err);
      showToast("Failed to delete technician: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setConfirmModal({ isOpen: false, techId: null });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      team: "",
      status: "ACTIVE"
    });
    setFormErrors({});
    setTouched({});
  };

  // Start editing
  const startEdit = (tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone || "",
      specialization: tech.specialization || "",
      team: tech.team || "",
      status: tech.status || "ACTIVE"
    });
    setFormErrors({});
    setTouched({});
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingTech(null);
    resetForm();
  };

  // Filter and search technicians
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = searchTerm === "" || 
      tech.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.team?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || tech.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: technicians.length,
    active: technicians.filter(t => t.status === "ACTIVE").length,
    busy: technicians.filter(t => t.status === "BUSY").length,
    onLeave: technicians.filter(t => t.status === "ON_LEAVE").length
  };

  // Add CSS animations
  const styles = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes modalSlideIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;

  return (
    <div style={{ 
      maxWidth: "1400px", 
      margin: "0 auto", 
      padding: "32px", 
      background: "#f8fafc", 
      minHeight: "100vh",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <style>{styles}</style>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Technician"
        message="Are you sure you want to delete this technician? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, techId: null })}
        confirmText="Delete"
        type="danger"
      />

      {/* Header Section */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "800", 
              color: "#0f172a", 
              margin: "0 0 8px 0",
              letterSpacing: "-0.025em"
            }}>
              Technician Management
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "15px" }}>
              Manage your technical support team and track their availability
            </p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={showAddForm}
            style={{
              background: showAddForm ? "#9ca3af" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: showAddForm ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              boxShadow: showAddForm ? "none" : "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
            }}
          >
            <span style={{ fontSize: "18px" }}>+</span>
            Add Technician
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "16px",
          marginBottom: "24px"
        }}>
          <StatCard label="Total Technicians" value={stats.total} icon="👥" />
          <StatCard label="Active" value={stats.active} icon="✅" trend={`${Math.round((stats.active / stats.total) * 100) || 0}%`} trendUp={true} />
          <StatCard label="Busy" value={stats.busy} icon="🔴" />
          <StatCard label="On Leave" value={stats.onLeave} icon="🏖️" />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{ 
          background: "white", 
          borderRadius: "16px", 
          padding: "28px", 
          marginBottom: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e5e7eb",
          animation: "modalSlideIn 0.3s ease-out"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                {editingTech ? "Edit Technician" : "Add New Technician"}
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                {editingTech ? "Update the technician details below" : "Fill in the details to add a new technician"}
              </p>
            </div>
            <button
              onClick={cancelForm}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "4px",
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={editingTech ? handleUpdateSubmit : handleAddSubmit}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "20px" 
            }}>
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={formErrors.name}
                required
                placeholder="Enter full name"
                icon="👤"
              />
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={formErrors.email}
                required
                placeholder="name@company.com"
                icon="✉️"
              />
              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={formErrors.phone}
                placeholder="+1 (555) 123-4567"
                icon="📞"
              />
              <FormSelect
                label="Specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                options={SPECIALIZATIONS}
                icon="🎯"
              />
              <FormSelect
                label="Team"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
                options={TEAMS}
                icon="🏢"
              />
              <FormSelect
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "BUSY", label: "Busy" },
                  { value: "OFFLINE", label: "Offline" },
                  { value: "ON_LEAVE", label: "On Leave" }
                ]}
                required
                icon="📊"
              />
            </div>

            <div style={{ 
              display: "flex", 
              gap: "12px", 
              marginTop: "28px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb"
            }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? "#93c5fd" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ 
                      width: "16px", 
                      height: "16px", 
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    {editingTech ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <span>{editingTech ? "💾" : "✓"}</span>
                    {editingTech ? "Update Technician" : "Add Technician"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                disabled={isSubmitting}
                style={{
                  background: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div style={{ 
        display: "flex", 
        gap: "16px", 
        marginBottom: "24px",
        flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "16px"
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, specialization, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
              boxSizing: "border-box"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "12px 40px 12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            fontSize: "14px",
            background: "white",
            cursor: "pointer",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center"
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="BUSY">Busy</option>
          <option value="OFFLINE">Offline</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </div>

      {/* Technicians Grid */}
      {loading ? (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
          gap: "20px" 
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredTechnicians.length === 0 ? (
        technicians.length === 0 ? (
          <EmptyState onAction={() => setShowAddForm(true)} />
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "60px", 
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>
              No results found
            </h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
          gap: "20px" 
        }}>
          {filteredTechnicians.map((tech) => {
            const statusConfig = STATUS_CONFIG[tech.status] || STATUS_CONFIG.OFFLINE;
            return (
              <div
                key={tech.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Status indicator bar */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: statusConfig.color
                }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${statusConfig.color}20, ${statusConfig.color}40)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: statusConfig.color,
                    fontWeight: "700",
                    border: `3px solid ${statusConfig.color}30`,
                    flexShrink: 0
                  }}>
                    {tech.name?.charAt(0)?.toUpperCase() || "T"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: "18px", 
                        fontWeight: "700", 
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {tech.name}
                      </h3>
                    </div>
                    <p style={{ 
                      margin: "0 0 8px 0", 
                      fontSize: "13px", 
                      color: "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {tech.email}
                    </p>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: statusConfig.bg,
                      color: statusConfig.text,
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.025em"
                    }}>
                      <span style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: statusConfig.color
                      }} />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "12px", 
                  marginBottom: "16px" 
                }}>
                  <div style={{ 
                    background: "#f8fafc", 
                    padding: "12px", 
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#64748b", 
                      fontWeight: "600", 
                      textTransform: "uppercase",
                      letterSpacing: "0.025em",
                      marginBottom: "4px"
                    }}>
                      Specialization
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#111827", 
                      fontWeight: "600"
                    }}>
                      {tech.specialization || "—"}
                    </div>
                  </div>
                  <div style={{ 
                    background: "#f8fafc", 
                    padding: "12px", 
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#64748b", 
                      fontWeight: "600", 
                      textTransform: "uppercase",
                      letterSpacing: "0.025em",
                      marginBottom: "4px"
                    }}>
                      Team
                    </div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#111827", 
                      fontWeight: "600"
                    }}>
                      {tech.team || "—"}
                    </div>
                  </div>
                </div>

                {tech.phone && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    fontSize: "13px", 
                    color: "#6b7280",
                    marginBottom: "16px",
                    padding: "8px 12px",
                    background: "#f8fafc",
                    borderRadius: "8px"
                  }}>
                    <span style={{ fontSize: "14px" }}>📞</span>
                    <span style={{ fontWeight: "500", color: "#374151" }}>{tech.phone}</span>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => startEdit(tech)}
                    style={{
                      flex: 1,
                      background: "#eff6ff",
                      color: "#2563eb",
                      border: "1px solid #dbeafe",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#dbeafe";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#eff6ff";
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tech.id)}
                    style={{
                      flex: 1,
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#fecaca";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fef2f2";
                    }}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredTechnicians.length > 0 && (
        <div style={{ 
          marginTop: "24px", 
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280"
        }}>
          Showing {filteredTechnicians.length} of {technicians.length} technicians
        </div>
      )}
    </div>
  );
}
