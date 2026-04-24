import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react"; // AlertCircle for error state, ArrowLeft for back button
import axios from "axios";

// Components
import ImageGallery_FU from "../components/ImageGallery/ImageGallery_FU";
import InfoSection_FU from "../components/InfoSection/InfoSection_FU";
import BookingCard_FU from "../components/BookingCard/BookingCard_FU";
import "../styles/ResourceDetailPage.css";

const DetailedResourceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // if error occurs during fetch, store message here

  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        // --- REAL BACKEND FETCH ---
        const response = await axios.get(
          `http://localhost:8082/api/resources/${id}`,
        );
        const data = response.data;

        // If backend doesn't provide images, use placeholders. Otherwise, use the provided image URL(s).
        const formattedData = {
          ...data,
          images: data.imageUrl
            ? [
                data.imageUrl,
                "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=2070&auto=format&fit=crop",
              ]
            : [
                "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=2078&auto=format&fit=crop",
              ],
        };

        setResource(formattedData);
      } catch (err) {
        console.error("Backend Error:", err);
        setError(
          "Unable to connect to the server. Please check if the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResourceDetails();
  }, [id]);

  //Loading spinner while fetching data
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div
          className="spinner-border text-primary"
          style={{ width: "3rem", height: "3rem" }}
          role="status"
        ></div>
      </div>
    );

  //If error occurs from backend, show error message with a back button
  if (error)
    return (
      <div className="container py-5 text-center mt-5">
        <AlertCircle size={60} className="text-danger mb-3 opacity-75" />
        <h3 className="fw-bold text-dark">Oops! Something went wrong.</h3>
        <p className="text-muted">{error}</p>
        <button
          onClick={() => navigate("/catalogue")}
          className="btn btn-outline-dark mt-3 px-4 rounded-pill"
        >
          <ArrowLeft size={18} className="me-2" /> Go Back
        </button>
      </div>
    );

  return (
    <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
      {/* --- Back Button --- */}
      <button
        onClick={() => navigate("/catalogue")}
        className="btn btn-link text-decoration-none text-dark fw-bold d-flex align-items-center mb-4 p-0 transition-all hover-primary"
      >
        <ArrowLeft size={20} className="me-2" /> Back to Catalogue
      </button>

      {/* --- Page Header --- */}
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-dark mb-2">{resource.name}</h1>
        <div className="d-flex align-items-center gap-3">
          <span
            className={`badge ${resource.status === "AVAILABLE" ? "bg-success" : "bg-danger"} px-3 py-2 rounded-pill badge-premium`}
          >
            {resource.status}
          </span>
          <span className="text-muted fw-bold tracking-wider">
            {resource.type}
          </span>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="row g-5">
        <div className="col-lg-8">
          <ImageGallery_FU images={resource.images} />
          <InfoSection_FU resource={resource} />
        </div>

        <div className="col-lg-4">
          <BookingCard_FU resource={resource} />
        </div>
      </div>
    </div>
  );
};

export default DetailedResourceView;
