import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import SmartAssignmentPanel from './SmartAssignmentPanel';
import SlaTimer from "../../components/tickets/SlaTimer";
import TicketReportGenerator from "../../components/tickets/TicketReportGenerator";
import {
  getAllTickets,
  updateTicketStatus,
  getTicketById,
  addComment,
  editComment,
  deleteComment,
} from "../../services/ticketApi";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  X, 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  Lock,
  RotateCcw,
  XCircle,
  MoreVertical,
  Upload,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const BACKEND_URL = "http://localhost:8082";

// Professional color palette
const COLORS = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  secondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#94a3b8"
  }
};

// Chart colors
const CHART_COLORS = {
  blue: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  slate: "#64748b"
};

// Status configuration
const STATUS_CONFIG = {
  OPEN: { 
    label: "Open", 
    color: "#dc2626", 
    bg: "#fef2f2", 
    border: "#fecaca", 
    icon: AlertCircle,
    gradient: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)"
  },
  "IN PROGRESS": { 
    label: "In Progress", 
    color: "#d97706", 
    bg: "#fffbeb", 
    border: "#fde68a", 
    icon: Wrench,
    gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
  },
  IN_PROGRESS: { 
    label: "In Progress", 
    color: "#d97706", 
    bg: "#fffbeb", 
    border: "#fde68a", 
    icon: Wrench,
    gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
  },
  RESOLVED: { 
    label: "Resolved", 
    color: "#059669", 
    bg: "#ecfdf5", 
    border: "#a7f3d0", 
    icon: CheckCircle,
    gradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
  },
  CLOSED: { 
    label: "Closed", 
    color: "#2563eb", 
    bg: "#eff6ff", 
    border: "#bfdbfe", 
    icon: Lock,
    gradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
  },
  REJECTED: { 
    label: "Rejected", 
    color: "#7c3aed", 
    bg: "#f5f3ff", 
    border: "#ddd6fe", 
    icon: XCircle,
    gradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
  }
};

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
  
  // Image upload states
  const [commentImages, setCommentImages] = useState([]);
  const [commentImagePreview, setCommentImagePreview] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  
  const [technicians, setTechnicians] = useState([]);
  const [assigningTechnician, setAssigningTechnician] = useState(false);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  const commentNodeRefs = useRef({});
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  const adminEmail = "Admin";
  const adminRole = "ADMIN";

  // Load technicians
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
    loadTickets();
    loadTechnicians();
  }, []);

  const loadTicketDetails = async (id) => {
    if (!id) return;
    try {
      const [ticketRes, commentRes] = await Promise.all([
        getTicketById(id),
        axios.get(`${BACKEND_URL}/api/tickets/${id}/comments`),
      ]);
      setSelectedTicket(ticketRes.data || null);
      setComments(commentRes.data || []);
    } catch (err) {
      console.error("Load details failed:", err);
    }
  };

  useEffect(() => {
    loadTicketDetails(selectedTicketId);
  }, [selectedTicketId]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS" || t.status === "IN PROGRESS").length;
    const resolved = tickets.filter(t => t.status === "RESOLVED").length;
    const closed = tickets.filter(t => t.status === "CLOSED").length;
    const rejected = tickets.filter(t => t.status === "REJECTED").length;
    
    // Calculate trend (mock data - replace with actual historical data)
    const trendData = [
      { name: 'Mon', tickets: Math.floor(total * 0.15), resolved: Math.floor(resolved * 0.2) },
      { name: 'Tue', tickets: Math.floor(total * 0.25), resolved: Math.floor(resolved * 0.3) },
      { name: 'Wed', tickets: Math.floor(total * 0.2), resolved: Math.floor(resolved * 0.25) },
      { name: 'Thu', tickets: Math.floor(total * 0.3), resolved: Math.floor(resolved * 0.35) },
      { name: 'Fri', tickets: Math.floor(total * 0.35), resolved: Math.floor(resolved * 0.4) },
      { name: 'Sat', tickets: Math.floor(total * 0.1), resolved: Math.floor(resolved * 0.15) },
      { name: 'Sun', tickets: Math.floor(total * 0.08), resolved: Math.floor(resolved * 0.1) },
    ];

    const statusData = [
      { name: 'Open', value: open, color: CHART_COLORS.red },
      { name: 'In Progress', value: inProgress, color: CHART_COLORS.amber },
      { name: 'Resolved', value: resolved, color: CHART_COLORS.green },
      { name: 'Closed', value: closed, color: CHART_COLORS.blue },
      { name: 'Rejected', value: rejected, color: CHART_COLORS.purple },
    ].filter(d => d.value > 0);

    const priorityData = [
      { name: 'Low', count: tickets.filter(t => t.priority === 'LOW').length },
      { name: 'Medium', count: tickets.filter(t => t.priority === 'MEDIUM').length },
      { name: 'High', count: tickets.filter(t => t.priority === 'HIGH').length },
      { name: 'Urgent', count: tickets.filter(t => t.priority === 'URGENT').length },
    ];

    // Calculate resolution rate
    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;
    
    // Calculate avg resolution time (mock)
    const avgResolutionTime = "4.2h";

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      rejected,
      trendData,
      statusData,
      priorityData,
      resolutionRate,
      avgResolutionTime
    };
  }, [tickets]);

  // Image handling functions
  const handleImageSelect = (e, isEdit = false) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = isEdit ? editImages : commentImages;
    const maxImages = 3;
    
    if (currentImages.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      alert("Only image files are allowed");
      return;
    }

    if (isEdit) {
      setEditImages((prev) => [...prev, ...validFiles]);
    } else {
      setCommentImages((prev) => [...prev, ...validFiles]);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCommentImagePreview((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = "";
  };

  const removeImage = (index, isEdit = false) => {
    if (isEdit) {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCommentImages((prev) => prev.filter((_, i) => i !== index));
      setCommentImagePreview((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const removeExistingEditImage = (index) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ NEW: Helper to check if ticket has SLA alert (BREACHED or AT_RISK)
  const isSlaAlert = (ticket) => {
    if (!ticket.slaFirstResponseDue && !ticket.slaResolutionDue) return false;
    
    const isCompleted = ['closed', 'resolved', 'repaired'].includes(
      (ticket.status || '').toLowerCase()
    );
    if (isCompleted) return false;

    const now = new Date();
    const created = new Date(ticket.createdAt);
    const target = ticket.firstResponseAt 
      ? new Date(ticket.slaResolutionDue) 
      : new Date(ticket.slaFirstResponseDue);
    
    if (now > target) return true; // BREACHED
    
    const total = target - created;
    const elapsed = now - created;
    const percent = (elapsed / total) * 100;
    
    return percent > 80; // AT_RISK
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const ticketStatus = t.status?.replace("_", " ") || t.status;
      const filterStatus = statusFilter?.replace("_", " ") || statusFilter;
      
      // ✅ NEW: SLA Alert filter logic
      if (statusFilter === "SLA_ALERT") {
        return isSlaAlert(t);
      }
      
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

  const changeStatus = async (newStatus) => {
    if (!selectedTicket) return;
    
    let reason = "";
    if (newStatus === "REJECTED") {
      reason = prompt("Please enter a rejection reason:");
      if (!reason) return;
      setRejectionReason(reason);
    }

    try {
      const backendStatus = getBackendStatusValue(newStatus);
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

  const assignTechnician = async (technicianId) => {
    if (!selectedTicket) return;
    
    try {
      setAssigningTechnician(true);
      const response = await axios.put(
        `${BACKEND_URL}/api/tickets/${selectedTicket.id}/assign/${technicianId}`
      );
      
      setSelectedTicket(response.data);
      await loadTickets();
      alert("Technician assigned successfully!");
    } catch (err) {
      console.error("Assign technician failed:", err);
      alert("Failed to assign technician: " + (err.response?.data?.message || err.message));
    } finally {
      setAssigningTechnician(false);
    }
  };

  // Send comment with image support
  const sendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed && commentImages.length === 0) return;
    
    try {
      const formData = new FormData();
      formData.append("author", adminEmail);
      formData.append("message", trimmed);
      formData.append("authorRole", "ADMIN");
      
      if (replyTo) {
        formData.append("parentId", replyTo.id);
      }

      commentImages.forEach((file) => {
        formData.append("images", file);
      });

      await axios.post(
        `${BACKEND_URL}/api/tickets/${selectedTicket.id}/comments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setComment("");
      setCommentImages([]);
      setCommentImagePreview([]);
      setReplyTo(null);
      await loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error(err);
      alert("Failed to send comment");
    }
  };

  // Save edit with image support
  const saveEdit = async () => {
    if (!editText.trim() && editExistingImages.length === 0 && editImages.length === 0) {
      alert("Please add a message or at least one image");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("author", adminEmail);
      formData.append("authorRole", adminRole);
      formData.append("message", editText);
      formData.append("existingImages", JSON.stringify(editExistingImages));

      editImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await axios.post(
        `${BACKEND_URL}/api/tickets/${selectedTicket.id}/comments/${editingId}/edit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setComments((prev) => prev.map((c) => (c.id === editingId ? res.data : c)));
      setEditingId(null);
      setEditText("");
      setEditImages([]);
      setEditExistingImages([]);
    } catch (err) {
      console.error("Edit failed:", err);
      alert("Failed to edit comment: " + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.message || "");
    setEditExistingImages(c.imageUrls || []);
    setEditImages([]);
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
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "—";
    }
  };

  const getStatusStyle = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

  const getAvailableTransitions = (currentStatus) => {
    const normalizedStatus = currentStatus?.replace("_", " ") || currentStatus;
    
    const transitions = {
      "OPEN": [
        { status: "IN PROGRESS", label: "Start Work", color: "#f59e0b", icon: Wrench },
        { status: "REJECTED", label: "Reject", color: "#7c3aed", icon: XCircle },
      ],
      "IN PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", color: "#10b981", icon: CheckCircle },
        { status: "OPEN", label: "Reopen", color: "#64748b", icon: RotateCcw },
      ],
      "IN_PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", color: "#10b981", icon: CheckCircle },
        { status: "OPEN", label: "Reopen", color: "#64748b", icon: RotateCcw },
      ],
      "RESOLVED": [
        { status: "CLOSED", label: "Close Ticket", color: "#2563eb", icon: Lock },
        { status: "IN PROGRESS", label: "Reopen Work", color: "#f59e0b", icon: Wrench },
      ],
      "CLOSED": [{ status: "OPEN", label: "Reopen", color: "#64748b", icon: RotateCcw }],
      "REJECTED": [{ status: "OPEN", label: "Reopen", color: "#64748b", icon: RotateCcw }],
    };
    
    return transitions[currentStatus] || transitions[normalizedStatus] || [];
  };

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
    const isEditing = editingId === c.id;
    
    return (
      <div
        key={c.id}
        ref={(el) => { if (el) commentNodeRefs.current[c.id] = el; }}
        style={{
          marginLeft: level > 0 ? `${Math.min(level * 24, 72)}px` : "0px",
          marginTop: level > 0 ? "12px" : "16px",
          position: "relative",
        }}
      >
        {level > 0 && (
          <div style={{
            position: "absolute",
            left: "-12px",
            top: "-12px",
            width: "2px",
            height: "24px",
            background: "linear-gradient(to bottom, #e2e8f0, #cbd5e1)",
            borderRadius: "1px"
          }} />
        )}
        
        <div style={{
          background: isEditing ? "#f8fafc" : "#ffffff",
          border: `1px solid ${isEditing ? "#bfdbfe" : "#e2e8f0"}`,
          borderRadius: "16px",
          padding: "16px",
          boxShadow: isEditing ? "0 4px 6px -1px rgba(59, 130, 246, 0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
          transition: "all 0.2s ease"
        }}>
          {/* Comment Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: c.authorRole === "ADMIN" 
                ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" 
                : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "700"
            }}>
              {c.author?.charAt(0)?.toUpperCase() || "?"}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <span style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  fontFamily: "Inter, system-ui, -apple-system, sans-serif"
                }}>
                  {c.author || "Unknown"}
                </span>
                
                {c.authorRole && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: c.authorRole === "ADMIN" ? "#dbeafe" : "#f1f5f9",
                    color: c.authorRole === "ADMIN" ? "#1d4ed8" : "#64748b"
                  }}>
                    {c.authorRole}
                  </span>
                )}
                
                <span style={{ color: "#cbd5e1", fontSize: "12px" }}>•</span>
                
                <span style={{
                  fontSize: "13px",
                  color: COLORS.text.muted,
                  fontFamily: "Inter, system-ui, sans-serif"
                }}>
                  {formatDateTime(c.createdAt)}
                </span>
                
                {c.updatedAt && c.updatedAt !== c.createdAt && (
                  <span style={{
                    fontSize: "11px",
                    color: "#f59e0b",
                    fontStyle: "italic"
                  }}>
                    (edited)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Mode */}
          {isEditing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit your comment..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  color: COLORS.text.primary,
                  background: "#ffffff",
                  resize: "vertical",
                  fontFamily: "Inter, system-ui, sans-serif",
                  marginBottom: "12px"
                }}
              />
              
              {editExistingImages.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{
                    fontSize: "12px",
                    color: COLORS.text.secondary,
                    marginBottom: "8px",
                    fontWeight: "600"
                  }}>
                    Current images:
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {editExistingImages.map((url, i) => (
                      <div key={`existing-${i}`} style={{
                        position: "relative",
                        width: "80px",
                        height: "80px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0"
                      }}>
                        <img 
                          src={`${BACKEND_URL}${url}`} 
                          alt="" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          onClick={() => removeExistingEditImage(i)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px"
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {editImages.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{
                    fontSize: "12px",
                    color: COLORS.text.secondary,
                    marginBottom: "8px",
                    fontWeight: "600"
                  }}>
                    New images:
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {editImages.map((file, i) => (
                      <div key={`new-${i}`} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        background: "#f1f5f9",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}>
                        <ImageIcon size={16} color={COLORS.primary} />
                        <span style={{ fontSize: "13px", color: COLORS.text.primary }}>{file.name}</span>
                        <button
                          onClick={() => removeImage(i, true)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: COLORS.danger
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: "12px" }}>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(e, true)}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={editExistingImages.length + editImages.length >= 3}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    background: "#f1f5f9",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: COLORS.text.secondary,
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  <Upload size={14} />
                  Add Image ({editExistingImages.length + editImages.length}/3)
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: "10px 20px",
                    background: COLORS.primary,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <CheckCircle size={16} />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditText("");
                    setEditImages([]);
                    setEditExistingImages([]);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    color: COLORS.text.secondary,
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{
                fontSize: "14px",
                lineHeight: "1.7",
                color: COLORS.text.primary,
                marginBottom: "12px",
                whiteSpace: "pre-wrap",
                fontFamily: "Inter, system-ui, sans-serif"
              }}>
                {c.message || ""}
              </div>
              
              {c.imageUrls?.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {c.imageUrls.map((url, i) => (
                    <div 
                      key={i} 
                      onClick={() => setPreviewImage(`${BACKEND_URL}${url}`)}
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: "1px solid #e2e8f0",
                        position: "relative"
                      }}
                    >
                      <img
                        src={`${BACKEND_URL}${url}`}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "4px 8px",
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        fontSize: "11px",
                        textAlign: "center"
                      }}>
                        Click to view
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <button
                  onClick={() => setReplyTo(c)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "none",
                    color: COLORS.text.muted,
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = COLORS.primary;
                    e.target.style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = COLORS.text.muted;
                    e.target.style.background = "transparent";
                  }}
                >
                  <Reply size={14} />
                  Reply
                </button>
                
                {c.author === "Admin" && (
                  <>
                    <button
                      onClick={() => startEdit(c)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        color: COLORS.text.muted,
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = COLORS.warning;
                        e.target.style.background = "#fffbeb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = COLORS.text.muted;
                        e.target.style.background = "transparent";
                      }}
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        color: COLORS.text.muted,
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = COLORS.danger;
                        e.target.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = COLORS.text.muted;
                        e.target.style.background = "transparent";
                      }}
                    >
                      <Trash2 size={14} />
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
  const isTechnicianAssigned = selectedTicket?.assignedTechnician?.name || selectedTicket?.assignedTechnician;

  if (loading && tickets.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.background,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #e2e8f0",
            borderTopColor: COLORS.primary,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <p style={{ color: COLORS.text.secondary, fontSize: "16px", fontWeight: "500" }}>
            Loading admin panel...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "1600px",
      margin: "0 auto",
      padding: "24px 32px 40px",
      background: COLORS.background,
      minHeight: "100vh",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: COLORS.text.primary
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px"
      }}>
        <div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "800",
            color: COLORS.text.primary,
            margin: "0 0 4px 0",
            letterSpacing: "-0.02em"
          }}>
            Ticket Management
          </h1>
          <p style={{
            fontSize: "14px",
            color: COLORS.text.secondary,
            margin: 0
          }}>
            Manage and resolve support tickets efficiently
          </p>
        </div>
        
        {/* Button Group */}
        <div style={{ display: "flex", gap: "12px" }}>
          {/* NEW: Generate Report Button */}
          <TicketReportGenerator tickets={tickets} />
          
          {/* Existing: Manage Technicians Button */}
          <button
            onClick={() => window.location.href = "/admin/technicians"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(124, 58, 237, 0.2)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 6px 8px -1px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 6px -1px rgba(124, 58, 237, 0.2)";
            }}
          >
            <Wrench size={18} />
            Manage Technicians
          </button>
        </div>
      </div>

      {/* ==================== ANALYTICS DASHBOARD ==================== */}
      <div style={{ marginBottom: "32px" }}>
        {/* Analytics Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            color: COLORS.text.primary,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <BarChart3 size={24} color={COLORS.primary} />
            Analytics Overview
          </h2>
          
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "90d", label: "90 Days" }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: timeRange === range.key ? COLORS.primary : "#f1f5f9",
                  color: timeRange === range.key ? "#ffffff" : COLORS.text.secondary,
                  transition: "all 0.2s"
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}>
          {[
            { 
              label: "Total Tickets", 
              value: analytics.total, 
              icon: BarChart3, 
              color: COLORS.primary,
              trend: "+12%",
              trendUp: true
            },
            { 
              label: "Resolution Rate", 
              value: `${analytics.resolutionRate}%`, 
              icon: CheckCircle, 
              color: COLORS.success,
              trend: "+5%",
              trendUp: true
            },
            { 
              label: "Avg Resolution Time", 
              value: analytics.avgResolutionTime, 
              icon: Clock, 
              color: COLORS.warning,
              trend: "-15min",
              trendUp: true
            },
            { 
              label: "Open Tickets", 
              value: analytics.open, 
              icon: AlertCircle, 
              color: COLORS.danger,
              trend: analytics.open > 10 ? "+3" : "-2",
              trendUp: analytics.open > 10
            },
          ].map((kpi, index) => (
            <div key={index} style={{
              background: COLORS.surface,
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              transition: "all 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
            }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: `${kpi.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <kpi.icon size={24} color={kpi.color} />
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: kpi.trendUp ? "#ecfdf5" : "#fef2f2",
                  color: kpi.trendUp ? "#059669" : "#dc2626",
                  fontSize: "12px",
                  fontWeight: "700"
                }}>
                  {kpi.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {kpi.trend}
                </div>
              </div>
              
              <div style={{
                fontSize: "32px",
                fontWeight: "800",
                color: COLORS.text.primary,
                marginBottom: "4px",
                letterSpacing: "-0.02em"
              }}>
                {kpi.value}
              </div>
              
              <div style={{
                fontSize: "14px",
                color: COLORS.text.secondary,
                fontWeight: "500"
              }}>
                {kpi.label}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          marginBottom: "24px"
        }}>
          {/* Ticket Trend Chart */}
          <div style={{
            background: COLORS.surface,
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: COLORS.text.primary,
              margin: "0 0 20px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <Activity size={20} color={COLORS.primary} />
              Ticket Activity Trend
            </h3>
            
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: COLORS.text.muted, fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: COLORS.text.muted, fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: COLORS.surface,
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke={CHART_COLORS.blue} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTickets)" 
                    name="New Tickets"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stroke={CHART_COLORS.green} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorResolved)" 
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div style={{
            background: COLORS.surface,
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <h3 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: COLORS.text.primary,
              margin: "0 0 20px 0",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <PieChart size={20} color={COLORS.primary} />
              Status Distribution
            </h3>
            
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: COLORS.surface,
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              marginTop: "16px"
            }}>
              {analytics.statusData.map((item, index) => (
                <div key={index} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: COLORS.text.secondary
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: item.color
                  }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Chart */}
        <div style={{
          background: COLORS.surface,
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: COLORS.text.primary,
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <BarChart3 size={20} color={COLORS.primary} />
            Tickets by Priority
          </h3>
          
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis 
                  type="number" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.text.muted, fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: COLORS.text.primary, fontSize: 13, fontWeight: 600 }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{
                    background: COLORS.surface,
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={CHART_COLORS.blue}
                  radius={[0, 8, 8, 0]}
                  barSize={32}
                >
                  {analytics.priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      index === 0 ? CHART_COLORS.slate :
                      index === 1 ? CHART_COLORS.blue :
                      index === 2 ? CHART_COLORS.amber :
                      CHART_COLORS.red
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px"
        }}>
          <Search size={18} style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: COLORS.text.muted
          }} />
          <input
            type="text"
            placeholder="Search tickets by title, description, reporter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
              transition: "all 0.2s",
              background: "#ffffff"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center"
        }}>
          <span style={{
            fontSize: "13px",
            fontWeight: "600",
            color: COLORS.text.muted,
            marginRight: "8px"
          }}>
            Filter:
          </span>
          {["all", "OPEN", "IN PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "none",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: statusFilter === status ? COLORS.primary : "#f1f5f9",
                color: statusFilter === status ? "#ffffff" : COLORS.text.secondary,
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {status === "all" ? "All" : status.replace("_", " ")}
            </button>
          ))}
          
          {/* ✅ NEW: SLA Alert filter button */}
          <button
            onClick={() => setStatusFilter("SLA_ALERT")}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: "none",
              fontSize: "12px",
              fontWeight: "700",
              cursor: "pointer",
              background: statusFilter === "SLA_ALERT" ? "#dc2626" : "#fef2f2",
              color: statusFilter === "SLA_ALERT" ? "#ffffff" : "#dc2626",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <AlertCircle size={14} />
            SLA Alert
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: "24px",
        alignItems: "start"
      }}>
        {/* Left Panel - Ticket List */}
        <div style={{
          background: COLORS.surface,
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
          maxHeight: "calc(100vh - 300px)",
          overflowY: "auto"
        }}>
          <div style={{
            padding: "20px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc"
          }}>
            <h2 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: COLORS.text.primary,
              margin: 0
            }}>
              Tickets ({filteredTickets.length})
            </h2>
          </div>
          
          <div style={{ padding: "12px" }}>
            {filteredTickets.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: COLORS.text.muted
              }}>
                <Filter size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const style = getStatusStyle(ticket.status);
                const StatusIcon = style.icon;
                
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: selectedTicketId === ticket.id ? "#eff6ff" : "#ffffff",
                      border: `1px solid ${selectedTicketId === ticket.id ? "#bfdbfe" : "transparent"}`,
                      marginBottom: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "12px"
                    }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        background: "#f1f5f9",
                        flexShrink: 0
                      }}>
                        {ticket.imageUrls?.length > 0 ? (
                          <img 
                            src={`${BACKEND_URL}${ticket.imageUrls[0]}`} 
                            alt="" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                          }}>
                            🎫
                          </div>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: COLORS.text.primary,
                          margin: "0 0 4px 0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {ticket.title}
                        </h3>
                        <p style={{
                          fontSize: "12px",
                          color: COLORS.text.muted,
                          margin: 0
                        }}>
                          by {ticket.reporterName}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: style.bg,
                        color: style.color
                      }}>
                        <StatusIcon size={12} />
                        {style.label}
                      </span>
                      
                      {ticket.slaFirstResponseDue && (
                        <SlaTimer ticket={ticket} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div>
          {selectedTicket ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Ticket Header Card */}
              <div style={{
                background: COLORS.surface,
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "20px"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: "700",
                        background: currentStatusStyle.gradient,
                        color: currentStatusStyle.color,
                        border: `1px solid ${currentStatusStyle.border}`
                      }}>
                        {React.createElement(currentStatusStyle.icon, { size: 14 })}
                        {currentStatusStyle.label}
                      </span>
                      
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: "#f1f5f9",
                        color: COLORS.text.secondary
                      }}>
                        {selectedTicket.category || "General"}
                      </span>
                      
                      <span style={{
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: selectedTicket.priority === "HIGH" ? "#fef2f2" : 
                                   selectedTicket.priority === "MEDIUM" ? "#fffbeb" : "#f1f5f9",
                        color: selectedTicket.priority === "HIGH" ? "#dc2626" : 
                               selectedTicket.priority === "MEDIUM" ? "#d97706" : COLORS.text.secondary
                      }}>
                        {selectedTicket.priority || "Low"} Priority
                      </span>
                      
                      {selectedTicket.slaFirstResponseDue && (
                        <SlaTimer ticket={selectedTicket} />
                      )}
                    </div>
                    
                    <h2 style={{
                      fontSize: "24px",
                      fontWeight: "800",
                      color: COLORS.text.primary,
                      margin: "0 0 8px 0",
                      lineHeight: "1.3"
                    }}>
                      {selectedTicket.title}
                    </h2>
                    
                    <p style={{
                      fontSize: "14px",
                      color: COLORS.text.secondary,
                      margin: 0
                    }}>
                      Reported by <strong>{selectedTicket.reporterName}</strong> • {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Progress Steps */}
                {selectedTicket.status !== "REJECTED" && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    marginBottom: "20px"
                  }}>
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
                          <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            flex: 1
                          }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "14px",
                              fontWeight: "700",
                              background: isCompleted ? "#10b981" : isActive ? COLORS.primary : "#ffffff",
                              color: isCompleted || isActive ? "white" : "#94a3b8",
                              border: `2px solid ${isCompleted ? "#10b981" : isActive ? COLORS.primary : "#e2e8f0"}`,
                              boxShadow: isActive ? `0 0 0 4px ${COLORS.primary}20` : "none"
                            }}>
                              {isCompleted ? "✓" : step.step}
                            </div>
                            <span style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              color: isCompleted ? "#10b981" : isActive ? COLORS.primary : "#94a3b8"
                            }}>
                              {step.label}
                            </span>
                          </div>
                          
                          {!isLast && (
                            <div style={{
                              flex: 1,
                              height: "2px",
                              background: isStatusCompleted(selectedTicket.status, array[index + 1].key) ? "#10b981" : "#e2e8f0",
                              borderRadius: "1px",
                              position: "relative",
                              top: "-14px"
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Ticket Images */}
                {ticketImages.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: COLORS.text.muted,
                      marginBottom: "12px"
                    }}>
                      Attachments
                    </h4>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                      gap: "12px"
                    }}>
                      {ticketImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(`${BACKEND_URL}${img}`)}
                          style={{
                            aspectRatio: "4/3",
                            borderRadius: "10px",
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <img
                            src={`${BACKEND_URL}${img}`}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div style={{
                  padding: "20px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0"
                }}>
                  <h4 style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: COLORS.text.muted,
                    margin: "0 0 12px 0"
                  }}>
                    Description
                  </h4>
                  <p style={{
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: COLORS.text.primary,
                    margin: 0,
                    whiteSpace: "pre-wrap"
                  }}>
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div style={{
                background: COLORS.surface,
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <h3 style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  margin: "0 0 16px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <MoreVertical size={16} />
                  Status Actions
                </h3>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {availableTransitions.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.status}
                        onClick={() => changeStatus(t.status)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 20px",
                          borderRadius: "10px",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          background: t.color,
                          color: "#ffffff",
                          boxShadow: `0 4px 6px -1px ${t.color}40`,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = `0 6px 8px -1px ${t.color}50`;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = `0 4px 6px -1px ${t.color}40`;
                        }}
                      >
                        <Icon size={16} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

                            {/* Comments Section */}
              <div style={{
                background: COLORS.surface,
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  margin: "0 0 20px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <MessageSquare size={20} />
                  Comments ({comments.length})
                </h3>

                {replyTo && (
                  <div style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}>
                    <div style={{ fontSize: "14px", color: "#1e40af" }}>
                      Replying to <strong>{replyTo.author}</strong>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#3b82f6",
                        padding: "4px"
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Comment Input */}
                <div style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  overflow: "hidden",
                  marginBottom: "24px",
                  background: "#ffffff"
                }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment..."
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "16px",
                      border: "none",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                  
                  {commentImagePreview.length > 0 && (
                    <div style={{
                      display: "flex",
                      gap: "10px",
                      padding: "0 16px 16px",
                      flexWrap: "wrap"
                    }}>
                      {commentImagePreview.map((preview, i) => (
                        <div key={i} style={{
                          position: "relative",
                          width: "100px",
                          height: "100px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid #e2e8f0"
                        }}>
                          <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button
                            onClick={() => removeImage(i)}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageSelect(e)}
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={commentImages.length >= 3}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          color: COLORS.text.secondary,
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: commentImages.length >= 3 ? "not-allowed" : "pointer",
                          opacity: commentImages.length >= 3 ? 0.5 : 1
                        }}
                      >
                        <ImageIcon size={16} />
                        Attach ({commentImages.length}/3)
                      </button>
                    </div>
                    
                    <button
                      onClick={sendComment}
                      disabled={!comment.trim() && commentImages.length === 0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: COLORS.primary,
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: (!comment.trim() && commentImages.length === 0) ? "not-allowed" : "pointer",
                        opacity: (!comment.trim() && commentImages.length === 0) ? 0.5 : 1,
                        transition: "all 0.2s"
                      }}
                    >
                      <Send size={16} />
                      {replyTo ? "Send Reply" : "Post Comment"}
                    </button>
                  </div>
                </div>

                {comments.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "2px dashed #e2e8f0"
                  }}>
                    <MessageSquare size={32} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                    <p style={{ color: COLORS.text.muted, margin: 0 }}>
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  <div>
                    {buildCommentTree(comments).map((c) => renderComment(c))}
                  </div>
                )}
              </div>

              {/* Technician Assignment */}
              <div style={{
                background: COLORS.surface,
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  margin: "0 0 20px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <User size={20} />
                  {isTechnicianAssigned ? "Assigned Technician" : "Assign Technician"}
                </h3>
                
                {isTechnicianAssigned ? (
                  <div style={{
                    background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                    border: "1px solid #a7f3d0",
                    borderRadius: "12px",
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
                      fontSize: "24px"
                    }}>
                      👨‍🔧
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#065f46"
                      }}>
                        {assignedTechName}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "#059669",
                        marginTop: "4px"
                      }}>
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
                    {/* SMART ASSIGNMENT PANEL - NEW */}
                    {!isTechnicianAssigned && technicians.length > 0 && selectedTicket && (
                      <SmartAssignmentPanel 
                        ticket={selectedTicket}
                        technicians={technicians}
                        onAssign={assignTechnician}
                        assigning={assigningTechnician}
                      />
                    )}

                    {/* Divider */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      margin: '24px 0',
                      color: '#94a3b8',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                      <span>OR MANUAL SELECTION</span>
                      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    </div>

                    {/* EXISTING MANUAL ASSIGNMENT - UNCHANGED */}
                    <p style={{
                      fontSize: "14px",
                      color: COLORS.text.secondary,
                      marginBottom: "16px"
                    }}>
                      Select a technician manually:
                    </p>
                    
                    {technicians.length === 0 ? (
                      <div style={{
                        textAlign: "center",
                        padding: "40px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        border: "2px dashed #e2e8f0"
                      }}>
                        <p style={{ color: COLORS.text.muted }}>
                          No technicians available. Please add technicians first.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {technicians.map((tech) => (
                          <div
                            key={tech.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              padding: "16px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              transition: "all 0.2s"
                            }}
                          >
                            <div style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              color: "white",
                              fontWeight: "700"
                            }}>
                              {tech.name?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: "16px",
                                fontWeight: "700",
                                color: COLORS.text.primary
                              }}>
                                {tech.name}
                              </div>
                              <div style={{
                                fontSize: "13px",
                                color: COLORS.text.secondary,
                                marginTop: "2px"
                              }}>
                                {tech.specialization} • {tech.team}
                              </div>
                              <div style={{
                                fontSize: "12px",
                                color: COLORS.text.muted,
                                marginTop: "2px"
                              }}>
                                {tech.email}
                              </div>
                            </div>
                            <button
                              onClick={() => assignTechnician(tech.id)}
                              disabled={assigningTechnician}
                              style={{
                                padding: "10px 20px",
                                borderRadius: "8px",
                                border: "none",
                                background: assigningTechnician ? "#9ca3af" : COLORS.primary,
                                color: "white",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: assigningTechnician ? "not-allowed" : "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {assigningTechnician ? "Assigning..." : "Assign"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              background: COLORS.surface,
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "80px 40px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: "32px"
              }}>
                📋
              </div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: COLORS.text.primary,
                margin: "0 0 8px 0"
              }}>
                Select a Ticket
              </h3>
              <p style={{
                fontSize: "14px",
                color: COLORS.text.secondary,
                margin: 0
              }}>
                Choose a ticket from the list to view details and manage it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage("")}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "40px"
          }}
        >
          <button
            onClick={() => setPreviewImage("")}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      )}
    </div>
  );
}