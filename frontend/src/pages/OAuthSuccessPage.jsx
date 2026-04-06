import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    refreshUser()
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/auth", { replace: true }));
  }, [navigate, refreshUser]);

  return <div className="alert alert-info">Finalizing sign in...</div>;
};

export default OAuthSuccessPage;
