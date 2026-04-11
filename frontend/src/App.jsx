import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import StaffShell from "./components/StaffShell";
import GateStaffLayout from "./components/GateStaffLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Footer from "./components/Footer";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import NotificationsPage from "./pages/NotificationsPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import UserManagementPage from "./pages/UserManagementPage";
import SupportPage from "./pages/SupportPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import EndUserOnlyRoute from "./components/EndUserOnlyRoute";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, loading, isStaff } = useAuth();
  const { pathname } = useLocation();

  const staffConsole =
    !loading &&
    user &&
    isStaff &&
    (pathname === "/admin" ||
      pathname === "/users" ||
      pathname.startsWith("/admin/") ||
      pathname === "/notifications" ||
      pathname === "/settings");

  return (
    <div className="min-vh-100 app-root d-flex flex-column" style={{ background: staffConsole ? "var(--ch-ice)" : "var(--ch-ice)" }}>
      {!staffConsole && <Navbar />}
      <div className={staffConsole ? "flex-grow-1" : "container py-4 flex-grow-1"}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
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
                <EndUserOnlyRoute>
                  <NotificationPreferencesPage />
                </EndUserOnlyRoute>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!staffConsole && <Footer />}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
