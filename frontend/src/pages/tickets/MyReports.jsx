// src/pages/tickets/MyReports.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTickets } from "../../services/ticketApi";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

export default function MyReports() {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  const fetchMyTickets = async () => {
    try {
      const storedEmail = localStorage.getItem("userEmail");
      if (!storedEmail) return;
      const email = storedEmail.trim().toLowerCase();
      const res = await getMyTickets(email);
      setTickets(res.data || []);
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const handleRowClick = (ticketId) => {
    navigate(`/my-reports/${ticketId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || "new").toLowerCase();
    const colors = {
      new: { background: "#dbeafe", color: "#1d4ed8" },
      open: { background: "#fef3c7", color: "#d97706" },
      resolved: { background: "#dcfce7", color: "#15803d" },
      closed: { background: "#e5e7eb", color: "#4b5563" },
    };
    return colors[s] || colors.new;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const styles = {
    page: {
      padding: "30px",
      background: "#f8fafc",
      minHeight: "100vh",
      fontFamily: "Inter, sans-serif",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      flexWrap: "wrap",
      gap: "15px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1e293b",
    },
    subtitle: {
      color: "#64748b",
      marginTop: "4px",
    },
    createBtn: {
      background: "#30185a",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "12px 18px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(124,58,237,0.25)",
      transition: "all 0.2s ease",
    },
    statsBox: {
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "14px 18px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      minWidth: "160px",
    },
    statsLabel: {
      fontSize: "13px",
      color: "#64748b",
    },
    statsValue: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#0f172a",
    },
    filterRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    searchWrapper: {
      position: "relative",
      flex: 1,
      minWidth: "250px",
    },
    searchIcon: {
      position: "absolute",
      top: "50%",
      left: "14px",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      width: "18px",
      height: "18px",
    },
    input: {
      width: "100%",
      padding: "12px 14px 12px 42px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      fontSize: "14px",
      background: "#fff",
      outline: "none",
    },
    select: {
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "#fff",
      minWidth: "180px",
      fontSize: "14px",
    },
    tableCard: {
      background: "#fff",
      borderRadius: "18px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      overflow: "hidden",
      border: "1px solid #f1f5f9",
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      padding: "16px 20px",
      textAlign: "left",
      fontSize: "14px",
      fontWeight: "600",
      color: "#64748b",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      cursor: "pointer",
      userSelect: "none",
    },
    td: {
      padding: "16px 20px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "14px",
      color: "#334155",
    },
    row: {
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    badge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      textTransform: "capitalize",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 20px",
      flexWrap: "wrap",
      gap: "12px",
      background: "#fff",
    },
    pageControls: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    pageBtn: {
      border: "1px solid #e2e8f0",
      background: "#fff",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    emptyRow: {
      textAlign: "center",
      padding: "30px",
      color: "#94a3b8",
      fontSize: "15px",
    },
  };

  const sortableHeader = (label, field) => (
    <th style={styles.th} onClick={() => handleSort(field)}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {label}
        <ArrowUpDown size={14} />
      </div>
    </th>
  );

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.title}>My Submitted Tickets</div>
          <div style={styles.subtitle}>
            Track status, progress, and updates of your support requests
          </div>
        </div>

        <button
          style={styles.createBtn}
          onClick={() => navigate("/create-ticket")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          + Create Ticket
        </button>

        <div style={styles.statsBox}>
          <div style={styles.statsLabel}>Total Tickets</div>
          <div style={styles.statsValue}>{filteredAndSortedTickets.length}</div>
        </div>
      </div>

      <div style={styles.filterRow}>
        <div style={styles.searchWrapper}>
          <Search style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Tickets</option>
          <option value="new">New</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div style={styles.tableCard}>
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
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.emptyRow}>
                    No tickets found
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    style={styles.row}
                    onClick={() => handleRowClick(ticket.id)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <td style={styles.td}>#{ticket.id}</td>
                    <td style={styles.td}>{ticket.subject || ticket.title}</td>
                    <td style={styles.td}>{ticket.category || "-"}</td>
                    <td style={styles.td}>{ticket.priority || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...getStatusStyle(ticket.status),
                        }}
                      >
                        {ticket.status || "New"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {ticket.createdAt
                        ? ticket.createdAt.substring(0, 10)
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.footer}>
          <div>
            Showing {paginatedTickets.length} of {filteredAndSortedTickets.length} tickets
          </div>

          <div style={styles.pageControls}>
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
    </div>
  );
}
