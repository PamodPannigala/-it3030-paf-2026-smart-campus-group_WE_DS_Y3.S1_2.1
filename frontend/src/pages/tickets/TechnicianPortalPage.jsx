import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  getTicketById,
  addComment,
  editComment,
  deleteComment,
} from "../../services/ticketApi";

const BACKEND_URL = "http://localhost:8080";

export default function TechnicianPortalPage() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [technicianEmail, setTechnicianEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentTechnician, setCurrentTechnician] = useState(null);

  // Ticket management state
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  
  // Comment image upload state
  const [commentImages, setCommentImages] = useState([]);
  const [commentImagePreviews, setCommentImagePreviews] = useState([]);

  // Work management state
  const [resolutionNote, setResolutionNote] = useState("");
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [workStats, setWorkStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  const commentNodeRefs = useRef({});
  const fileInputRef = useRef(null);

  // Check for saved session on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("technicianEmail");
    if (savedEmail) {
      handleLogin(savedEmail);
    }
  }, []);

  // Login handler
  const handleLogin = async (email) => {
    try {
      setLoginLoading(true);
      const techRes = await axios.get(`${BACKEND_URL}/api/tickets/technicians/verify?email=${email}`);
      if (techRes.data) {
        setTechnicianEmail(email);
        setCurrentTechnician(techRes.data);
        setIsLoggedIn(true);
        localStorage.setItem("technicianEmail", email);
        loadTechnicianTickets(email);
      }
    } catch (err) {
      alert("Invalid technician email. Please contact admin.");
      console.error("Login error:", err);
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setTechnicianEmail("");
    setCurrentTechnician(null);
    setTickets([]);
    setSelectedTicket(null);
    localStorage.removeItem("technicianEmail");
  };

  // Load tickets assigned to technician
  const loadTechnicianTickets = async (email) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/tickets/technician?email=${email}`);
      const data = res.data || [];
      setTickets(data);
      
      setWorkStats({
        total: data.length,
        open: data.filter(t => t.status === "OPEN").length,
        inProgress: data.filter(t => t.status === "IN_PROGRESS" || t.status === "IN PROGRESS").length,
        resolved: data.filter(t => t.status === "RESOLVED").length,
        closed: data.filter(t => t.status === "CLOSED").length
      });

      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
    } catch (err) {
      console.error("Load tickets error:", err);
      alert("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  // Load ticket details
  const loadTicketDetails = async (id) => {
    if (!id) return;
    try {
      const [ticketRes, commentRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/tickets/${id}`),
        axios.get(`${BACKEND_URL}/api/tickets/${id}/comments`),
      ]);
      setSelectedTicket(ticketRes.data || null);
      setComments(commentRes.data || []);
    } catch (err) {
      console.error("Load details failed:", err);
    }
  };

  useEffect(() => {
    if (selectedTicketId && isLoggedIn) {
      loadTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId, isLoggedIn]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === "all" ? true : 
        t.status?.replace("_", " ") === statusFilter?.replace("_", " ");
      const searchLower = search.toLowerCase().trim();
      const blob = [
        t.title,
        t.description,
        t.reporterName,
        t.category,
        t.priority,
        t.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && blob.includes(searchLower);
    });
  }, [tickets, statusFilter, search]);

  // Update ticket status
  const updateTicketStatus = async (newStatus, resolution = "") => {
    if (!selectedTicket) return;
    
    try {
      setStatusUpdateLoading(true);
      const backendStatus = newStatus.replace(" ", "_");
      
      await axios.put(
        `${BACKEND_URL}/api/tickets/${selectedTicket.id}/status/TECHNICIAN?userName=${currentTechnician.name}`,
        {
          status: backendStatus,
          assignedTechnician: currentTechnician.name,
          resolutionNote: resolution
        }
      );

      await loadTechnicianTickets(technicianEmail);
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      setShowResolutionModal(false);
      setResolutionNote("");
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Handle image selection for comments
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 images total
    const totalImages = commentImages.length + files.length;
    if (totalImages > 5) {
      alert("Maximum 5 images allowed per comment");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setCommentImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove selected image
  const removeImage = (index) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
    setCommentImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all comment images
  const clearCommentImages = () => {
    setCommentImages([]);
    setCommentImagePreviews([]);
  };

  // Add comment as technician with images
  const sendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed && commentImages.length === 0) {
      alert("Please enter a comment or attach an image");
      return;
    }
    if (!selectedTicket) return;

    try {
      await addComment(
        selectedTicket.id,
        currentTechnician.name,
        trimmed,
        commentImages, // Pass the actual image files
        replyTo ? replyTo.id : null,
        "TECHNICIAN"
      );
      
      // Reset form
      setComment("");
      setReplyTo(null);
      clearCommentImages();
      
      await loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error(err);
      alert("Failed to send comment: " + (err.response?.data?.message || err.message));
    }
  };

  // Edit comment
  const saveEdit = async () => {
    if (!editText.trim() || !editingId || !selectedTicket) return;
    try {
      const res = await editComment(
        selectedTicket.id,
        editingId,
        currentTechnician.name,
        "TECHNICIAN",
        editText
      );
      setComments((prev) => prev.map((c) => (c.id === editingId ? res.data : c)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Failed to edit comment");
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!selectedTicket) return;
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(selectedTicket.id, commentId, currentTechnician.name, "TECHNICIAN");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete comment");
    }
  };

  // Format date
  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      const normalized = value.replace("T", " ").split(".")[0];
      const date = new Date(normalized);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "—";
    }
  };

  // Status configuration
  const statusConfig = {
    OPEN: { label: "Open", color: "#dc2626", bg: "#fee2e2", icon: "📥" },
    "IN PROGRESS": { label: "In Progress", color: "#d97706", bg: "#fef3c7", icon: "🔧" },
    IN_PROGRESS: { label: "In Progress", color: "#d97706", bg: "#fef3c7", icon: "🔧" },
    RESOLVED: { label: "Resolved", color: "#16a34a", bg: "#d1fae5", icon: "✅" },
    CLOSED: { label: "Closed", color: "#2563eb", bg: "#dbeafe", icon: "🔒" },
    REJECTED: { label: "Rejected", color: "#7c3aed", bg: "#ede9fe", icon: "❌" },
  };

  const getStatusStyle = (status) => statusConfig[status] || statusConfig.OPEN;

  // Get available status transitions for technician
  const getTechnicianTransitions = (currentStatus) => {
    const normalized = currentStatus?.replace("_", " ");
    const transitions = {
      "OPEN": [
        { status: "IN PROGRESS", label: "Start Work", icon: "🔧", color: "#f59e0b" },
      ],
      "IN PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", icon: "✅", color: "#16a34a", requiresResolution: true },
        { status: "OPEN", label: "Cannot Complete", icon: "↩️", color: "#6b7280" },
      ],
      "RESOLVED": [
        { status: "CLOSED", label: "Confirm Close", icon: "🔒", color: "#2563eb" },
        { status: "IN PROGRESS", label: "Reopen", icon: "🔧", color: "#f59e0b" },
      ],
    };
    return transitions[normalized] || [];
  };

  // Build comment tree
  const buildCommentTree = (list = []) => {
    const sorted = [...list].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt.replace("T", " ").split(".")[0]).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt.replace("T", " ").split(".")[0]).getTime() : 0;
      return bTime - aTime;
    });
    const map = new Map();
    sorted.forEach((c) => map.set(c.id, { ...c, replies: [] }));
    const roots = [];
    sorted.forEach((c) => {
      if (c.parentCommentId && map.has(c.parentCommentId)) {
        map.get(c.parentCommentId).replies.push(map.get(c.id));
      } else {
        roots.push(map.get(c.id));
      }
    });
    return roots;
  };

  // Render comment with images
  const renderComment = (c, level = 0) => {
    const isOwnComment = c.author === currentTechnician?.name;
    const commentImages = c.imageUrls || [];
    
    return (
      <div
        key={c.id}
        ref={(el) => { if (el) commentNodeRefs.current[c.id] = el; }}
        style={{
          marginLeft: level > 0 ? `${Math.min(level * 28, 84)}px` : "0px",
          borderLeft: level > 0 ? `3px solid #e5e7eb` : "none",
          paddingLeft: level > 0 ? "14px" : "0px",
          marginTop: level > 0 ? "14px" : "0px",
        }}
      >
        <div style={{ 
          background: c.authorRole === "TECHNICIAN" ? "#eff6ff" : "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ 
              fontWeight: "800", 
              color: c.authorRole === "TECHNICIAN" ? "#2563eb" : "#111827",
              fontSize: "14px"
            }}>
              {c.author || "Unknown"}
            </span>
            {c.authorRole === "TECHNICIAN" && (
              <span style={{ 
                background: "#2563eb", 
                color: "white", 
                padding: "2px 8px", 
                borderRadius: "999px", 
                fontSize: "10px",
                fontWeight: "700"
              }}>
                TECH
              </span>
            )}
            <span style={{ color: "#9ca3af" }}>•</span>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>{formatDateTime(c.createdAt)}</span>
          </div>

          {editingId === c.id ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ 
                  width: "100%", 
                  minHeight: "80px", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  border: "1px solid #d1d5db",
                  fontSize: "14px"
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button 
                  onClick={saveEdit}
                  style={{ padding: "8px 16px", borderRadius: "999px", border: "none", background: "#2563eb", color: "white", fontWeight: "700", cursor: "pointer" }}
                >
                  Save
                </button>
                <button 
                  onClick={() => { setEditingId(null); setEditText(""); }}
                  style={{ padding: "8px 16px", borderRadius: "999px", border: "1px solid #d1d5db", background: "#f3f4f6", color: "#374151", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#1f2937", whiteSpace: "pre-line" }}>
                {c.message || ""}
              </div>
              
              {/* Display comment images */}
              {commentImages.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px", marginTop: "12px" }}>
                  {commentImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={`${BACKEND_URL}${img}`}
                      alt={`Comment image ${idx + 1}`}
                      onClick={() => setPreviewImage(`${BACKEND_URL}${img}`)}
                      style={{ 
                        width: "100%", 
                        height: "100px", 
                        objectFit: "cover", 
                        borderRadius: "8px", 
                        cursor: "pointer",
                        border: "1px solid #e5e7eb"
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  onClick={() => setReplyTo(c)}
                  style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Reply
                </button>
                {isOwnComment && (
                  <>
                    <button
                      onClick={() => { setEditingId(c.id); setEditText(c.message || ""); }}
                      style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ border: "none", background: "transparent", color: "#dc2626", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {c.replies?.map((reply) => renderComment(reply, level + 1))}
      </div>
    );
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px"
      }}>
        <div style={{ 
          background: "white", 
          borderRadius: "24px", 
          padding: "48px", 
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              background: "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px"
            }}>
              🔧
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "900", color: "#111827" }}>
              Technician Portal
            </h1>
            <p style={{ color: "#6b7280", marginTop: "8px" }}>
              Enter your email to access your assigned tickets
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(loginEmail);
          }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: "700", 
                color: "#374151", 
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="technician@campus.edu"
                required
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "800",
                cursor: loginLoading ? "not-allowed" : "pointer",
                opacity: loginLoading ? 0.7 : 1
              }}
            >
              {loginLoading ? "Signing in..." : "Access My Tickets"}
            </button>
          </form>

          <p style={{ 
            textAlign: "center", 
            marginTop: "24px", 
            fontSize: "13px", 
            color: "#9ca3af" 
          }}>
            Contact admin if you need access
          </p>
        </div>
      </div>
    );
  }

  // Main Portal (Logged In)
  const ticketImages = selectedTicket?.imageUrls || [];
  const currentStatusStyle = getStatusStyle(selectedTicket?.status);
  const availableTransitions = selectedTicket ? getTechnicianTransitions(selectedTicket.status) : [];

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px", background: "#f5f7fb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "24px",
        background: "white",
        padding: "20px 24px",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            borderRadius: "50%", 
            background: "linear-gradient(145deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px"
          }}>
            👨‍🔧
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", color: "#111827" }}>
              {currentTechnician?.name}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
              {currentTechnician?.specialization} • {currentTechnician?.team}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ 
            background: currentTechnician?.status === "ACTIVE" ? "#d1fae5" : "#fef3c7",
            color: currentTechnician?.status === "ACTIVE" ? "#065f46" : "#92400e",
            padding: "8px 16px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "800"
          }}>
            ● {currentTechnician?.status}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "999px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Assigned", value: workStats.total, color: "#0f172a", bg: "#ffffff" },
          { label: "Open", value: workStats.open, color: "#dc2626", bg: "#fee2e2" },
          { label: "In Progress", value: workStats.inProgress, color: "#d97706", bg: "#fef3c7" },
          { label: "Resolved", value: workStats.resolved, color: "#16a34a", bg: "#d1fae5" },
          { label: "Closed", value: workStats.closed, color: "#2563eb", bg: "#dbeafe" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #e5e7eb"
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", marginBottom: "8px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        
        {/* Left Panel - Ticket List */}
        <div style={{ background: "#ffffff", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {["all", "OPEN", "IN PROGRESS", "RESOLVED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    background: statusFilter === status ? "#2563eb" : "#f3f4f6",
                    color: statusFilter === status ? "white" : "#6b7280"
                  }}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "999px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>
          
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                No tickets found
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const style = getStatusStyle(ticket.status);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid #e5e7eb",
                      cursor: "pointer",
                      background: selectedTicketId === ticket.id ? "#eff6ff" : "white",
                      borderLeft: selectedTicketId === ticket.id ? "4px solid #2563eb" : "4px solid transparent"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                      <span style={{ 
                        background: style.bg, 
                        color: style.color, 
                        padding: "4px 10px", 
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "800"
                      }}>
                        {style.icon} {style.label}
                      </span>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700", color: "#111827" }}>
                      {ticket.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                      {ticket.location} • {ticket.priority}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Ticket Details */}
        <div>
          {selectedTicket ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Ticket Header Card */}
              <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "900", color: "#111827" }}>
                      {selectedTicket.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                      Reported by <strong>{selectedTicket.reporterName}</strong> • {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <span style={{ 
                    background: currentStatusStyle.bg, 
                    color: currentStatusStyle.color, 
                    padding: "8px 16px", 
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "800"
                  }}>
                    {currentStatusStyle.icon} {currentStatusStyle.label}
                  </span>
                </div>

                {/* Quick Actions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
                  {availableTransitions.map((t) => (
                    <button
                      key={t.status}
                      onClick={() => {
                        if (t.requiresResolution) {
                          setShowResolutionModal(true);
                        } else {
                          if (window.confirm(`Change status to ${t.status}?`)) {
                            updateTicketStatus(t.status);
                          }
                        }
                      }}
                      disabled={statusUpdateLoading}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "999px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: "800",
                        cursor: statusUpdateLoading ? "not-allowed" : "pointer",
                        background: t.color,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        opacity: statusUpdateLoading ? 0.7 : 1
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                  📝 Description
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: "15px", 
                  lineHeight: "1.7", 
                  color: "#374151",
                  background: "#f9fafb",
                  padding: "16px",
                  borderRadius: "12px",
                  whiteSpace: "pre-line"
                }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Ticket Info */}
              <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                  📋 Ticket Details
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Category", value: selectedTicket.category },
                    { label: "Priority", value: selectedTicket.priority },
                    { label: "Location", value: selectedTicket.location },
                    { label: "Reporter", value: selectedTicket.reporterEmail },
                    { label: "Contact", value: selectedTicket.contactNumber || "—" },
                    { label: "Incident Date", value: formatDateTime(selectedTicket.incidentDate) },
                  ].map((item) => (
                    <div key={item.label} style={{ background: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              {ticketImages.length > 0 && (
                <div style={{ 
                  background: "white", 
                  borderRadius: "16px", 
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                    📷 Attachments ({ticketImages.length})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {ticketImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={`${BACKEND_URL}${img}`}
                        alt=""
                        onClick={() => setPreviewImage(`${BACKEND_URL}${img}`)}
                        style={{ 
                          width: "100%", 
                          height: "120px", 
                          objectFit: "cover", 
                          borderRadius: "12px", 
                          cursor: "pointer" 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section with Image Upload */}
              <div style={{ 
                background: "white", 
                borderRadius: "16px", 
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                  💬 Comments ({comments.length})
                </h3>

                {replyTo && (
                  <div style={{ 
                    background: "#eff6ff", 
                    border: "1px solid #bfdbfe",
                    borderRadius: "12px", 
                    padding: "12px 16px", 
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>
                      Replying to <strong>{replyTo.author}</strong>
                    </span>
                    <button 
                      onClick={() => setReplyTo(null)}
                      style={{ 
                        border: "none", 
                        background: "transparent", 
                        color: "#6b7280", 
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "700"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Comment Input with Image Upload */}
                <div style={{ marginBottom: "20px" }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment or update..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "14px",
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                  
                  {/* Image Upload Section */}
                  <div style={{ marginTop: "12px" }}>
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                    />
                    
                    {/* Image Previews */}
                    {commentImagePreviews.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                        {commentImagePreviews.map((preview, idx) => (
                          <div key={idx} style={{ position: "relative" }}>
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb"
                              }}
                            />
                            <button
                              onClick={() => removeImage(idx)}
                              style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "#dc2626",
                                color: "white",
                                border: "none",
                                fontSize: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={commentImages.length >= 5}
                          style={{
                            padding: "8px 16px",
                            background: commentImages.length >= 5 ? "#f3f4f6" : "#f3f4f6",
                            color: commentImages.length >= 5 ? "#9ca3af" : "#374151",
                            border: "1px solid #d1d5db",
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: commentImages.length >= 5 ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          📷 Attach Image {commentImages.length > 0 && `(${commentImages.length}/5)`}
                        </button>
                        
                        {commentImages.length > 0 && (
                          <button
                            onClick={clearCommentImages}
                            style={{
                              padding: "8px 16px",
                              background: "transparent",
                              color: "#dc2626",
                              border: "none",
                              fontSize: "13px",
                              fontWeight: "700",
                              cursor: "pointer"
                            }}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={sendComment}
                        disabled={!comment.trim() && commentImages.length === 0}
                        style={{
                          padding: "12px 24px",
                          background: (comment.trim() || commentImages.length > 0) ? "#2563eb" : "#9ca3af",
                          color: "white",
                          border: "none",
                          borderRadius: "999px",
                          fontSize: "14px",
                          fontWeight: "800",
                          cursor: (comment.trim() || commentImages.length > 0) ? "pointer" : "not-allowed"
                        }}
                      >
                        {replyTo ? "Send Reply" : "Post Comment"}
                      </button>
                    </div>
                    
                    <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
                      Max 5 images, 5MB each. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {comments.length === 0 ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "40px", 
                      color: "#6b7280",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      border: "2px dashed #e5e7eb"
                    }}>
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    buildCommentTree(comments).map((c) => renderComment(c))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: "white", 
              borderRadius: "16px", 
              padding: "60px",
              textAlign: "center",
              color: "#6b7280"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Select a ticket</h3>
              <p style={{ marginTop: "8px" }}>Choose a ticket from the list to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "500px"
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "900" }}>
              ✅ Mark as Resolved
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Please provide resolution notes before marking this ticket as resolved.
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Describe how you resolved this issue..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                marginBottom: "20px"
              }}
            />
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => updateTicketStatus("RESOLVED", resolutionNote)}
                disabled={!resolutionNote.trim() || statusUpdateLoading}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: resolutionNote.trim() ? "#16a34a" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: resolutionNote.trim() ? "pointer" : "not-allowed"
                }}
              >
                {statusUpdateLoading ? "Updating..." : "Confirm Resolution"}
              </button>
              <button
                onClick={() => {
                  setShowResolutionModal(false);
                  setResolutionNote("");
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage("")}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "40px"
          }}
        >
          <button
            onClick={() => setPreviewImage("")}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              fontSize: "40px",
              color: "white",
              background: "transparent",
              border: "none",
              cursor: "pointer"
            }}
          >
            ×
          </button>
          <img 
            src={previewImage} 
            alt="" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px" }}
          />
        </div>
      )}
    </div>
  );
}