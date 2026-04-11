import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import NotificationsPage from "./pages/NotificationsPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import UserManagementPage from "./pages/UserManagementPage";
import SupportPage from "./pages/SupportPage";
import AdminSupportPage from "./pages/AdminSupportPage";

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
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
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <ProtectedRoute adminOnly>
                <AdminSupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <NotificationPreferencesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
