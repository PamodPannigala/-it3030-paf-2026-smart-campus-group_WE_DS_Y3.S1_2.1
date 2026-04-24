import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Shared Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

// Auth + Layout
import ProtectedRoute from "./components/ProtectedRoute";
import EndUserOnlyRoute from "./components/EndUserOnlyRoute";
import StaffShell from "./components/StaffShell";
import GateStaffLayout from "./components/GateStaffLayout";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";

// General Pages
import HomePage from "./pages/HomePage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import SupportPage from "./pages/SupportPage";

// Admin Pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import UserManagementPage from "./pages/UserManagementPage";

// ===== YOUR MODULES =====

// Dashboard & Resources
import Dashboard from "./pages/Dashboard";
import ResourceList from "./pages/ResourceList";
import PublicResourceView from "./components/PublicResourceView";
import ResourceCataloguePage from "./pages/ResourceCataloguePage";
import ResourceDetailPage from "./pages/ResourceDetailPage";

// Booking
import BookingForm from "./pages/BookingForm";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import AdminBookings from "./pages/AdminBookings";
import QRScanner from "./pages/QRScanner";

// Ticketing System
import SupportHomePage from "./pages/tickets/SupportHomePage";
import CreateTicket from "./pages/tickets/CreateTicket";
import MyReports from "./pages/tickets/MyReports";
import PublicTickets from "./pages/tickets/PublicTickets";
import TicketDetails from "./pages/tickets/TicketDetails";
import TicketSuccessPage from "./pages/tickets/TicketSuccessPage";
import AdminPage from "./pages/tickets/AdminPage";
import TechnicianManagementPage from "./pages/tickets/TechnicianManagementPage";
import TechnicianPortalPage from "./pages/tickets/TechnicianPortalPage";

function AppContent() {
  const { user, loading, isStaff } = useAuth();
  const { pathname } = useLocation();

  // Detect staff/admin console
  const staffConsole =
    !loading &&
    user &&
    isStaff &&
    (pathname.startsWith("/admin") ||
      pathname === "/users" ||
      pathname === "/notifications" ||
      pathname === "/settings");

  // Hide sidebar on public catalogue
  const hideSidebar =
    pathname === "/catalogue" ||
    pathname === "/" ||
    pathname === "/home" ||
    pathname.startsWith("/resource/view") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/ticket") ||
    pathname === "/notifications" ||
    pathname === "/settings" ||
    pathname === "/booking/:id" ||
    pathname === "/preferences" ||
    pathname === "/admin/inventory" ||
    pathname.startsWith("/resourseDetail") ||
    pathname === "/support-home" ||
    pathname === "/create-ticket" ||
    pathname === "/my-reports" ||
    pathname === "/community-tickets" ||
    pathname === "/my-bookings" ||
    pathname === "/preferences";

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* NAVBAR */}
      {!staffConsole && <Navbar />}

      <div className="d-flex flex-grow-1">
        {/* SIDEBAR (only for normal users) */}
        {!staffConsole && !hideSidebar && <Sidebar />}

        {/* MAIN CONTENT */}
        <div className={staffConsole ? "flex-grow-1" : "flex-grow-1 container-fluid p-4"}>
          <Routes>
            {/* ===== AUTH ===== */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />

            {/* ===== HOME ===== */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* ===== DASHBOARD (YOUR) ===== */}
            <Route
              path="/admin/facilities"
              element={
                <ProtectedRoute staffOnly>
                  <StaffShell>
                    <Dashboard />
                  </StaffShell>
                </ProtectedRoute>
              }
            />

            {/* ===== ADMIN ===== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute staffOnly>
                  <StaffShell>
                    <AdminDashboardPage />
                  </StaffShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/support"
              element={
                <ProtectedRoute adminOnly>
                  <StaffShell>
                    <AdminSupportPage />
                  </StaffShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <StaffShell>
                    <UserManagementPage />
                  </StaffShell>
                </ProtectedRoute>
              }
            />

            {/* ===== SETTINGS ===== */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <GateStaffLayout>
                    <ProfileSettingsPage />
                  </GateStaffLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <GateStaffLayout>
                    <NotificationsPage />
                  </GateStaffLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/preferences"
              element={
                <ProtectedRoute>
                  <GateStaffLayout>
                    <NotificationPreferencesPage />
                  </GateStaffLayout>
                </ProtectedRoute>
              }
            />

            {/* ===== SUPPORT (END USER) ===== */}
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <EndUserOnlyRoute>
                    <SupportPage />
                  </EndUserOnlyRoute>
                </ProtectedRoute>
              }
            />

            {/* ===== RESOURCE SYSTEM ===== */}
            <Route
              path="/admin/inventory"
              element={
                <GateStaffLayout>
                  <ResourceList />
                </GateStaffLayout>
              }
            />
            <Route path="/catalogue" element={<ResourceCataloguePage />} />
            <Route path="/resource/view/:id" element={<PublicResourceView />} />
            <Route
              path="/resourseDetail/:id"
              element={<ResourceDetailPage />}
            />

            {/* ===== BOOKING ===== */}
            <Route path="/booking/:id" element={<BookingForm />} />
            <Route path="/booking-success/:id" element={<BookingSuccess />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly>
                  <StaffShell>
                    <AdminBookings />
                  </StaffShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/checkin"
              element={
                <ProtectedRoute staffOnly>
                  <StaffShell>
                    <QRScanner />
                  </StaffShell>
                </ProtectedRoute>
              }
            />

            {/* ===== TICKETING ===== */}
            <Route path="/support-home" element={<SupportHomePage />} />
            <Route path="/create-ticket" element={<CreateTicket />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/community-tickets" element={<PublicTickets />} />
            <Route path="/ticket/:ticketId" element={<TicketDetails />} />
            <Route path="/my-reports/:ticketId" element={<TicketDetails />} />
            <Route path="/ticket-success" element={<TicketSuccessPage />} />

            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute staffOnly>
                  <StaffShell>
                    <AdminPage />
                  </StaffShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technicians"
              element={
                <ProtectedRoute adminOnly>
                  <StaffShell>
                    <TechnicianManagementPage />
                  </StaffShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/portal"
              element={<TechnicianPortalPage />}
            />

            {/* ===== FALLBACK ===== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* FOOTER */}
      {!staffConsole && <Footer />}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
