// src/pages/AdminBookings.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Eye, Calendar, Clock, User, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewModal, setViewModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/bookings/all");
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to approve this booking?")) {
      try {
        await axios.put(`http://localhost:8080/api/bookings/${bookingId}/approve`);
        fetchAllBookings();
        alert("Booking approved successfully!");
      } catch (err) {
        alert("Failed to approve booking");
      }
    }
  };

  const rejectBooking = async (bookingId) => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/bookings/${bookingId}/reject`, {
        reason: rejectionReason
      });
      fetchAllBookings();
      setSelectedBooking(null);
      setRejectionReason("");
      alert("Booking rejected");
    } catch (err) {
      alert("Failed to reject booking");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "APPROVED": return <span className="badge bg-success">Approved</span>;
      case "REJECTED": return <span className="badge bg-danger">Rejected</span>;
      case "CANCELLED": return <span className="badge bg-secondary">Cancelled</span>;
      default: return <span className="badge bg-warning">Pending</span>;
    }
  };

  // Apply status filter
  const statusFilteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  // Apply search filter (by resource name)
  const searchedBookings = searchTerm.trim() === ""
    ? statusFilteredBookings
    : statusFilteredBookings.filter(booking => 
        booking.resourceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = searchedBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchedBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Manage Bookings (Admin)</h2>
      
      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <Search size={18} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by resource name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-8">
          {/* Filter Buttons */}
          <div className="btn-group flex-wrap gap-2">
            <button className={`btn ${filter === "ALL" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setFilter("ALL")}>
              All ({bookings.length})
            </button>
            <button className={`btn ${filter === "PENDING" ? "btn-warning" : "btn-outline-warning"}`} onClick={() => setFilter("PENDING")}>
              Pending ({bookings.filter(b => b.status === "PENDING").length})
            </button>
            <button className={`btn ${filter === "APPROVED" ? "btn-success" : "btn-outline-success"}`} onClick={() => setFilter("APPROVED")}>
              Approved ({bookings.filter(b => b.status === "APPROVED").length})
            </button>
            <button className={`btn ${filter === "REJECTED" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => setFilter("REJECTED")}>
              Rejected ({bookings.filter(b => b.status === "REJECTED").length})
            </button>
            <button className={`btn ${filter === "CANCELLED" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setFilter("CANCELLED")}>
              Cancelled ({bookings.filter(b => b.status === "CANCELLED").length})
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {searchTerm && (
        <div className="mb-3">
          <small className="text-muted">
            Found {searchedBookings.length} booking(s) matching "{searchTerm}"
          </small>
        </div>
      )}

      {/* Table View */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Resource Image</th>
              <th>Resource Name</th>
              <th>User</th>
              <th>Date</th>
              <th>Time</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-5">
                  <div className="text-muted">
                    <Search size={40} className="mb-2 opacity-50" />
                    <p>No bookings found</p>
                    {searchTerm && <small>Try a different search term</small>}
                  </div>
                </td>
              </tr>
            ) : (
              currentBookings.map(booking => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td style={{ width: "80px" }}>
                    {booking.resourceImage ? (
                      <img 
                        src={booking.resourceImage} 
                        alt={booking.resourceName}
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/60x60?text=No+Image";
                        }}
                      />
                    ) : (
                      <div style={{ width: "60px", height: "60px", backgroundColor: "#e9ecef", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="text-muted small">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold">{booking.resourceName || `Resource #${booking.resourceId}`}</td>
                  <td>{booking.userEmail || `User ${booking.userId}`}</td>
                  <td>{booking.bookingDate}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td style={{ maxWidth: "200px" }}>
                    <div className="text-truncate" title={booking.purpose}>
                      {booking.purpose?.substring(0, 50)}{booking.purpose?.length > 50 ? "..." : ""}
                    </div>
                   </td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="d-flex gap-2">
                      {/* View Details Button - Always visible */}
                      <button 
                        className="btn btn-sm btn-info" 
                        onClick={() => setViewModal(booking)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {/* For PENDING status - Show both Approve and Reject */}
                      {booking.status === "PENDING" && (
                        <>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => approveBooking(booking.id)}
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => setSelectedBooking(booking)}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      
                      {/* For APPROVED status - Show Reject button only */}
                      {booking.status === "APPROVED" && (
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => setSelectedBooking(booking)}
                          title="Reject"
                        >
                          <XCircle size={16} /> 
                        </button>
                      )}
                      
                      {/* For REJECTED status - Show Approve button only */}
                      {booking.status === "REJECTED" && (
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => approveBooking(booking.id)}
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      {/* For CANCELLED status - No action buttons (only view) */}
                    </div>
                   </td>
                 </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                  <ChevronLeft size={16} /> Previous
                </button>
              </li>
              {[...Array(totalPages).keys()].map(number => (
                <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => paginate(number + 1)}>
                    {number + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* View Details Modal */}
      {viewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details #{viewModal.id}</h5>
                <button type="button" className="btn-close" onClick={() => setViewModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {viewModal.resourceImage && (
                    <div className="col-md-4">
                      <img 
                        src={viewModal.resourceImage} 
                        alt={viewModal.resourceName}
                        className="img-fluid rounded"
                        style={{ width: "100%", height: "150px", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div className={viewModal.resourceImage ? "col-md-8" : "col-md-12"}>
                    <h6>{viewModal.resourceName}</h6>
                    <p><strong>Resource ID:</strong> {viewModal.resourceId}</p>
                    <p><strong>User:</strong> {viewModal.userEmail || `User ${viewModal.userId}`}</p>
                    <p><strong>Date:</strong> {viewModal.bookingDate}</p>
                    <p><strong>Time:</strong> {viewModal.startTime} - {viewModal.endTime}</p>
                    <p><strong>Purpose:</strong> {viewModal.purpose}</p>
                    {viewModal.expectedAttendees > 0 && (
                      <p><strong>Expected Attendees:</strong> {viewModal.expectedAttendees}</p>
                    )}
                    {viewModal.specialRequests && (
                      <p><strong>Special Requests:</strong> {viewModal.specialRequests}</p>
                    )}
                    <p><strong>Status:</strong> {viewModal.status}</p>
                    {viewModal.rejectionReason && (
                      <p><strong>Rejection Reason:</strong> {viewModal.rejectionReason}</p>
                    )}
                    <p><strong>Created:</strong> {new Date(viewModal.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Booking #{selectedBooking.id}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <div className="modal-body">
                {selectedBooking.resourceImage && (
                  <img 
                    src={selectedBooking.resourceImage} 
                    alt={selectedBooking.resourceName}
                    className="img-fluid rounded mb-3"
                    style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  />
                )}
                <p><strong>Resource:</strong> {selectedBooking.resourceName}</p>
                <p><strong>User:</strong> {selectedBooking.userEmail || `User ${selectedBooking.userId}`}</p>
                <p><strong>Date:</strong> {selectedBooking.bookingDate}</p>
                <p><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                <p><strong>Purpose:</strong> {selectedBooking.purpose}</p>
                <div className="mb-3">
                  <label className="form-label">Reason for rejection:</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this booking..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => rejectBooking(selectedBooking.id)}>Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;