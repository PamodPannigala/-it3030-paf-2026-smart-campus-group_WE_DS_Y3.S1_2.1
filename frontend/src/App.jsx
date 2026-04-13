import { Route, Routes } from "react-router-dom";
import SupportHomePage from "./pages/tickets/SupportHomePage";
import CreateTicket from "./pages/tickets/CreateTicket";
import MyReports from "./pages/tickets/MyReports";
import PublicTickets from "./pages/tickets/PublicTickets";
import TicketDetails from "./pages/tickets/TicketDetails";
import TicketSuccessPage from "./pages/tickets/TicketSuccessPage";
import AdminPage from "./pages/tickets/AdminPage";
import TechnicianManagementPage from "./pages/tickets/TechnicianManagementPage";
import TechnicianPortalPage from "./pages/tickets/TechnicianPortalPage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Home Works</h1>} />
      <Route path="/support" element={<SupportHomePage />} />
     <Route path="/ticket/:ticketId" element={<TicketDetails />} />
      <Route path="/create-ticket" element={<CreateTicket />} />
      <Route path="/my-reports" element={<MyReports />} />
      <Route path="/community-tickets" element={<PublicTickets />} />
      <Route path="/my-reports/:ticketId" element={<TicketDetails />} />
      <Route path="/ticket-success" element={<TicketSuccessPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/technicians" element={<TechnicianManagementPage />} />
      <Route path="/technician/portal" element={<TechnicianPortalPage />} />

</Routes>
  );
}

export default App;