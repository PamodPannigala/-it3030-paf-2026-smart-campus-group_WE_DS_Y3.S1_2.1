import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h2 className="mb-2">Home</h2>
        <p className="text-muted mb-3">Welcome, {user?.fullName}.</p>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/settings" className="btn btn-outline-primary">
            Settings (Profile)
          </Link>
          <Link to="/notifications" className="btn btn-outline-primary">
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

