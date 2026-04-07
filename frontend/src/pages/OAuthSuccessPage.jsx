import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    refreshUser()
      .then((u) => navigate(u?.role === "ADMIN" ? "/admin" : "/home", { replace: true }))
      .catch(() => navigate("/", { replace: true }));
  }, [navigate, refreshUser]);

  return <div className="alert alert-info">Finalizing sign in...</div>;
};

export default OAuthSuccessPage;
