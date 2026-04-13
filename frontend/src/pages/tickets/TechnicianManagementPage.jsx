import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

export default function TechnicianManagementPage() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    team: "",
    status: "ACTIVE"
  });

  // Load all technicians
  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/tickets/technicians`);
      setTechnicians(res.data || []);
    } catch (err) {
      console.error("Load technicians error:", err);
      alert("Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add new technician
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/tickets/technicians`, formData);
      alert("Technician added successfully!");
      setShowAddForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        team: "",
        status: "ACTIVE"
      });
      loadTechnicians();
    } catch (err) {
      console.error("Add technician error:", err);
      alert("Failed to add technician: " + (err.response?.data?.message || err.message));
    }
  };

  // Update technician
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BACKEND_URL}/api/tickets/technicians/${editingTech.id}`, formData);
      alert("Technician updated successfully!");
      setEditingTech(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        team: "",
        status: "ACTIVE"
      });
      loadTechnicians();
    } catch (err) {
      console.error("Update technician error:", err);
      alert("Failed to update technician: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete technician
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this technician?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/tickets/technicians/${id}`);
      alert("Technician deleted successfully!");
      loadTechnicians();
    } catch (err) {
      console.error("Delete technician error:", err);
      alert("Failed to delete technician: " + (err.response?.data?.message || err.message));
    }
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
    setShowAddForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setShowAddForm(false);
    setEditingTech(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      team: "",
      status: "ACTIVE"
    });
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading technicians...</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px", background: "#f5f7fb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: 0 }}>🔧 Technician Management</h1>
          <p style={{ color: "#64748b", marginTop: "8px" }}>Manage your technical support team</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "14px 24px",
            fontSize: "14px",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          + Add Technician
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={{ 
          background: "white", 
          borderRadius: "20px", 
          padding: "24px", 
          marginBottom: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "800" }}>
            {editingTech ? "Edit Technician" : "Add New Technician"}
          </h3>
          <form onSubmit={editingTech ? handleUpdateSubmit : handleAddSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  <option value="">Select Specialization</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network">Network</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="HVAC">HVAC</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Team
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  <option value="">Select Team</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="submit"
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                {editingTech ? "Update Technician" : "Add Technician"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "999px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Technicians List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {technicians.map((tech) => (
          <div
            key={tech.id}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "20px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: tech.status === "ACTIVE" ? "#10b981" : tech.status === "BUSY" ? "#f59e0b" : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "white",
                fontWeight: "700"
              }}>
                {tech.name?.charAt(0)?.toUpperCase() || "T"}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#111827" }}>{tech.name}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>{tech.email}</p>
              </div>
              <span style={{
                background: tech.status === "ACTIVE" ? "#d1fae5" : tech.status === "BUSY" ? "#fef3c7" : "#f3f4f6",
                color: tech.status === "ACTIVE" ? "#065f46" : tech.status === "BUSY" ? "#92400e" : "#374151",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase"
              }}>
                {tech.status}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>Specialization</div>
                <div style={{ fontSize: "14px", color: "#111827", fontWeight: "600", marginTop: "4px" }}>{tech.specialization || "—"}</div>
              </div>
              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "700", textTransform: "uppercase" }}>Team</div>
                <div style={{ fontSize: "14px", color: "#111827", fontWeight: "600", marginTop: "4px" }}>{tech.team || "—"}</div>
              </div>
            </div>

            {tech.phone && (
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
                📞 {tech.phone}
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => startEdit(tech)}
                style={{
                  flex: 1,
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: "999px",
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(tech.id)}
                style={{
                  flex: 1,
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "999px",
                  padding: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {technicians.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔧</div>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>No Technicians Yet</h3>
          <p style={{ marginTop: "8px" }}>Add your first technician to get started</p>
        </div>
      )}
    </div>
  );
}