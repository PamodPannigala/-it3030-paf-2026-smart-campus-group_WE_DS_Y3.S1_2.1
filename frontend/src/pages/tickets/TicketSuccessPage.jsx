import { useLocation, useNavigate } from "react-router-dom";

export default function TicketSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.ticketId) {
    navigate("/support-home");
    return null;
  }

  // Format ticket ID with leading zeros (like #991222)
  const formattedTicketId = String(state.ticketId).padStart(6, "0");

  return (
    <div className="page-shell">
      {/* Embedded CSS */}
      <style>{`
        .success-card {
          max-width: 600px;
          margin: 100px auto;
          padding: 30px;
          border-radius: 12px;
          background-color: #e6ffed;
          border: 1px solid #b3f0c4;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        .success-card h2 {
          color: #2e7d32;
          margin-bottom: 20px;
        }
        .success-card p {
          margin-bottom: 20px;
          font-size: 16px;
          color: #333;
          line-height: 1.5;
        }
        .success-card .btn {
          padding: 10px 25px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 6px;
          background-color: #2e7d32;
          color: white;
          transition: background-color 0.3s ease;
        }
        .success-card .btn:hover {
          background-color: #27642a;
        }
      `}</style>

      <div className="success-card">
        <h2>Ticket Created #{formattedTicketId}</h2>
        <p>
          Your ticket has been successfully created. An email has been sent to your address with the ticket information.
        </p>
        <p>
          If you would like to view this ticket now you can do so.
        </p>
        <button
          className="btn"
          onClick={() => navigate("/support-home")}
        >
          OK
        </button>
      </div>
    </div>
  );
}