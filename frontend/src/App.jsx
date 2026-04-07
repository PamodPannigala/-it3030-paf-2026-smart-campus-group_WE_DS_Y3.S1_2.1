import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
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

function App() {
  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />

      <div id="page-content-wrapper" className="w-100">
        <Navbar />
        <div className="container-fluid p-4">
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
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
