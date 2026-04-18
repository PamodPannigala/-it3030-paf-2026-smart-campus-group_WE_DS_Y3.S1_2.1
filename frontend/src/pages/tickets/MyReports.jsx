// src/pages/tickets/MyReports.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets, deleteTicket } from "../../services/ticketApi";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  Tag,
  MoreHorizontal,
  Inbox,
  Loader2,
  TrendingUp,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

export default function MyReports() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ticket: null });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const storedEmail = localStorage.getItem("userEmail");
      if (!storedEmail) {
        setLoading(false);
        return;
      }
      const email = storedEmail.trim().toLowerCase();
      const res = await getMyTickets(email);
      setTickets(res.data || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleRowClick = (ticketId) => {
    navigate(`/my-reports/${ticketId}`);
  };

  const handleDeleteClick = (e, ticket) => {
    e.stopPropagation(); // Prevent row click
    setDeleteModal({ isOpen: true, ticket });
  };

  const confirmDelete = async () => {
    if (!deleteModal.ticket) return;
    
    try {
      setDeleting(true);
      await deleteTicket(deleteModal.ticket.id);
      // Remove from local state
      setTickets(prev => prev.filter(t => t.id !== deleteModal.ticket.id));
      setDeleteModal({ isOpen: false, ticket: null });
    } catch (error) {
      console.error("Error deleting ticket", error);
      alert("Failed to delete ticket. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, ticket: null });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusConfig = (status) => {
    const s = (status || "new").toLowerCase();
    const configs = {
      new: {
        icon: AlertCircle,
        bg: "#dbeafe",
        color: "#1d4ed8",
        border: "#93c5fd",
        label: "New",
      },
      open: {
        icon: Clock,
        bg: "#fef3c7",
        color: "#d97706",
        border: "#fbbf24",
        label: "Open",
      },
      "in progress": {
        icon: TrendingUp,
        bg: "#e0e7ff",
        color: "#4f46e5",
        border: "#a5b4fc",
        label: "In Progress",
      },
      resolved: {
        icon: CheckCircle2,
        bg: "#dcfce7",
        color: "#15803d",
        border: "#86efac",
        label: "Resolved",
      },
      closed: {
        icon: Ticket,
        bg: "#f3f4f6",
        color: "#4b5563",
        border: "#d1d5db",
        label: "Closed",
      },
      rejected: {
        icon: AlertCircle,
        bg: "#fee2e2",
        color: "#dc2626",
        border: "#fca5a5",
        label: "Rejected",
      },
    };
    return configs[s] || configs.new;
  };

  const getPriorityColor = (priority) => {
    const p = (priority || "low").toLowerCase();
    const colors = {
      low: { bg: "#f3f4f6", color: "#6b7280" },
      medium: { bg: "#dbeafe", color: "#2563eb" },
      high: { bg: "#fef3c7", color: "#d97706" },
      urgent: { bg: "#fee2e2", color: "#dc2626" },
    };
    return colors[p] || colors.low;
  };

  const filteredAndSortedTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchSearch = (ticket.subject || ticket.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (ticket.status || "new").toLowerCase() === statusFilter;

      return matchSearch && matchStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";

      if (sortDirection === "asc") {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
  }, [tickets, searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredAndSortedTickets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => ["new", "open"].includes((t.status || "").toLowerCase())).length,
      resolved: tickets.filter((t) => (t.status || "").toLowerCase() === "resolved").length,
      inProgress: tickets.filter((t) => (t.status || "").toLowerCase() === "in progress").length,
    };
  }, [tickets]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statusTabs = [
    { value: "all", label: "All Tickets", count: stats.total },
    { value: "new", label: "New", count: tickets.filter((t) => (t.status || "").toLowerCase() === "new").length },
    { value: "open", label: "Open", count: tickets.filter((t) => (t.status || "").toLowerCase() === "open").length },
    { value: "in progress", label: "In Progress", count: stats.inProgress },
    { value: "resolved", label: "Resolved", count: stats.resolved },
    { value: "closed", label: "Closed", count: tickets.filter((t) => (t.status || "").toLowerCase() === "closed").length },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      padding: "32px 24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "28px",
    },
    eyebrow: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      background: "#e9ebfe",
      color: "#5577ff",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "12px",
    },
    title: {
      fontSize: "36px",
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: "8px",
      letterSpacing: "-0.025em",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "16px",
      lineHeight: "1.6",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "28px",
    },
    statCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      transition: "all 0.2s ease",
    },
    statIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    statContent: {
      flex: 1,
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "13px",
      color: "#64748b",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    controlsCard: {
      background: "#fff",
      borderRadius: "16px",
      padding: "20px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginBottom: "24px",
    },
    tabsContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "20px",
      flexWrap: "wrap",
      borderBottom: "1px solid #e2e8f0",
      paddingBottom: "16px",
    },
    tab: {
      padding: "8px 16px",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.2s ease",
    },
    tabActive: {
      background: "#0f172a",
      color: "#fff",
    },
    tabCount: {
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      background: "rgba(255,255,255,0.2)",
    },
    filterRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },
    searchWrapper: {
      position: "relative",
      flex: 1,
      minWidth: "280px",
      maxWidth: "400px",
    },
    searchIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      pointerEvents: "none",
    },
    input: {
      width: "100%",
      padding: "12px 16px 12px 44px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "#f8fafc",
      color: "#0f172a",
      outline: "none",
      transition: "all 0.2s ease",
    },
    createBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      background: "#3a46ed",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(124,58,237,0.25)",
      transition: "all 0.2s ease",
    },
    tableCard: {
      background: "#fff",
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
    },
    th: {
      padding: "16px 20px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      cursor: "pointer",
      userSelect: "none",
      whiteSpace: "nowrap",
    },
    thActions: {
      padding: "16px 20px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "700",
      color: "#64748b",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      whiteSpace: "nowrap",
      width: "80px",
    },
    td: {
      padding: "20px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
      verticalAlign: "middle",
    },
    tdActions: {
      padding: "20px",
      borderBottom: "1px solid #f1f5f9",
      textAlign: "center",
      verticalAlign: "middle",
      width: "80px",
    },
    row: {
      cursor: "pointer",
      transition: "all 0.15s ease",
    },
    ticketId: {
      fontFamily: "monospace",
      fontSize: "13px",
      fontWeight: "700",
      color: "#0f172a",
      background: "#f1f5f9",
      padding: "6px 10px",
      borderRadius: "8px",
      display: "inline-block",
    },
    subjectCell: {
      fontWeight: "600",
      color: "#0f172a",
      maxWidth: "300px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    categoryBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      background: "#f1f5f9",
      color: "#475569",
    },
    priorityBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      border: "1px solid",
    },
    dateCell: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#64748b",
      fontSize: "13px",
    },
    deleteBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      border: "none",
      background: "transparent",
      color: "#94a3b8",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    deleteBtnHover: {
      background: "#fee2e2",
      color: "#dc2626",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px",
      background: "#fff",
      borderTop: "1px solid #f1f5f9",
      flexWrap: "wrap",
      gap: "16px",
    },
    pageInfo: {
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "500",
    },
    pageControls: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    pageBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      background: "#fff",
      color: "#475569",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    pageBtnDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    pageBtnActive: {
      background: "#0f172a",
      color: "#fff",
      borderColor: "#0f172a",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px",
      color: "#64748b",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 20px",
      textAlign: "center",
    },
    emptyIcon: {
      width: "80px",
      height: "80px",
      background: "#f1f5f9",
      borderRadius: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      color: "#94a3b8",
    },
    emptyTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "8px",
    },
    emptyText: {
      color: "#64748b",
      fontSize: "15px",
      maxWidth: "400px",
      marginBottom: "24px",
    },
    // Modal styles
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      background: "#fff",
      borderRadius: "20px",
      padding: "32px",
      maxWidth: "420px",
      width: "100%",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      animation: "modalSlideIn 0.2s ease",
    },
    modalIcon: {
      width: "64px",
      height: "64px",
      background: "#fee2e2",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      color: "#dc2626",
    },
    modalTitle: {
      fontSize: "22px",
      fontWeight: "800",
      color: "#0f172a",
      textAlign: "center",
      marginBottom: "12px",
    },
    modalText: {
      fontSize: "15px",
      color: "#64748b",
      textAlign: "center",
      lineHeight: "1.6",
      marginBottom: "24px",
    },
    modalTicketId: {
      fontFamily: "monospace",
      fontWeight: "700",
      color: "#0f172a",
      background: "#f1f5f9",
      padding: "2px 8px",
      borderRadius: "6px",
    },
    modalButtons: {
      display: "flex",
      gap: "12px",
    },
    modalBtnSecondary: {
      flex: 1,
      padding: "12px 20px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      background: "#fff",
      color: "#475569",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    modalBtnDanger: {
      flex: 1,
      padding: "12px 20px",
      borderRadius: "12px",
      border: "none",
      background: "#dc2626",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    modalBtnDangerDisabled: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
  };

  const sortableHeader = (label, field) => (
    <th
      style={styles.th}
      onClick={() => handleSort(field)}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#0f172a";
        e.currentTarget.style.background = "#f1f5f9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#64748b";
        e.currentTarget.style.background = "#f8fafc";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {label}
        <ArrowUpDown size={14} style={{ opacity: sortField === field ? 1 : 0.5 }} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <Loader2 size={48} style={{ animation: "spin 1s linear infinite", marginBottom: "16px" }} />
            <p>Loading your tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalSlideIn { 
          from { opacity: 0; transform: translateY(-10px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
      `}</style>
      
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={styles.modalOverlay} onClick={cancelDelete}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3 style={styles.modalTitle}>Delete Ticket?</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete ticket{" "}
              <span style={styles.modalTicketId}>#{deleteModal.ticket?.id}</span>? 
              This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.modalBtnSecondary}
                onClick={cancelDelete}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.modalBtnDanger,
                  ...(deleting ? styles.modalBtnDangerDisabled : {}),
                }}
                onClick={confirmDelete}
                disabled={deleting}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = "#b91c1c";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.eyebrow}>
            <Ticket size={14} />
            Ticket Management
          </div>
          <h1 style={styles.title}>My Submitted Tickets</h1>
          <p style={styles.subtitle}>
            Track status, progress, and updates of your support requests
          </p>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 40px -10px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
            }}
          >
            <div style={{ ...styles.statIcon, background: "#ede9fe", color: "#7c3aed" }}>
              <Ticket size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tickets</div>
            </div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 40px -10px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
            }}
          >
            <div style={{ ...styles.statIcon, background: "#fef3c7", color: "#d97706" }}>
              <Clock size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={{ ...styles.statValue, color: "#d97706" }}>{stats.open}</div>
              <div style={styles.statLabel}>Open / New</div>
            </div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 40px -10px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
            }}
          >
            <div style={{ ...styles.statIcon, background: "#e0e7ff", color: "#4f46e5" }}>
              <TrendingUp size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={{ ...styles.statValue, color: "#4f46e5" }}>{stats.inProgress}</div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
          </div>

          <div
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 10px 40px -10px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = styles.statCard.boxShadow;
            }}
          >
            <div style={{ ...styles.statIcon, background: "#dcfce7", color: "#15803d" }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={{ ...styles.statValue, color: "#15803d" }}>{stats.resolved}</div>
              <div style={styles.statLabel}>Resolved</div>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div style={styles.controlsCard}>
          {/* Status Tabs */}
          <div style={styles.tabsContainer}>
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                style={{
                  ...styles.tab,
                  ...(statusFilter === tab.value ? styles.tabActive : {}),
                }}
                onClick={() => setStatusFilter(tab.value)}
                onMouseEnter={(e) => {
                  if (statusFilter !== tab.value) {
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (statusFilter !== tab.value) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748b";
                  }
                }}
              >
                {tab.label}
                <span style={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Filter Row */}
          <div style={styles.filterRow}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by subject or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.background = "#fff";
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "#f8fafc";
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              style={styles.createBtn}
              onClick={() => navigate("/create-ticket")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = styles.createBtn.boxShadow;
              }}
            >
              <Plus size={18} />
              Create Ticket
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div style={styles.tableCard}>
          {filteredAndSortedTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Inbox size={40} />
              </div>
              <h3 style={styles.emptyTitle}>No tickets found</h3>
              <p style={styles.emptyText}>
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria to see more results."
                  : "You haven't submitted any tickets yet. Create your first ticket to get started."}
              </p>
              <button
                style={styles.createBtn}
                onClick={() => navigate("/create-ticket")}
              >
                <Plus size={18} />
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {sortableHeader("Ticket ID", "id")}
                      {sortableHeader("Subject", "subject")}
                      {sortableHeader("Category", "category")}
                      {sortableHeader("Priority", "priority")}
                      {sortableHeader("Status", "status")}
                      {sortableHeader("Created", "createdAt")}
                      <th style={styles.thActions}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => {
                      const statusConfig = getStatusConfig(ticket.status);
                      const StatusIcon = statusConfig.icon;
                      const priorityStyle = getPriorityColor(ticket.priority);

                      return (
                        <tr
                          key={ticket.id}
                          style={styles.row}
                          onClick={() => handleRowClick(ticket.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff";
                          }}
                        >
                          <td style={styles.td}>
                            <span style={styles.ticketId}>#{ticket.id}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.subjectCell} title={ticket.subject || ticket.title}>
                              {ticket.subject || ticket.title || "-"}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.categoryBadge}>
                              <Tag size={12} />
                              {ticket.category || "General"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.priorityBadge,
                                background: priorityStyle.bg,
                                color: priorityStyle.color,
                              }}
                            >
                              {ticket.priority || "Low"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                background: statusConfig.bg,
                                color: statusConfig.color,
                                borderColor: statusConfig.border,
                              }}
                            >
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.dateCell}>
                              <Calendar size={14} />
                              {formatDate(ticket.createdAt)}
                            </div>
                          </td>
                          <td style={styles.tdActions}>
                            <button
                              style={styles.deleteBtn}
                              onClick={(e) => handleDeleteClick(e, ticket)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                                e.currentTarget.style.color = "#dc2626";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                              }}
                              title="Delete ticket"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={styles.footer}>
                <div style={styles.pageInfo}>
                  Showing {paginatedTickets.length > 0 ? startIndex + 1 : 0} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredAndSortedTickets.length)} of{" "}
                  {filteredAndSortedTickets.length} tickets
                </div>

                <div style={styles.pageControls}>
                  <button
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === 1 ? styles.pageBtnDisabled : {}),
                    }}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = "#0f172a";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        style={{
                          ...styles.pageBtn,
                          ...(pageNum === currentPage ? styles.pageBtnActive : {}),
                          minWidth: "36px",
                        }}
                        onClick={() => setCurrentPage(pageNum)}
                        onMouseEnter={(e) => {
                          if (pageNum !== currentPage) {
                            e.currentTarget.style.borderColor = "#0f172a";
                            e.currentTarget.style.color = "#0f172a";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (pageNum !== currentPage) {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.color = "#475569";
                          }
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    style={{
                      ...styles.pageBtn,
                      ...(currentPage === totalPages || totalPages === 0
                        ? styles.pageBtnDisabled
                        : {}),
                    }}
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages && totalPages !== 0) {
                        e.currentTarget.style.borderColor = "#0f172a";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#475569";
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}