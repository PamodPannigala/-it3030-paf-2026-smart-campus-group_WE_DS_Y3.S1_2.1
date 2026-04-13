import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  addComment,
  editComment,
  deleteComment,
} from "../../services/ticketApi";

const BACKEND_URL = "http://localhost:8080";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  
  // ✅ ADDED: Technicians state
  const [technicians, setTechnicians] = useState([]);
  const [assigningTechnician, setAssigningTechnician] = useState(false);

  const commentNodeRefs = useRef({});
  const adminEmail = "Admin";
  const adminRole = "ADMIN";

  console.log("AdminTicketsPage rendering...");

  // ✅ ADDED: Load all technicians
  const loadTechnicians = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tickets/technicians`);
      setTechnicians(res.data || []);
    } catch (err) {
      console.error("Load technicians error:", err);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllTickets();
      const data = res.data || [];
      console.log("Tickets loaded:", data.length);
      setTickets(data);

      if (data.length > 0) {
        const firstVisible = data.find((t) => t.status === statusFilter) || data[0];
        setSelectedTicketId((prev) => prev ?? firstVisible.id);
      }
    } catch (err) {
      console.error("Load tickets error:", err);
      alert("Failed to load tickets: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect - loading tickets and technicians");
    loadTickets();
    loadTechnicians(); // ✅ Load technicians on mount
  }, []);

  const loadTicketDetails = async (id) => {
    if (!id) return;
    try {
      const [ticketRes, commentRes] = await Promise.all([
        getTicketById(id),
        axios.get(`${BACKEND_URL}/api/tickets/${id}/comments`),
      ]);
      console.log("Ticket details loaded:", ticketRes.data);
      setSelectedTicket(ticketRes.data || null);
      setComments(commentRes.data || []);
    } catch (err) {
      console.error("Load details failed:", err);
    }
  };

  useEffect(() => {
    loadTicketDetails(selectedTicketId);
  }, [selectedTicketId]);

  // ✅ FIXED: Normalize status for comparison (handle both IN_PROGRESS and IN PROGRESS)
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const ticketStatus = t.status?.replace("_", " ") || t.status;
      const filterStatus = statusFilter?.replace("_", " ") || statusFilter;
      
      const matchesStatus = filterStatus === "all" ? true : ticketStatus === filterStatus;
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

  useEffect(() => {
    if (!filteredTickets.some((t) => t.id === selectedTicketId)) {
      setSelectedTicketId(filteredTickets[0]?.id ?? null);
    }
  }, [filteredTickets, selectedTicketId]);

  // ✅ ADDED: Map display status to backend enum value
  const getBackendStatusValue = (displayStatus) => {
    const statusMap = {
      "OPEN": "OPEN",
      "IN PROGRESS": "IN_PROGRESS",
      "IN_PROGRESS": "IN_PROGRESS",
      "RESOLVED": "RESOLVED",
      "CLOSED": "CLOSED",
      "REJECTED": "REJECTED",
      "REPAIRED": "REPAIRED"
    };
    return statusMap[displayStatus] || displayStatus;
  };

  // ✅ FIXED: Status update with correct enum mapping
  const changeStatus = async (newStatus) => {
    if (!selectedTicket) return;
    
    let reason = "";
    if (newStatus === "REJECTED") {
      reason = prompt("Please enter a rejection reason:");
      if (!reason) return;
      setRejectionReason(reason);
    }

    try {
      // Convert display status to backend enum format
      const backendStatus = getBackendStatusValue(newStatus);
      console.log("Sending status to backend:", backendStatus);

      const response = await updateTicketStatus(
        selectedTicket.id,
        "ADMIN",
        { 
          status: backendStatus,
          assignedTechnician: selectedTicket.assignedTechnician?.name || null,
          rejectionReason: newStatus === "REJECTED" ? reason : null
        },
        adminEmail
      );
      console.log("Status update response:", response.data);

      setSelectedTicket((prev) => ({
        ...prev,
        status: newStatus,
      }));
      await loadTickets();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message || "Unknown error"));
    }
  };

  // ✅ ADDED: Assign technician to ticket
  const assignTechnician = async (technicianId) => {
    if (!selectedTicket) return;
    
    try {
      setAssigningTechnician(true);
      const response = await axios.put(
        `${BACKEND_URL}/api/tickets/${selectedTicket.id}/assign/${technicianId}`
      );
      console.log("Technician assigned:", response.data);
      
      // Update selected ticket with new technician
      setSelectedTicket(response.data);
      await loadTickets(); // Refresh ticket list
      alert("Technician assigned successfully!");
    } catch (err) {
      console.error("Assign technician failed:", err);
      alert("Failed to assign technician: " + (err.response?.data?.message || err.message));
    } finally {
      setAssigningTechnician(false);
    }
  };

  const sendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || !selectedTicket) return;
    try {
      await addComment(
        selectedTicket.id,
        "Admin",
        trimmed,
        [],
        replyTo ? replyTo.id : null,
        "ADMIN"
      );
      setComment("");
      setReplyTo(null);
      await loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error(err);
      alert("Failed to send comment");
    }
  };

  const saveEdit = async () => {
    if (!editText.trim() || !editingId || !selectedTicket) return;
    try {
      const res = await editComment(
        selectedTicket.id,
        editingId,
        adminEmail,
        adminRole,
        editText
      );
      setComments((prev) => prev.map((c) => (c.id === editingId ? res.data : c)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Failed to edit comment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedTicket) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(selectedTicket.id, commentId, adminEmail, adminRole);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete comment: " + (err.response?.data?.message || err.message));
    }
  };

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

  const statusConfig = {
    OPEN: { label: "Open", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", step: 1, icon: "📥" },
    "IN PROGRESS": { label: "In Progress", color: "#d97706", bg: "#fef3c7", border: "#fde68a", step: 2, icon: "🔧" },
    IN_PROGRESS: { label: "In Progress", color: "#d97706", bg: "#fef3c7", border: "#fde68a", step: 2, icon: "🔧" },
    RESOLVED: { label: "Resolved", color: "#16a34a", bg: "#d1fae5", border: "#a7f3d0", step: 3, icon: "✅" },
    CLOSED: { label: "Closed", color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", step: 4, icon: "🔒" },
    REJECTED: { label: "Rejected", color: "#7c3aed", bg: "#ede9fe", border: "#ddd6fe", step: 0, icon: "❌" },
  };

  const getStatusStyle = (status) => statusConfig[status] || statusConfig.OPEN;

  // ✅ FIXED: Handle both IN PROGRESS and IN_PROGRESS formats
  const getAvailableTransitions = (currentStatus) => {
    const normalizedStatus = currentStatus?.replace("_", " ") || currentStatus;
    
    const transitions = {
      "OPEN": [
        { status: "IN PROGRESS", label: "Start Work", color: "btn-amber", icon: "🔧" },
        { status: "REJECTED", label: "Reject", color: "btn-purple", icon: "❌" },
      ],
      "IN PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", color: "btn-green", icon: "✅" },
        { status: "OPEN", label: "Reopen", color: "btn-secondary", icon: "↩️" },
      ],
      "IN_PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", color: "btn-green", icon: "✅" },
        { status: "OPEN", label: "Reopen", color: "btn-secondary", icon: "↩️" },
      ],
      "RESOLVED": [
        { status: "CLOSED", label: "Close Ticket", color: "btn-blue", icon: "🔒" },
        { status: "IN PROGRESS", label: "Reopen Work", color: "btn-amber", icon: "🔧" },
      ],
      "CLOSED": [{ status: "OPEN", label: "Reopen", color: "btn-secondary", icon: "↩️" }],
      "REJECTED": [{ status: "OPEN", label: "Reopen", color: "btn-secondary", icon: "↩️" }],
    };
    
    return transitions[currentStatus] || transitions[normalizedStatus] || [];
  };

  // ✅ FIXED: Normalize status for comparison
  const isStatusCompleted = (status, checkStatus) => {
    const order = ["OPEN", "IN PROGRESS", "RESOLVED", "CLOSED"];
    const normalizedStatus = status?.replace("_", " ");
    const normalizedCheck = checkStatus?.replace("_", " ");
    const currentIndex = order.indexOf(normalizedStatus);
    const checkIndex = order.indexOf(normalizedCheck);
    return checkIndex <= currentIndex && currentIndex !== -1;
  };

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

  const renderComment = (c, level = 0) => {
    const statusStyle = getStatusStyle(selectedTicket?.status);
    return (
      <div
        key={c.id}
        ref={(el) => { if (el) commentNodeRefs.current[c.id] = el; }}
        style={{
          marginLeft: level > 0 ? `${Math.min(level * 28, 84)}px` : "0px",
          borderLeft: level > 0 ? `3px solid ${statusStyle.border}` : "none",
          paddingLeft: level > 0 ? "14px" : "0px",
          marginTop: level > 0 ? "14px" : "0px",
        }}
      >
        <div className="conversation-card">
          <div className="conversation-top">
            <span className="conversation-author">{c.author || "Unknown"}</span>
            <span style={{ color: "#9ca3af" }}>•</span>
            <span className="conversation-time">{formatDateTime(c.createdAt)}</span>
          </div>

          {editingId === c.id ? (
            <div style={{ marginTop: "10px" }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ width: "100%", minHeight: "80px", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
              />
              <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
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
              <div style={{ fontSize: "15px", lineHeight: "1.7", color: "#1f2937", whiteSpace: "pre-line" }}>
                {c.message || ""}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  onClick={() => setReplyTo(c)}
                  style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  Reply
                </button>
                {c.author === "Admin" && (
                  <>
                    <button
                      onClick={() => { setEditingId(c.id); setEditText(c.message || ""); }}
                      style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ border: "none", background: "transparent", color: "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
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

  const ticketImages = selectedTicket?.imageUrls || [];
  const currentStatusStyle = getStatusStyle(selectedTicket?.status);
  const availableTransitions = selectedTicket ? getAvailableTransitions(selectedTicket.status) : [];
  const assignedTechName = selectedTicket?.assignedTechnician?.name || selectedTicket?.assignedTechnician || "—";

  // ✅ ADDED: Check if technician is already assigned
  const isTechnicianAssigned = selectedTicket?.assignedTechnician?.name || selectedTicket?.assignedTechnician;

  console.log("Rendering with tickets:", tickets.length, "selected:", selectedTicketId);

  if (loading && tickets.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading admin panel...</div>;
  }

  return (
    <div style={{ maxWidth: "1480px", margin: "0 auto", padding: "24px 22px 50px", background: "#f5f7fb", minHeight: "100vh" }}>
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        {[
          { key: "all", label: "Total", color: "#0f172a" },
          { key: "OPEN", label: "Open", color: "#dc2626" },
          { key: "IN PROGRESS", label: "In Progress", color: "#d97706" },
          { key: "RESOLVED", label: "Resolved", color: "#16a34a" },
          { key: "CLOSED", label: "Closed", color: "#2563eb" },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8fbff 100%)",
              border: `1px solid ${statusFilter === item.key ? "#2563eb" : "#e5edf8"}`,
              borderRadius: "22px",
              padding: "18px",
              boxShadow: statusFilter === item.key ? "0 14px 30px rgba(37, 99, 235, 0.12)" : "0 14px 28px rgba(15, 23, 42, 0.05)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "30px", fontWeight: "800", color: item.color }}>
              {item.key === "all" 
                ? tickets.length 
                : tickets.filter((t) => {
                    // ✅ FIXED: Normalize ticket status for comparison
                    const normalizedTicketStatus = t.status?.replace("_", " ") || t.status;
                    const normalizedFilterKey = item.key.replace("_", " ");
                    return normalizedTicketStatus === normalizedFilterKey;
                  }).length}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ ADDED: Manage Technicians Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          onClick={() => window.location.href = "/admin/technicians"}
          style={{
            background: "linear-gradient(145deg, #7c3aed 0%, #6d28d9 100%)",
            color: "white",
            border: "none",
            borderRadius: "999px",
            padding: "12px 20px",
            fontSize: "13px",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.2)"
          }}
        >
          🔧 Manage Technicians
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "18px" }}>
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "280px", border: "1px solid #d7deea", borderRadius: "999px", padding: "14px 18px", fontSize: "15px", outline: "none" }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {["all", "OPEN", "IN PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                border: "1px solid #d7deea",
                borderRadius: "999px",
                padding: "12px 18px",
                fontSize: "13px",
                fontWeight: "800",
                background: statusFilter === status ? "#2563eb" : "#ffffff",
                color: statusFilter === status ? "#ffffff" : "#334155",
                cursor: "pointer",
                borderColor: statusFilter === status ? "#2563eb" : "#d7deea",
              }}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "22px", alignItems: "start" }}>
        
        {/* Left Panel - Ticket List */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "26px", boxShadow: "0 14px 28px rgba(15, 23, 42, 0.05)", overflow: "hidden" }}>
          <div style={{ padding: "22px 22px 14px", borderBottom: "1px solid #edf2f7" }}>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a" }}>
              {statusFilter === "all" ? "All Tickets" : statusFilter}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "16px", maxHeight: "840px", overflowY: "auto" }}>
            {filteredTickets.length === 0 ? (
              <div style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>No tickets found</div>
            ) : (
              filteredTickets.map((ticket) => {
                const style = getStatusStyle(ticket.status);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      border: `1px solid ${selectedTicketId === ticket.id ? "#2563eb" : "#e6ebf2"}`,
                      borderRadius: "22px",
                      background: selectedTicketId === ticket.id ? "linear-gradient(145deg, #eff6ff 0%, #ffffff 100%)" : "linear-gradient(145deg, #ffffff 0%, #fbfdff 100%)",
                      padding: "16px",
                      cursor: "pointer",
                      boxShadow: selectedTicketId === ticket.id ? "0 14px 30px rgba(37, 99, 235, 0.12)" : "none",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "14px", alignItems: "start", marginBottom: "12px" }}>
                      <div style={{ width: "80px", height: "80px", borderRadius: "16px", overflow: "hidden", background: "#eef2f7", border: "1px solid #e5e7eb" }}>
                        {ticket.imageUrls?.length > 0 ? (
                          <img src={`${BACKEND_URL}${ticket.imageUrls[0]}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎫</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: "17px", fontWeight: "900", color: "#111827", marginBottom: "6px" }}>{ticket.title}</div>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                          by <strong>{ticket.reporterName}</strong><br />
                          {formatDateTime(ticket.createdAt)}
                        </div>
                      </div>
                      <div style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800" }}>
                        {style.icon} {style.label}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", padding: "5px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>{ticket.category}</span>
                      <span style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569", padding: "5px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>{ticket.priority}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "26px", boxShadow: "0 14px 28px rgba(15, 23, 42, 0.05)", padding: "24px" }}>
          {selectedTicket ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px", marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid #e5e7eb" }}>
                <div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>{selectedTicket.title}</div>
                  <div style={{ fontSize: "14px", color: "#64748b" }}>
                    Reported by <strong>{selectedTicket.reporterName}</strong> • {formatDateTime(selectedTicket.createdAt)}
                  </div>
                </div>
                <div style={{ background: currentStatusStyle.bg, color: currentStatusStyle.color, border: `1px solid ${currentStatusStyle.border}`, padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: "800" }}>
                  {currentStatusStyle.icon} {currentStatusStyle.label}
                </div>
              </div>

              {/* Status Progress */}
              {selectedTicket.status !== "REJECTED" && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", padding: "20px", background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
                  {[
                    { key: "OPEN", label: "Open", step: 1 },
                    { key: "IN PROGRESS", label: "In Progress", step: 2 },
                    { key: "RESOLVED", label: "Resolved", step: 3 },
                    { key: "CLOSED", label: "Closed", step: 4 },
                  ].map((step, index, array) => {
                    const isCompleted = isStatusCompleted(selectedTicket.status, step.key);
                    const isActive = selectedTicket.status === step.key || selectedTicket.status === step.key.replace(" ", "_");
                    const isLast = index === array.length - 1;
                    return (
                      <React.Fragment key={step.key}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
                          <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "800",
                            background: isCompleted ? "#10b981" : isActive ? "#2563eb" : "#ffffff",
                            color: isCompleted || isActive ? "white" : "#94a3b8",
                            border: `2px solid ${isCompleted ? "#10b981" : isActive ? "#2563eb" : "#cbd5e1"}`,
                            boxShadow: isActive ? "0 0 0 4px rgba(37, 99, 235, 0.2)" : "none",
                          }}>
                            {isCompleted ? "✓" : step.step}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: isCompleted ? "#10b981" : isActive ? "#2563eb" : "#64748b", textTransform: "uppercase" }}>
                            {step.label}
                          </div>
                        </div>
                        {!isLast && (
                          <div style={{ flex: 1, height: "2px", background: isStatusCompleted(selectedTicket.status, array[index + 1].key) ? "#10b981" : "#e2e8f0", borderRadius: "1px", position: "relative", top: "-14px" }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* Images */}
              {ticketImages.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                  {ticketImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={`${BACKEND_URL}${img}`}
                      alt=""
                      onClick={() => setPreviewImage(`${BACKEND_URL}${img}`)}
                      style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "18px", cursor: "zoom-in" }}
                    />
                  ))}
                </div>
              )}

              {/* Description */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#111827", marginBottom: "14px" }}>📝 Description</div>
                <div style={{ fontSize: "16px", lineHeight: "1.85", color: "#374151", whiteSpace: "pre-line", background: "#f9fafb", padding: "20px", borderRadius: "16px", border: "1px solid #e5e7eb" }}>
                  {selectedTicket.description}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#111827", marginBottom: "14px" }}>📋 Ticket Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
                  {[
                    { label: "Category", value: selectedTicket.category },
                    { label: "Priority", value: selectedTicket.priority },
                    { label: "Location", value: selectedTicket.location },
                    { label: "Reporter Email", value: selectedTicket.reporterEmail },
                    { label: "Assigned Technician", value: assignedTechName },
                  ].map((item) => (
                    <div key={item.label} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "16px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", marginBottom: "6px" }}>{item.label}</div>
                      <div style={{ fontSize: "15px", color: "#111827", fontWeight: "600" }}>{item.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Actions */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#111827", marginBottom: "14px" }}>⚡ Status Actions</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {availableTransitions.map((t) => (
                    <button
                      key={t.status}
                      onClick={() => changeStatus(t.status)}
                      style={{
                        border: "none",
                        borderRadius: "999px",
                        padding: "12px 20px",
                        fontSize: "14px",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: t.color === "btn-amber" ? "#f59e0b" : t.color === "btn-green" ? "#16a34a" : t.color === "btn-blue" ? "#2563eb" : t.color === "btn-purple" ? "#2d0c65" : "#f3f4f6",
                        color: t.color === "btn-secondary" ? "#374151" : "#ffffff",
                        border: t.color === "btn-secondary" ? "1px solid #d1d5db" : "none",
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#111827", marginBottom: "14px" }}>💬 Comments ({comments.length})</div>
                
                {replyTo && (
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "14px 16px", marginBottom: "14px" }}>
                    Replying to <strong>{replyTo.author}</strong>: {replyTo.message}
                    <button onClick={() => setReplyTo(null)} style={{ marginLeft: "12px", padding: "6px 12px", fontSize: "12px", borderRadius: "999px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer" }}>Cancel</button>
                  </div>
                )}
                
                <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "20px", overflow: "hidden", marginBottom: "20px" }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment..."
                    style={{ width: "100%", minHeight: "120px", border: "none", padding: "18px", fontSize: "15px", outline: "none", resize: "vertical" }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", padding: "14px 18px", borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                    <button onClick={sendComment} style={{ border: "none", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", fontWeight: "800", background: "#2563eb", color: "#ffffff", cursor: "pointer" }}>
                      {replyTo ? "Send Reply" : "Post Comment"}
                    </button>
                  </div>
                </div>

                {comments.length === 0 ? (
                  <div style={{ color: "#6b7280", textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "16px", border: "2px dashed #e5e7eb" }}>No comments yet</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {buildCommentTree(comments).map((c) => renderComment(c))}
                  </div>
                )}
              </div>

              {/* ✅ ADDED: Technician Assignment Section */}
              <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px solid #e5e7eb" }}>
                <div style={{ fontSize: "20px", fontWeight: "900", color: "#111827", marginBottom: "14px" }}>
                  🔧 {isTechnicianAssigned ? "Assigned Technician" : "Assign Technician"}
                </div>
                
                {isTechnicianAssigned ? (
                  <div style={{ 
                    background: "linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)", 
                    border: "11px solid #a7f3d0",
                    borderRadius: "16px", 
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{ 
                      width: "56px", 
                      height: "56px", 
                      borderRadius: "50%", 
                      background: "#10b981", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "28px"
                    }}>
                      👨‍🔧
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#065f46" }}>
                        {assignedTechName}
                      </div>
                      <div style={{ fontSize: "13px", color: "#059669", marginTop: "4px" }}>
                        Currently assigned to this ticket
                      </div>
                    </div>
                    <div style={{ 
                      background: "#10b981", 
                      color: "white", 
                      padding: "8px 16px", 
                      borderRadius: "999px", 
                      fontSize: "12px", 
                      fontWeight: "700" 
                    }}>
                      Assigned
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                      Select a technician to assign to this ticket:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {technicians.length === 0 ? (
                        <div style={{ 
                          color: "#6b7280", 
                          textAlign: "center", 
                          padding: "40px", 
                          background: "#f9fafb", 
                          borderRadius: "16px", 
                          border: "2px dashed #e5e7eb" 
                        }}>
                          No technicians available. Please add technicians first.
                        </div>
                      ) : (
                        technicians.map((tech) => (
                          <div 
                            key={tech.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              padding: "16px",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "16px",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div style={{ 
                              width: "48px", 
                              height: "48px", 
                              borderRadius: "50%", 
                              background: "linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)",
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center",
                              fontSize: "20px",
                              color: "white",
                              fontWeight: "700"
                            }}>
                              {tech.name?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                                {tech.name}
                              </div>
                              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                                {tech.specialization} • {tech.team}
                              </div>
                              <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                                {tech.email}
                              </div>
                            </div>
                            <button
                              onClick={() => assignTechnician(tech.id)}
                              disabled={assigningTechnician}
                              style={{
                                border: "none",
                                borderRadius: "999px",
                                padding: "10px 20px",
                                fontSize: "13px",
                                fontWeight: "800",
                                cursor: assigningTechnician ? "not-allowed" : "pointer",
                                background: assigningTechnician ? "#9ca3af" : "#2563eb",
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {assigningTechnician ? "Assigning..." : "Assign"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: "#6b7280", textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
              <div>Select a ticket to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {previewImage && (
        <div onClick={() => setPreviewImage("")} style={{ display: "flex", position: "fixed", zIndex: 9999, inset: 0, background: "rgba(15, 23, 42, 0.92)", alignItems: "center", justifyContent: "center", padding: "30px" }}>
          <button onClick={() => setPreviewImage("")} style={{ position: "absolute", top: "18px", right: "26px", fontSize: "48px", color: "#ffffff", border: "none", background: "transparent", cursor: "pointer" }}>&times;</button>
          <img src={previewImage} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: "18px" }} />
        </div>
      )}
    </div>
  );
}