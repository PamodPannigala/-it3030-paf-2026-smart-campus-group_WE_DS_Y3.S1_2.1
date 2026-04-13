import { useEffect, useState } from "react";
import { getMyTickets, createTicket } from "../../services/ticketApi";

export default function TicketDashboard({ userEmail, userName }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "LOW",
    reporterName: userName || "",
    reporterEmail: userEmail || "",
    location: "",
    imageUrls: [],
  });

  // =========================
  // Load user's tickets
  // =========================
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyTickets(userEmail);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchTickets();
  }, [userEmail]);

  // =========================
  // Handle Form Input
  // =========================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For imageUrls, split by comma
    if (name === "imageUrls") {
      const urls = value.split(",").map((url) => url.trim()).filter((url) => url);
      setFormData((prev) => ({ ...prev, imageUrls: urls }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket(formData);
      alert("Ticket submitted successfully!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "LOW",
        reporterName: userName || "",
        reporterEmail: userEmail || "",
        location: "",
        imageUrls: [],
      });
      setShowForm(false);
      fetchTickets(); // refresh tickets
    } catch (err) {
      alert(err.response?.data?.message || "Error creating ticket");
      console.error(err);
    }
  };

  return (
    <div className="ticket-page container mt-4">
      <h2>User Ticket Dashboard</h2>

      {/* Create Ticket Button */}
      <button
        className="btn btn-success mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "+ Create Ticket"}
      </button>

      {/* Create Ticket Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded">
          <div className="mb-2">
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-2">
            <textarea
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-control"
              rows={3}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Reporter Name"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="email"
              placeholder="Reporter Email"
              name="reporterEmail"
              value={formData.reporterEmail}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-2">
            <select
              className="form-select"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Image URLs (comma separated)"
              name="imageUrls"
              value={formData.imageUrls.join(", ")}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit Ticket
          </button>
        </form>
      )}

      {/* User Tickets Table */}
      {loading ? (
        <p>Loading your tickets...</p>
      ) : tickets.length === 0 ? (
        <p>No tickets found. Create your first ticket!</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Location</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.priority}</td>
                <td>{t.location}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}