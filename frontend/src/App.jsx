import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ResourceList from "./pages/ResourceList";
import PublicResourceView from "./components/PublicResourceView";
import ResourceCataloguePage from "./pages/ResourceCataloguePage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import BookingForm from "./pages/BookingForm";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import QRScanner from "./pages/QRScanner";
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
  const location = useLocation();
  console.log(location.pathname);
  return (
    <div className="d-flex" id="wrapper">
      {location.pathname !== "/catalogue" && <Sidebar />}

      <div id="page-content-wrapper" className="w-100">
        <Navbar />
        <div className="container-fluid p-4">
          <Routes>
            {/* <Route path="/" element={<h1>Home</h1>} /> */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<ResourceList />} />
            <Route path="/support" element={<SupportHomePage />} />
            <Route path="/ticket/:ticketId" element={<TicketDetails />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/community-tickets" element={<PublicTickets />} />
            <Route path="/my-reports/:ticketId" element={<TicketDetails />} />
            <Route path="/ticket-success" element={<TicketSuccessPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/admin/technicians"
              element={<TechnicianManagementPage />}
            />
            <Route
              path="/technician/portal"
              element={<TechnicianPortalPage />}
            />
            {/* <Route path="/" element={<Dashboard />} /> */}
            {/* <Route path="/inventory" element={<ResourceList />} /> */}

            {/* // App.js ඇතුළේ Routes තියෙන තැනට මේක එකතු කරන්න */}
            <Route path="/resource/view/:id" element={<PublicResourceView />} />
            <Route path="/catalogue" element={<ResourceCataloguePage />} />
            <Route
              path="/resourseDetail/:id"
              element={<ResourceDetailPage />}
            />
            <Route path="/booking/:id" element={<BookingForm />} />
            <Route path="/booking-success/:id" element={<BookingSuccess />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/checkin" element={<QRScanner />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
