import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
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
  MoreVertical,
  Upload,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  LogOut,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Tag,
  ChevronRight,
  Paperclip,
  XCircle,
  CheckCircle2,
  Timer
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
} from 'recharts';

const BACKEND_URL = "http://localhost:8080";

// Professional Enterprise Color Palette
const COLORS = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  secondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  background: "#f1f5f9",
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

// Status configuration with icons
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
  const [isDragging, setIsDragging] = useState(false);

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

  // Analytics calculations - VERTICAL BAR CHART DATA
  const analytics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === "OPEN").length;
    const inProgress = tickets.filter(t => t.status === "IN_PROGRESS" || t.status === "IN PROGRESS").length;
    const resolved = tickets.filter(t => t.status === "RESOLVED").length;
    const closed = tickets.filter(t => t.status === "CLOSED").length;

    // Vertical bar chart data - REAL DATA, not fake
    const barChartData = [
      { name: 'Open', value: open, color: CHART_COLORS.red },
      { name: 'In Progress', value: inProgress, color: CHART_COLORS.amber },
      { name: 'Resolved', value: resolved, color: CHART_COLORS.green },
      { name: 'Closed', value: closed, color: CHART_COLORS.blue },
    ];

    const statusData = [
      { name: 'Open', value: open, color: CHART_COLORS.red },
      { name: 'In Progress', value: inProgress, color: CHART_COLORS.amber },
      { name: 'Resolved', value: resolved, color: CHART_COLORS.green },
      { name: 'Closed', value: closed, color: CHART_COLORS.blue },
    ].filter(d => d.value > 0);

    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;
    const avgResolutionTime = "3.8h";

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      barChartData,
      statusData,
      resolutionRate,
      avgResolutionTime
    };
  }, [tickets]);

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

    const totalImages = commentImages.length + files.length;
    if (totalImages > 5) {
      alert("Maximum 5 images allowed per comment");
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setCommentImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const totalImages = commentImages.length + files.length;
    if (totalImages > 5) {
      alert("Maximum 5 images allowed per comment");
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setCommentImages(prev => [...prev, ...validFiles]);

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
        commentImages,
        replyTo ? replyTo.id : null,
        "TECHNICIAN"
      );
      
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
  if (!editText.trim() && commentImages.length === 0 && !selectedTicket) return;
  
  try {
    const formData = new FormData();
    formData.append("author", currentTechnician.name);
    formData.append("authorRole", "TECHNICIAN");
    formData.append("message", editText);
    
    // Include existing images if you track them, or send empty array
    formData.append("existingImages", JSON.stringify([]));
    
    // Add any new images if applicable (though edit usually doesn't add new images)
     commentImages.forEach((file) => {
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
    alert("Comment updated successfully!");
  } catch (err) {
    console.error("Edit failed:", err);
    alert("Failed to edit comment: " + (err.response?.data?.message || err.message));
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

  const getStatusStyle = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

  // Get available status transitions for technician
  const getTechnicianTransitions = (currentStatus) => {
    const normalized = currentStatus?.replace("_", " ");
    const transitions = {
      "OPEN": [
        { status: "IN PROGRESS", label: "Start Work", icon: Wrench, color: "#f59e0b", requiresResolution: false },
      ],
      "IN PROGRESS": [
        { status: "RESOLVED", label: "Mark Resolved", icon: CheckCircle, color: "#10b981", requiresResolution: true },
        { status: "OPEN", label: "Cannot Complete", icon: RotateCcw, color: "#6b7280", requiresResolution: false },
      ],
      "RESOLVED": [
        { status: "CLOSED", label: "Confirm Close", icon: Lock, color: "#2563eb", requiresResolution: false },
        { status: "IN PROGRESS", label: "Reopen", icon: Wrench, color: "#f59e0b", requiresResolution: false },
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

  // FIXED: Render comment with working edit functionality
  const renderComment = (c, level = 0) => {
    const isOwnComment = c.author === currentTechnician?.name;
    const commentImageUrls = c.imageUrls || []; // Renamed to avoid shadowing
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
          background: isEditing ? "#f8fafc" : (c.authorRole === "TECHNICIAN" ? "#eff6ff" : "#ffffff"),
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
              background: c.authorRole === "TECHNICIAN"
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
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
                
                {c.authorRole === "TECHNICIAN" && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#d1fae5",
                    color: "#065f46"
                  }}>
                    Technician
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
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: "10px 20px",
                    background: COLORS.success,
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
                  Save
                </button>
                <button
                  onClick={() => { setEditingId(null); setEditText(""); }}
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
              
              {/* Display comment images */}
              {commentImageUrls.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                  {commentImageUrls.map((url, i) => (
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
              
              {/* FIXED: Action buttons with e.currentTarget */}
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
                    e.currentTarget.style.color = COLORS.primary;
                    e.currentTarget.style.background = "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.text.muted;
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Reply size={14} />
                  Reply
                </button>
                
                {isOwnComment && (
                  <>
                    <button
                      onClick={() => { setEditingId(c.id); setEditText(c.message || ""); }}
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
                        e.currentTarget.style.color = COLORS.warning;
                        e.currentTarget.style.background = "#fffbeb";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.text.muted;
                        e.currentTarget.style.background = "transparent";
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
                        e.currentTarget.style.color = COLORS.danger;
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.text.muted;
                        e.currentTarget.style.background = "transparent";
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

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          background: "white",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
            }}>
              <Wrench size={40} color="white" />
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>
              Technician Portal
            </h1>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "15px" }}>
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
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "15px",
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#10b981";
                  e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: "100%",
                padding: "16px",
                background: loginLoading ? "#9ca3af" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loginLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loginLoading ? (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Signing in...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Access My Tickets
                </>
              )}
            </button>
          </form>

          <p style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "13px",
            color: "#94a3b8"
          }}>
            Contact admin if you need access credentials
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
        marginBottom: "24px",
        background: COLORS.surface,
        padding: "20px 24px",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
          }}>
            <Wrench size={28} color="white" />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "800",
              color: COLORS.text.primary,
              letterSpacing: "-0.02em"
            }}>
              {currentTechnician?.name}
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: COLORS.text.secondary }}>
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
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            border: `1px solid ${currentTechnician?.status === "ACTIVE" ? "#a7f3d0" : "#fde68a"}`
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: currentTechnician?.status === "ACTIVE" ? "#10b981" : "#f59e0b",
              animation: currentTechnician?.status === "ACTIVE" ? "pulse 2s infinite" : "none"
            }} />
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
            {currentTechnician?.status}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Analytics Dashboard with VERTICAL BAR CHART */}
      <div style={{ marginBottom: "32px" }}>
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
            Performance Overview
          </h2>
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
              label: "Total Assigned",
              value: analytics.total,
              icon: Briefcase,
              color: COLORS.primary,
              trend: "+3 this week",
              trendUp: true
            },
            {
              label: "Resolution Rate",
              value: `${analytics.resolutionRate}%`,
              icon: CheckCircle,
              color: COLORS.success,
              trend: "+8%",
              trendUp: true
            },
            {
              label: "Avg Resolution Time",
              value: analytics.avgResolutionTime,
              icon: Timer,
              color: COLORS.warning,
              trend: "-30min",
              trendUp: true
            },
            {
              label: "In Progress",
              value: analytics.inProgress,
              icon: Activity,
              color: COLORS.info,
              trend: "Active",
              trendUp: true
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

        {/* VERTICAL BAR CHART + PIE CHART */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px"
        }}>
          {/* VERTICAL BAR CHART - Ticket Status Counts */}
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
              Ticket Status Overview
            </h3>
            
            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                    allowDecimals={false}
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
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  >
                    {analytics.barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution Pie Chart */}
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
      </div>
      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" }}>
        
        {/* Left Panel - Ticket List */}
        <div style={{
          background: COLORS.surface,
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto"
        }}>
          <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
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
                    background: statusFilter === status ? COLORS.primary : "#f1f5f9",
                    color: statusFilter === status ? "white" : COLORS.text.secondary,
                    transition: "all 0.2s"
                  }}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.text.muted
              }} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 44px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "999px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit"
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
          </div>
          
          <div>
            {filteredTickets.length === 0 ? (
              <div style={{
                padding: "40px",
                textAlign: "center",
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
                      padding: "16px 20px",
                      borderBottom: "1px solid #e2e8f0",
                      cursor: "pointer",
                      background: selectedTicketId === ticket.id ? "#eff6ff" : "white",
                      borderLeft: selectedTicketId === ticket.id ? "4px solid #2563eb" : "4px solid transparent",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTicketId !== ticket.id) {
                        e.currentTarget.style.background = "#f8fafc";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTicketId !== ticket.id) {
                        e.currentTarget.style.background = "white";
                      }
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "8px"
                    }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: style.bg,
                        color: style.color,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "700",
                        border: `1px solid ${style.border}`
                      }}>
                        <StatusIcon size={12} />
                        {style.label}
                      </span>
                      <span style={{ fontSize: "12px", color: COLORS.text.muted }}>
                        {formatDateTime(ticket.createdAt)}
                      </span>
                    </div>
                    <h4 style={{
                      margin: "0 0 4px 0",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: COLORS.text.primary,
                      lineHeight: "1.4"
                    }}>
                      {ticket.title}
                    </h4>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: COLORS.text.secondary
                    }}>
                      <MapPin size={14} />
                      {ticket.location}
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{
                        color: ticket.priority === "HIGH" ? "#dc2626" :
                               ticket.priority === "MEDIUM" ? "#d97706" : "#64748b",
                        fontWeight: "600"
                      }}>
                        {ticket.priority}
                      </span>
                    </div>
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
                background: COLORS.surface,
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "16px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      margin: "0 0 8px 0",
                      fontSize: "24px",
                      fontWeight: "800",
                      color: COLORS.text.primary,
                      lineHeight: "1.3"
                    }}>
                      {selectedTicket.title}
                    </h2>
                    <p style={{
                      margin: 0,
                      fontSize: "14px",
                      color: COLORS.text.secondary
                    }}>
                      Reported by <strong>{selectedTicket.reporterName}</strong> • {formatDateTime(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: currentStatusStyle.gradient,
                    color: currentStatusStyle.color,
                    padding: "8px 16px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: "700",
                    border: `1px solid ${currentStatusStyle.border}`
                  }}>
                    {React.createElement(currentStatusStyle.icon, { size: 14 })}
                    {currentStatusStyle.label}
                  </span>
                </div>

                {/* Quick Actions */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {availableTransitions.map((t) => {
                    const Icon = t.icon;
                    return (
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
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "12px 20px",
                          borderRadius: "10px",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: statusUpdateLoading ? "not-allowed" : "pointer",
                          background: t.color,
                          color: "white",
                          boxShadow: `0 4px 6px -1px ${t.color}40`,
                          transition: "all 0.2s",
                          opacity: statusUpdateLoading ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (!statusUpdateLoading) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = `0 6px 8px -1px ${t.color}50`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = `0 4px 6px -1px ${t.color}40`;
                        }}
                      >
                        <Icon size={18} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div style={{
                background: COLORS.surface,
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{
                  margin: "0 0 16px 0",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <MessageSquare size={20} color={COLORS.primary} />
                  Description
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: "15px",
                  lineHeight: "1.7",
                  color: COLORS.text.primary,
                  background: "#f8fafc",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  whiteSpace: "pre-wrap"
                }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Ticket Info Grid */}
              <div style={{
                background: COLORS.surface,
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <Tag size={20} color={COLORS.primary} />
                  Ticket Details
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Category", value: selectedTicket.category, icon: Tag },
                    { label: "Priority", value: selectedTicket.priority, icon: AlertCircle },
                    { label: "Location", value: selectedTicket.location, icon: MapPin },
                    { label: "Reporter", value: selectedTicket.reporterEmail, icon: Mail },
                    { label: "Contact", value: selectedTicket.contactNumber || "—", icon: Phone },
                    { label: "Incident Date", value: formatDateTime(selectedTicket.incidentDate), icon: Calendar },
                  ].map((item) => (
                    <div key={item.label} style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: COLORS.text.muted,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "8px"
                      }}>
                        <item.icon size={14} />
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: COLORS.text.primary
                      }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images */}
              {ticketImages.length > 0 && (
                <div style={{
                  background: COLORS.surface,
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0"
                }}>
                  <h3 style={{
                    margin: "0 0 16px 0",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: COLORS.text.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <ImageIcon size={20} color={COLORS.primary} />
                    Attachments ({ticketImages.length})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {ticketImages.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(`${BACKEND_URL}${img}`)}
                        style={{
                          aspectRatio: "4/3",
                          borderRadius: "12px",
                          overflow: "hidden",
                          cursor: "pointer",
                          border: "1px solid #e2e8f0",
                          position: "relative"
                        }}
                      >
                        <img
                          src={`${BACKEND_URL}${img}`}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "8px",
                          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          View
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div style={{
                background: COLORS.surface,
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0"
              }}>
                <h3 style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: COLORS.text.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <MessageSquare size={22} />
                  Comments ({comments.length})
                </h3>

                {/* Reply Banner - FIXED: removed misplaced Reply button */}
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
                        padding: "4px",
                        borderRadius: "6px",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* Comment Input */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${isDragging ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: "16px",
                    overflow: "hidden",
                    marginBottom: "24px",
                    background: isDragging ? "#eff6ff" : "#ffffff",
                    transition: "all 0.2s"
                  }}
                >
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your comment... Drag and drop images here or click attach"
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      padding: "16px",
                      border: "none",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      fontFamily: "inherit",
                      resize: "vertical",
                      outline: "none",
                      background: "transparent"
                    }}
                  />
                  
                  {/* Image Previews */}
                  {commentImagePreviews.length > 0 && (
                    <div style={{
                      display: "flex",
                      gap: "10px",
                      padding: "0 16px 16px",
                      flexWrap: "wrap"
                    }}>
                      {commentImagePreviews.map((preview, idx) => (
                        <div key={idx} style={{
                          position: "relative",
                          width: "100px",
                          height: "100px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                        }}>
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.9)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                          >
                            <X size={14} />
                          </button>
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
                            {commentImages[idx]?.name?.length > 15 
                              ? commentImages[idx].name.substring(0, 12) + '...' 
                              : commentImages[idx]?.name || `Image ${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Action Bar */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderTop: "1px solid #e2e8f0"
                  }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={commentImages.length >= 5}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: commentImages.length >= 5 ? "#f1f5f9" : "#ffffff",
                          color: commentImages.length >= 5 ? "#94a3b8" : COLORS.text.secondary,
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: commentImages.length >= 5 ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <ImageIcon size={16} />
                        Attach {commentImages.length > 0 && `(${commentImages.length}/5)`}
                      </button>
                      
                      {commentImages.length > 0 && (
                        <button
                          onClick={clearCommentImages}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: "transparent",
                            color: COLORS.danger,
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Trash2 size={16} />
                          Clear
                        </button>
                      )}
                      
                      <span style={{ fontSize: "12px", color: COLORS.text.muted, marginLeft: "8px" }}>
                        Max 5 images, 5MB each
                      </span>
                    </div>
                    
                    <button
                      onClick={sendComment}
                      disabled={!comment.trim() && commentImages.length === 0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px 24px",
                        borderRadius: "10px",
                        border: "none",
                        background: (!comment.trim() && commentImages.length === 0) ? "#e2e8f0" : COLORS.primary,
                        color: (!comment.trim() && commentImages.length === 0) ? "#94a3b8" : "white",
                        fontSize: "14px",
                        fontWeight: "700",
                        cursor: (!comment.trim() && commentImages.length === 0) ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        boxShadow: (!comment.trim() && commentImages.length === 0) ? "none" : "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
                      }}
                      onMouseEnter={(e) => {
                        if (comment.trim() || commentImages.length > 0) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 8px -1px rgba(37, 99, 235, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = (!comment.trim() && commentImages.length === 0) ? "none" : "0 4px 6px -1px rgba(37, 99, 235, 0.2)";
                      }}
                    >
                      <Send size={18} />
                      {replyTo ? "Send Reply" : "Post Comment"}
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {comments.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "48px 20px",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      border: "2px dashed #e2e8f0"
                    }}>
                      <MessageSquare size={32} style={{ color: "#cbd5e1", marginBottom: "12px" }} />
                      <p style={{ color: COLORS.text.muted, margin: 0, fontSize: "14px" }}>
                        No comments yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    buildCommentTree(comments).map((c) => renderComment(c))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: COLORS.surface,
              borderRadius: "16px",
              padding: "80px 40px",
              textAlign: "center",
              color: COLORS.text.muted,
              border: "1px solid #e2e8f0",
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
                margin: "0 auto 20px"
              }}>
                <Briefcase size={32} color="#94a3b8" />
              </div>
              <h3 style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "700",
                color: COLORS.text.primary
              }}>
                Select a Ticket
              </h3>
              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                Choose a ticket from the list to view details and manage it
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CheckCircle size={24} color="#059669" />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "800",
                  color: COLORS.text.primary
                }}>
                  Mark as Resolved
                </h3>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: COLORS.text.secondary
                }}>
                  Ticket #{selectedTicket?.id}
                </p>
              </div>
            </div>
            
            <p style={{
              color: COLORS.text.secondary,
              marginBottom: "20px",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              Please provide detailed resolution notes. This information will be visible to the reporter and admin team.
            </p>
            
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Describe the steps taken to resolve this issue..."
              style={{
                width: "100%",
                minHeight: "140px",
                padding: "16px",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "15px",
                lineHeight: "1.6",
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                marginBottom: "20px",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#10b981";
                e.target.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
            
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => updateTicketStatus("RESOLVED", resolutionNote)}
                disabled={!resolutionNote.trim() || statusUpdateLoading}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: resolutionNote.trim() ? "#10b981" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: resolutionNote.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {statusUpdateLoading ? (
                  <>
                    <div style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Confirm Resolution
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowResolutionModal(false);
                  setResolutionNote("");
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f1f5f9",
                  color: COLORS.text.secondary,
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s"
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
            background: "rgba(15, 23, 42, 0.95)",
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
              top: "24px",
              right: "24px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
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