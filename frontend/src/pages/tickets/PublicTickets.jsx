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
} from "lucide-react";

export default function PublicTickets() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tickets");
      setTickets(res.data || []);
    } catch (error) {
      console.error("Error fetching public tickets", error);
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

  const getCategoryColor = (category) => {
    const c = (category || "general").toLowerCase();
    const map = {
      electrical: "#f59e0b",
      cleaning: "#10b981",
      security: "#ef4444",
      maintenance: "#3b82f6",
      general: "#8b5cf6",
    };
    return map[c] || "#8b5cf6";
  };

  const styles = {
    page: {
      background: "#dae0e6",
      minHeight: "100vh",
      padding: "30px 20px",
      display: "flex",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    },
    container: {
      width: "100%",
      maxWidth: "850px",
    },
    header: {
      marginBottom: "20px",
    },
    title: {
      fontSize: "30px",
      fontWeight: "700",
      color: "#1a1a1b",
    },
    subtitle: {
      color: "#4b5563",
      marginTop: "5px",
    },
    controls: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    input: {
      flex: 1,
      padding: "12px 16px",
      borderRadius: "999px",
      border: "1px solid #d1d5db",
      outline: "none",
      background: "#fff",
      minWidth: "250px",
    },
    select: {
      padding: "12px 16px",
      borderRadius: "999px",
      border: "1px solid #d1d5db",
      background: "#fff",
    },
    post: {
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: "12px",
      marginBottom: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      overflow: "hidden",
    },
    postBody: {
      padding: "18px",
    },
    metaTop: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#6b7280",
      marginBottom: "10px",
    },
    avatar: {
      width: "34px",
      height: "34px",
      borderRadius: "50%",
      background: "#2563eb",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      fontSize: "14px",
    },
    titleText: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#1a1a1b",
      marginBottom: "10px",
    },
    description: {
      color: "#374151",
      lineHeight: "1.6",
      fontSize: "15px",
      marginBottom: "14px",
    },
    bottomBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "10px",
    },
    category: {
      padding: "5px 12px",
      borderRadius: "999px",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "capitalize",
    },
    commentBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      color: "#6b7280",
      fontSize: "14px",
      fontWeight: "600",
    },
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "24px",
      alignItems: "center",
    },
    pageBtn: {
      padding: "10px 14px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      background: "#fff",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>Campus Community Board</div>
          <div style={styles.subtitle}>
            Discuss campus issues publicly like a community forum
          </div>
        </div>

        <div style={styles.controls}>
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="repaired">Repaired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {paginatedTickets.map((ticket) => (
          <div
            key={ticket.id}
            style={styles.post}
            onClick={() => navigate(`/my-reports/${ticket.id}`)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#2563eb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#ccc")
            }
          >
            <div style={styles.postBody}>
              <div style={styles.metaTop}>
                <div style={styles.avatar}>
                  {getAvatar(ticket.reporterName)}
                </div>
                <span>Posted by {ticket.reporterName}</span>
                <span>•</span>
                <Clock3 size={14} />
                <span>{ticket.createdAt?.substring(0, 10)}</span>
              </div>

              <div style={styles.titleText}>{ticket.title}</div>

              <div style={styles.description}>
                {ticket.description?.slice(0, 180)}...
              </div>

              <div style={styles.bottomBar}>
                <span
                  style={{
                    ...styles.category,
                    background: getCategoryColor(ticket.category),
                  }}
                >
                  {ticket.category || "General"}
                </span>

                <div style={styles.commentBtn}>
                  <MessageSquare size={16} />
                  Join Discussion
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            style={styles.pageBtn}
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}