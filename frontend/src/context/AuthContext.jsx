import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api, { API_ORIGIN, OAUTH_LOGIN_URL } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error?.response?.status === 401) {
        setUser(null);
        return null;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser().catch(() => {
      setUser(null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 30000); // 30s refresh
      return () => clearInterval(interval);
    }
  }, [user]);

  const loginWithGoogle = () => {
    window.location.href = OAUTH_LOGIN_URL;
  };

  const loginWithPassword = async ({ usernameOrEmail, password }) => {
    const response = await api.post("/auth/login", {
      usernameOrEmail: usernameOrEmail.trim(),
      password,
    });
    setUser(response.data);
    return response.data;
  };

  const signup = async ({ fullName, username, email, password }) => {
    await api.post("/auth/signup", {
      fullName,
      username: username.trim().toLowerCase(),
      email: email.trim(),
      password,
    });
  };

  const forgotPassword = async ({ email }) => {
    const res = await api.post("/auth/forgot-password", { email: email.trim() });
    return res.data.token;
  };

  const resetPassword = async ({ token, newPassword }) => {
    await api.post("/auth/reset-password", { token, newPassword });
  };

  const logout = async () => {
    await axios.post(`${API_ORIGIN}/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  const value = {
    user,
    unreadCount,
    loading,
    refreshUser,
    refreshUnreadCount,
    loginWithGoogle,
    loginWithPassword,
    signup,
    forgotPassword,
    resetPassword,
    logout,
    isAdmin: user?.role === "ADMIN",
    isStaff: user?.role === "ADMIN" || user?.role === "TECHNICIAN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
