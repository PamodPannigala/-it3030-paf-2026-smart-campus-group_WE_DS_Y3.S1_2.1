// src/pages/tickets/PublicTickets.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
} from "lucide-react";
import SlaTimer from "../../components/tickets/SlaTimer"; // ✅ NEW

export default function PublicTickets() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8082/api/tickets");
      setTickets(res.data || []);
    } catch (error) {
      console.error("Error fetching public tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = (ticket.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (ticket.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getAvatar = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#059669", "#0891b2", "#4f46e5"
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getCategoryColor = (category) => {
    const c = (category || "general").toLowerCase();
    const map = {
      electrical: { bg: "#fef3c7", text: "#d97706", border: "#fbbf24" },
      cleaning: { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
      security: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
      maintenance: { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" },
      general: { bg: "#ede9fe", text: "#7c3aed", border: "#c4b5fd" },
      technical: { bg: "#cffafe", text: "#0891b2", border: "#67e8f9" },
      billing: { bg: "#fce7f3", text: "#db2777", border: "#f9a8d4" },
    };
    return map[c] || map.general;
  };

  const getStatusConfig = (status) => {
    const s = (status || "open").toLowerCase();
    const configs = {
      open: { icon: AlertCircle, color: "#f59e0b", bg: "#fffbeb", label: "Open" },
      repaired: { icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5", label: "Repaired" },
      rejected: { icon: XCircle, color: "#ef4444", bg: "#fef2f2", label: "Rejected" },
      "in progress": { icon: TrendingUp, color: "#3b82f6", bg: "#eff6ff", label: "In Progress" },
      closed: { icon: CheckCircle2, color: "#6b7280", bg: "#f3f4f6", label: "Closed" },
    };
    return configs[s] || configs.open;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => (t.status || "").toLowerCase() === "open").length,
      repaired: tickets.filter(t => (t.status || "").toLowerCase() === "repaired").length,
    };
  }, [tickets]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const styles = {
    page: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      minHeight: "100vh",
      padding: "40px 24px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    container: {
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "32px",
      textAlign: "center",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      background: "#dbeafe",
      color: "#1d4ed8",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "16px",
    },
    title: {
      fontSize: "42px",
      fontWeight: "800",
      color: "#0f172a",
      marginBottom: "12px",
      letterSpacing: "-0.025em",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "18px",
      maxWidth: "600px",
      margin: "0 auto",
      lineHeight: "1.6",
    },
    statsBar: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    statCard: {
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    controls: {
      display: "flex",
      gap: "16px",
      marginBottom: "28px",
      flexWrap: "wrap",
      background: "#fff",
      padding: "20px",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    searchWrapper: {
      position: "relative",
      flex: 1,
      minWidth: "320px",
    },
    searchIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      pointerEvents: "none",
    },
    input: {
      width: "100%",
      padding: "14px 16px 14px 48px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      outline: "none",
      background: "#f8fafc",
      color: "#0f172a",
      fontSize: "15px",
      fontWeight: "500",
      transition: "all 0.2s ease",
    },
    selectWrapper: {
      position: "relative",
      minWidth: "180px",
    },
    filterIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      pointerEvents: "none",
    },
    select: {
      width: "100%",
      padding: "14px 16px 14px 44px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      background: "#f8fafc",
      color: "#0f172a",
      fontSize: "15px",
      fontWeight: "500",
      cursor: "pointer",
      outline: "none",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      paddingRight: "40px",
    },
    resultsInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      color: "#64748b",
      fontSize: "14px",
      fontWeight: "500",
    },
    grid: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    post: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "16px",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },
    postHover: {
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
      transform: "translateY(-2px)",
      borderColor: "#cbd5e1",
    },
    postBody: {
      padding: "24px",
    },
    metaTop: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
    },
    avatar: {
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    metaInfo: {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
    },
    authorName: {
      fontSize: "15px",
      fontWeight: "700",
      color: "#0f172a",
    },
    metaRow: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#64748b",
    },
    dot: {
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: "#cbd5e1",
    },
    titleText: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#0f172a",
      marginBottom: "12px",
      lineHeight: "1.4",
      letterSpacing: "-0.01em",
    },
    description: {
      color: "#475569",
      lineHeight: "1.7",
      fontSize: "15px",
      marginBottom: "20px",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    tagsRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
    category: {
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      border: "1px solid",
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
    },
    commentBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      marginLeft: "auto",
      padding: "10px 18px",
      background: "#f1f5f9",
      color: "#475569",
      borderRadius: "999px",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s ease",
      border: "none",
      cursor: "pointer",
    },
    commentBtnHover: {
      background: "#e2e8f0",
      color: "#0f172a",
    },
    pagination: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      marginTop: "40px",
      padding: "20px",
    },
    pageBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "12px 20px",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      background: "#fff",
      color: "#475569",
      fontSize: "14px",
      fontWeight: "600",
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
    pageNumber: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      background: "#fff",
      color: "#475569",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px",
      color: "#64748b",
    },
    spinner: {
      animation: "spin 1s linear infinite",
      marginBottom: "16px",
    },
    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 20px",
      textAlign: "center",
      background: "#fff",
      borderRadius: "16px",
      border: "1px dashed #cbd5e1",
    },
    emptyIcon: {
      width: "64px",
      height: "64px",
      background: "#f1f5f9",
      borderRadius: "16px",
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
    },
    // ✅ NEW: SLA Timer container style
    slaContainer: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <Loader2 size={48} style={styles.spinner} />
            <p>Loading tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>
            <Users size={14} />
            Community Forum
          </div>
          <h1 style={styles.title}>Campus Community Board</h1>
          <p style={styles.subtitle}>
            Browse, search, and engage with campus maintenance requests and community discussions
          </p>
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Tickets</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statValue, color: "#f59e0b"}}>{stats.open}</div>
            <div style={styles.statLabel}>Open Issues</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statValue, color: "#10b981"}}>{stats.repaired}</div>
            <div style={styles.statLabel}>Resolved</div>
          </div>
          <div style={styles.statCard}>
            <div style={{...styles.statValue, color: "#8b5cf6"}}>
              {Math.round((stats.repaired / (stats.total || 1)) * 100)}%
            </div>
            <div style={styles.statLabel}>Resolution Rate</div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <Search size={20} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search discussions by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={styles.selectWrapper}>
            <Filter size={18} style={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#3b82f6";
              }}
              onBlur={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#e2e8f0";
              }}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in progress">In Progress</option>
              <option value="repaired">Repaired</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div style={styles.resultsInfo}>
          <span>
            Showing {filteredTickets.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
          </span>
          {searchTerm && (
            <span style={{color: "#3b82f6", fontWeight: "600"}}>
              Search: "{searchTerm}"
            </span>
          )}
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Inbox size={32} />
            </div>
            <h3 style={styles.emptyTitle}>No tickets found</h3>
            <p style={styles.emptyText}>
              {searchTerm 
                ? `No tickets match your search for "${searchTerm}". Try different keywords or clear the filters.`
                : "There are no tickets to display at the moment. Check back later!"}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {paginatedTickets.map((ticket) => {
              const categoryStyle = getCategoryColor(ticket.category);
              const statusConfig = getStatusConfig(ticket.status);
              const StatusIcon = statusConfig.icon;
              const avatarColor = getAvatarColor(ticket.reporterName);
              
              return (
                <div
                  key={ticket.id}
                  style={styles.post}
                  onClick={() => navigate(`/my-reports/${ticket.id}`)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.postHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = styles.post.boxShadow;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = styles.post.border.split(" ")[2];
                  }}
                >
                  <div style={styles.postBody}>
                    <div style={styles.metaTop}>
                      <div style={{...styles.avatar, background: avatarColor}}>
                        {getAvatar(ticket.reporterName)}
                      </div>
                      <div style={styles.metaInfo}>
                        <span style={styles.authorName}>
                          {ticket.reporterName || "Anonymous"}
                        </span>
                        <div style={styles.metaRow}>
                          <Clock3 size={14} />
                          <span>{formatDate(ticket.createdAt)}</span>
                          <span style={styles.dot}></span>
                          <span>Ticket #{ticket.id}</span>
                        </div>
                      </div>
                      {/* ✅ NEW: SLA Timer in header */}
                      <div style={styles.slaContainer}>
                        <SlaTimer ticket={ticket} />
                      </div>
                    </div>

                    <h3 style={styles.titleText}>{ticket.title}</h3>

                    <p style={styles.description}>
                      {ticket.description || "No description provided."}
                    </p>

                    <div style={styles.tagsRow}>
                      <span
                        style={{
                          ...styles.category,
                          background: categoryStyle.bg,
                          color: categoryStyle.text,
                          borderColor: categoryStyle.border,
                        }}
                      >
                        {ticket.category || "General"}
                      </span>

                      <span
                        style={{
                          ...styles.statusBadge,
                          background: statusConfig.bg,
                          color: statusConfig.color,
                        }}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>

                      <button
                        style={styles.commentBtn}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#e2e8f0";
                          e.currentTarget.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#f1f5f9";
                          e.currentTarget.style.color = "#475569";
                        }}
                      >
                        <MessageSquare size={16} />
                        Join Discussion
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
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
              Previous
            </button>

            <div style={{display: "flex", gap: "8px"}}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current, and neighbors
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span style={{padding: "12px 8px", color: "#94a3b8"}}>...</span>
                        <button
                          style={{
                            ...styles.pageNumber,
                            ...(page === currentPage ? styles.pageBtnActive : {}),
                          }}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      style={{
                        ...styles.pageNumber,
                        ...(page === currentPage ? styles.pageBtnActive : {}),
                      }}
                      onClick={() => setCurrentPage(page)}
                      onMouseEnter={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.borderColor = "#0f172a";
                          e.currentTarget.style.color = "#0f172a";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (page !== currentPage) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.color = "#475569";
                        }
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>

            <button
              style={{
                ...styles.pageBtn,
                ...(currentPage === totalPages ? styles.pageBtnDisabled : {}),
              }}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.borderColor = "#0f172a";
                  e.currentTarget.style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#475569";
              }}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}