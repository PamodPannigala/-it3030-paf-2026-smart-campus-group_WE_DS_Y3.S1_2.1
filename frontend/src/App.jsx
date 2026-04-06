import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Member4Panel from "./pages/Member4Panel";
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
            <Route path="/" element={<Member4Panel />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
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
