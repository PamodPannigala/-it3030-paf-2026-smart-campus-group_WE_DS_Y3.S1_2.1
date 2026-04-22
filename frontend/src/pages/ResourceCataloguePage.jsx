import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Search, LayoutGrid, CalendarCheck } from "lucide-react"; // ADD CalendarCheck here
import { useNavigate } from "react-router-dom";

import "../styles/ResourceCataloguePage.css";

const ResourceCataloguePage = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState("All Assets");
  const [statusFilter, setStatusFilter] = useState("Any Status");
  const [locationFilter, setLocationFilter] = useState("All Buildings");
  const [sortBy, setSortBy] = useState("popularity");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Define the Backend Base URL to handle relative image paths
  const BACKEND_BASE_URL = "http://localhost:8082";

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get(`${BACKEND_BASE_URL}/api/resources`);
        setResources(response.data);
      } catch (err) {
        console.error("Unable to fetch data from the Backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const uniqueTypes = useMemo(() => {
    const types = new Set(resources.map((item) => item.type).filter(Boolean));
    return ["All Assets", ...Array.from(types)];
  }, [resources]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set(
      resources.map((item) => item.location).filter(Boolean),
    );
    return ["All Buildings", ...Array.from(locs)];
  }, [resources]);

  const uniqueStatuses = useMemo(() => {
    const stats = new Set(resources.map((item) => item.status).filter(Boolean));
    return ["Any Status", ...Array.from(stats)];
  }, [resources]);

  const filteredAndSortedResources = useMemo(() => {
    let filtered = resources.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (item.name || "").toLowerCase().includes(searchLower) ||
        (item.location || "").toLowerCase().includes(searchLower) ||
        (item.id || "").toString().includes(searchLower);

      const matchesCategory =
        activeCategory === "All Assets" || item.type === activeCategory;
      const matchesStatus =
        statusFilter === "Any Status" || item.status === statusFilter;
      const matchesLocation =
        locationFilter === "All Buildings" || item.location === locationFilter;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesLocation
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });
  }, [
    resources,
    searchTerm,
    activeCategory,
    statusFilter,
    locationFilter,
    sortBy,
  ]);

  const getStatusBadgeClass = (status) => {
    if (!status) return "bg-success";
    const upper = status.toUpperCase();
    if (upper === "OUT OF SERVICE" || upper === "OUT_OF_SERVICE")
      return "bg-danger";
    if (upper.includes("MAINTENANCE")) return "bg-warning text-dark";
    if (upper === "NEW ARRIVAL") return "bg-primary";
    return "bg-success";
  };

  const fallbackImages = [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2340",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301",
  ];

  return (
    <div
      className="bg-light min-vh-100"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="bg-navy text-white text-center hero-section position-relative">
        <div className="container position-relative z-1">
          <h1
            className="display-5 fw-bold mb-3 lh-1"
            style={{ fontSize: "3.2rem" }}
          >
            Elevating Academic{" "}
            <span className="text-blue">Resource Discovery</span>
          </h1>
          <p
            className="text-white-50 mb-5"
            style={{
              fontSize: "17px",
              maxWidth: "620px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Discover • Reserve • Manage university assets in real time
          </p>
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="input-group bg-white p-2 shadow-lg rounded-pill">
                <span className="input-group-text bg-transparent border-0 ps-4">
                  <i className="bi bi-search text-muted fs-4"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none py-4 ps-3 fs-5"
                  placeholder="Search by asset name, location or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-navy px-5 fw-semibold py-2 fs-5">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container pb-5">
        <div className="glass-card p-2 shadow-sm filter-card mb-5">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <div className="d-flex flex-wrap gap-2">
              {uniqueTypes.map((cat) => (
                <button
                  key={cat}
                  className={`nav-pill-custom ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              className="btn btn-link text-muted text-decoration-none small fw-semibold d-flex align-items-center"
              onClick={() => {
                setActiveCategory("All Assets");
                setSearchTerm("");
                setStatusFilter("Any Status");
                setLocationFilter("All Buildings");
                setSortBy("popularity");
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> CLEAR ALL
            </button>
          </div>

          <div className="row g-3 border-top pt-3">
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-2 d-block">
                STATUS
              </label>
              <select
                className="form-select bg-light border-0 py-2 rounded-3 fw-medium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-2 d-block">
                LOCATION
              </label>
              <select
                className="form-select bg-light border-0 py-2 rounded-3 fw-medium"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                {uniqueLocations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end justify-content-md-end">
              <div className="d-flex align-items-center">
                <span className="small text-muted fw-semibold me-2">
                  SORT BY
                </span>
                <select
                  className="form-select bg-light border-0 py-2 rounded-3 fw-medium"
                  style={{ width: "auto", minWidth: "160px" }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="name">Name A-Z</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="fw-bold text-navy mb-1 fs-4">Discover Resources</h2>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            {filteredAndSortedResources.length} items • Live across campus
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            ></div>
            <p className="mt-3 text-muted fw-medium">
              Fetching live university assets...
            </p>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            {filteredAndSortedResources.map((asset) => {
              /* FIX: Logic to ensure images from backend are displayed properly.
                 1. We extract the raw image data from possible field names (img, image, imageUrl).
                 2. If it's a relative path (e.g., /uploads/...), we prepend the BACKEND_BASE_URL.
                 3. If no image exists, we use the fallback logic.
              */
              const rawImageData = asset.img || asset.imageUrl || asset.image;

              const imgSrc = rawImageData
                ? rawImageData.startsWith("http")
                  ? rawImageData
                  : `${BACKEND_BASE_URL}${rawImageData.startsWith("/") ? "" : "/"}${rawImageData}`
                : fallbackImages[asset.id % fallbackImages.length || 0];

              const badgeClass = getStatusBadgeClass(asset.status);
              const isOutOfService = (asset.status || "")
                .toUpperCase()
                .includes("OUT");

              return (
                <div key={asset.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className={`card asset-card h-100 ${isOutOfService ? "opacity-90" : ""}`}
                  >
                    <div className="position-relative">
                      <img
                        src={imgSrc}
                        className="card-img-top w-100"
                        alt={asset.name}
                        style={{ height: "200px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600";
                        }}
                      />
                      <span className={`status-badge text-white ${badgeClass}`}>
                        {asset.status || "ACTIVE"}
                      </span>
                      <button
                        className="heart-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="bi bi-heart fs-6"></i>
                      </button>
                    </div>

                    <div className="card-body p-4">
                      <div className="mb-3">
                        <span
                          className="type-badge badge px-3 py-1 fw-semibold"
                          style={{ fontSize: "9.5px" }}
                        >
                          {asset.type || "ASSET"}
                        </span>
                      </div>

                      <h5 className="card-title fw-semibold mb-3 fs-6">
                        {asset.name}
                      </h5>

                      <div className="mb-4" style={{ fontSize: "13.5px" }}>
                        <div className="d-flex align-items-center text-muted mb-2">
                          <i className="bi bi-geo-alt-fill text-blue me-2"></i>
                          <span className="fw-medium">
                            {asset.location || "Main Campus"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center text-muted mb-3">
                          <i className="bi bi-calendar-check text-blue me-2"></i>
                          <span>
                            Availability:{" "}
                            <strong>
                              {asset.availableWeekends
                                ? "Mon - Sun"
                                : "Mon - Fri"}
                            </strong>
                          </span>
                        </div>
                        <div className="row g-3">
                          <div className="col-6 d-flex align-items-center text-muted">
                            <i className="bi bi-people-fill text-blue me-2"></i>
                            <span>
                              Capacity:{" "}
                              <strong>{asset.capacity || "N/A"}</strong>
                            </span>
                          </div>
                          <div className="col-6 d-flex align-items-center text-muted">
                            <i className="bi bi-clock text-blue me-2"></i>
                            <span>
                              Hours:{" "}
                              <strong>
                                {asset.openTime?.substring(0, 5)} -{" "}
                                {asset.closeTime?.substring(0, 5)}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="explore-btn btn btn-primary w-100 fw-semibold py-3 rounded-3"
                        onClick={() => navigate(`/resourseDetail/${asset.id}`)}
                      >
                        Explore Resource{" "}
                        <i className="bi bi-arrow-right-short ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredAndSortedResources.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h5 className="text-muted fw-light">
              No resources match your filters
            </h5>
            <p className="text-muted small">Try clearing some filters above</p>
          </div>
        )}
      </main>
      //footer can be added here if needed in the future
    </div>
  );
};

export default ResourceCataloguePage;
