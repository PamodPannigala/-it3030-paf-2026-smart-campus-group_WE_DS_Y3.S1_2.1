import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

import FormInput_FU from "../components/FormInput/FormInput_FU";
import PrimaryButton_FU from "../components/PrimaryButton/PrimaryButton_FU";
import ResourceCard from "../components/ResourceCard/ResourceCard_FU";

import "../styles/ResourceCataloguePage.css";

const ResourceCataloguePage = () => {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true); // Loading එකක් දාමු Professional ලුක් එකට

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/resources");
        setResources(response.data);
      } catch (err) {
        console.error("Unable to fetch data from the Backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  // --- Search සහ Filter Logic එක ---
  const filteredResources = resources.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-light min-vh-100">
      {/* --- STEP 1: Hero Header --- */}
      <header
        className="hero-section text-white d-flex align-items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop")',
          height: "450px",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "0 0 60px 60px",
        }}
      >
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-3 mt-4 animate__animated animate__fadeInDown">
            University Asset Hub
          </h1>
          <p className="lead mb-5 opacity-75 animate__animated animate__fadeInUp">
            Access premium labs, equipment, and learning spaces instantly.
          </p>

          {/* --- STEP 2: The Glassmorphism Search Bar --- */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="bg-white p-2 rounded-pill shadow-lg d-flex align-items-center px-3">
                <div className="flex-grow-1">
                  <FormInput_FU
                    icon={Search}
                    placeholder="What are you looking for? (e.g. AR/VR Lab)"
                    onChange={(e) => setSearchTerm(e.value || e.target.value)} // Fix for custom input
                    className="border-0 shadow-none mb-0"
                  />
                </div>

                <div
                  className="vr mx-3 text-muted opacity-25"
                  style={{ height: "30px" }}
                ></div>

                <select
                  className="form-select border-0 bg-transparent fw-bold no-focus"
                  style={{ width: "160px", cursor: "pointer" }}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Assets</option>
                  <option value="FACILITY">Facilities</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>

                <PrimaryButton_FU className="rounded-pill px-4 ms-2">
                  Search Now
                </PrimaryButton_FU>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- STEP 3: Resource Grid Section --- */}
      <main className="container py-5 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
          <h3 className="fw-bold text-dark mb-0">Discover Resources</h3>
          <div className="badge bg-white text-primary border px-3 py-2 rounded-pill shadow-sm fw-bold">
            <LayoutGrid size={16} className="me-2" />
            {filteredResources.length} Items Available
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Fetching resources...</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-5">
            {filteredResources.map((item) => (
              <ResourceCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/resourseDetail/${item.id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-5">
            <h4 className="text-muted">
              No resources found matching your search.
            </h4>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResourceCataloguePage;
