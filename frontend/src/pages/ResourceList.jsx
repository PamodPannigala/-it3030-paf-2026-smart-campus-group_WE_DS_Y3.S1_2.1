import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { uploadImageToCloudinary } from "../utils/ImageUpload.js";
import AIInsightPanel from "../components/AIInsightPanel/AIInsightPanel.jsx";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);

  // --- Search and Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterLocation, setFilterLocation] = useState("ALL");
  const [filterCapacity, setFilterCapacity] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    type: "FACILITY",
    capacity: "",
    location: "",
    status: "ACTIVE",
    openTime: "08:00",
    closeTime: "17:00",
    availableWeekends: false,
    purchaseYear: "",
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://10.218.54.1:8082/api/resources");
      setResources(response.data);
    } catch (err) {
      setError("Unable to fetch data. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name,
      type: item.type,
      capacity: item.capacity,
      location: item.location,
      status: item.status,
      openTime: item.openTime,
      closeTime: item.closeTime,
      availableWeekends: item.availableWeekends,
      purchaseYear: item.purchaseYear || "",
      imageUrl: item.imageUrl || "",
    });
    setShowModal(true);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    fetchResources();
    const queryParams = new URLSearchParams(location.search);
    const editIdFromURL = queryParams.get("editId");

    if (editIdFromURL && resources.length > 0) {
      const itemToEdit = resources.find(
        (r) => r.id === parseInt(editIdFromURL),
      );
      if (itemToEdit) {
        handleEdit(itemToEdit);
      }
    }
  }, [location.search, resources.length]);

  // --- Filter Logic ---
  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    const matchesLocation =
      filterLocation === "ALL" || item.location === filterLocation;

    const cap = parseInt(item.capacity);
    let matchesCapacity = true;

    if (filterCapacity === "1-10") {
      matchesCapacity = cap >= 1 && cap <= 10;
    } else if (filterCapacity === "11-50") {
      matchesCapacity = cap >= 11 && cap <= 50;
    } else if (filterCapacity === "50+") {
      matchesCapacity = cap > 50;
    }

    return matchesSearch && matchesType && matchesLocation && matchesCapacity;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === "type") {
      if (value === "EQUIPMENT") {
        updatedData.capacity = "1";
      } else if (value === "FACILITY") {
        updatedData.purchaseYear = "";
      }
    }
    setFormData(updatedData);
  };

  const downloadQR = () => {
    const svg = document.querySelector(".qr-container svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Tag_${formData.name || currentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // --- Validation Logic (unchanged) ---
  useEffect(() => {
    let errors = {};
    const currentYear = new Date().getFullYear();

    if (formData.name) {
      const isNameDuplicate = resources.some((res) => {
        if (isEdit && res.id === currentId) return false;
        return res.name.toLowerCase() === formData.name.trim().toLowerCase();
      });

      if (isNameDuplicate) {
        errors.name =
          "This name already exists. Please choose a different name.";
      }
    }

    const capValue = parseInt(formData.capacity);
    if (formData.capacity !== "") {
      if (capValue < 1) {
        errors.capacity = "Capacity must be at least 1."; //negative values
      } else if (capValue > 500) {
        errors.capacity = "Maximum capacity cannot exceed 500."; //max is 500
      }
    }

    //purchase year validation only for equipment, not for facilities
    if (formData.type === "EQUIPMENT") {
      const yearVal = parseInt(formData.purchaseYear);
      if (!formData.purchaseYear) {
        errors.purchaseYear = "Purchase year is required for equipment.";
      } else if (yearVal < 2000) {
        errors.purchaseYear = "Year cannot be earlier than 2000.";
      } else if (yearVal > currentYear) {
        errors.purchaseYear = `Max year is ${currentYear}.`;
      }
    }

    if (formData.capacity !== "" && parseInt(formData.capacity) < 1) {
      errors.capacity = "Capacity must be at least 1.";
    }

    //open time and close time validation
    if (formData.openTime && formData.closeTime) {
      if (formData.closeTime <= formData.openTime) {
        errors.closeTime = "Close time must be later than open time.";
      }
    }

    if (
      formData.type === "FACILITY" &&
      formData.openTime &&
      formData.closeTime
    ) {
      const isOverlapping = resources.some((res) => {
        if (isEdit && res.id === currentId) return false;

        const sameContext =
          res.type === "FACILITY" &&
          res.location === formData.location &&
          res.availableWeekends === formData.availableWeekends;

        return (
          sameContext &&
          formData.openTime < res.closeTime &&
          formData.closeTime > res.openTime
        );
      });
      if (isOverlapping) {
        errors.closeTime =
          "This facility is already booked for this time slot!";
      }

      //location validation
      if (formData.type === "FACILITY" && formData.location) {
        const isLocationTaken = resources.some((res) => {
          if (isEdit && res.id === currentId) return false;
          return res.type === "FACILITY" && res.location === formData.location;
        });

        if (isLocationTaken) {
          errors.location =
            "This location is already assigned to another facility.";
        }
      }
    }

    //image validation
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        errors.image = "Image size must be less than 5MB.";
      } else {
        delete errors.image;
      }
    } else {
      delete errors.image;
    }

    setFormErrors(errors);
  }, [formData, selectedFile, resources, isEdit, currentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(formErrors).length > 0) {
      alert("Please fix the errors before saving.");
      return;
    }

    const isOverlapping = resources.some((res) => {
      if (isEdit && res.id === currentId) return false;

      if (formData.type === "FACILITY") {
        const sameContext =
          res.type === "FACILITY" &&
          res.location === formData.location &&
          res.availableWeekends === formData.availableWeekends;

        if (sameContext) {
          return (
            formData.openTime < res.closeTime &&
            formData.closeTime > res.openTime
          );
        }
      }
      return false;
    });

    if (isOverlapping) {
      alert("❌ This location is already booked for this time slot!");
      return;
    }

    let uploadedImageUrl = formData.imageUrl || "";

    if (selectedFile) {
      try {
        const url = await uploadImageToCloudinary(selectedFile);
        if (url) {
          uploadedImageUrl = url;
        } else {
          console.error("Failed to get image URL from Cloudinary");
          toast.error(
            "Image uploaded, but failed to get URL. Please try again.",
          );
          return;
        }
      } catch (error) {
        console.error("Error during image upload", error);
        toast.error("Failed to upload image.");
        return;
      }
    }

    const resourceData = {
      ...formData,
      imageUrl: uploadedImageUrl,
    };

    try {
      if (isEdit) {
        await axios.put(
          `http://10.218.54.1:8082/api/resources/${currentId}`,
          resourceData,
        );
        toast.success("Resource updated successfully!");
      } else {
        await axios.post("http://10.218.54.1:8082/api/resources", resourceData);
        toast.success("Resource added successfully!");
      }

      setShowModal(false);
      setIsEdit(false);
      setCurrentId(null);
      setFormData({
        name: "",
        type: "FACILITY",
        capacity: "",
        location: "",
        status: "ACTIVE",
        openTime: "08:00",
        closeTime: "17:00",
        availableWeekends: false,
        imageUrl: "",
        purchaseYear: "",
      });

      setSelectedFile(null);
      const fileInput = document.getElementById("resourceImage");
      if (fileInput) fileInput.value = "";

      fetchResources();
    } catch (err) {
      console.error("Error saving resource to backend", err);
      toast.error("Error saving resource! Please check backend.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await axios.delete(`http://10.218.54.1:8082/api/resources/${id}`);
        toast.success("Resource deleted successfully!");
        fetchResources();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete the resource. Please try again.");
      }
    }
  };

  if (loading)
    return (
      <div className="container-fluid mt-4 text-center">Loading Data...</div>
    );

  // --- Real-time Calculations for the 4 Cards ---
  const activeEquipmentsCount = resources.filter(
    (r) => r.type === "EQUIPMENT" && r.status === "ACTIVE",
  ).length;
  const activeFacilitiesCount = resources.filter(
    (r) => r.type === "FACILITY" && r.status === "ACTIVE",
  ).length;
  const oosEquipmentsCount = resources.filter(
    (r) => r.type === "EQUIPMENT" && r.status === "OUT_OF_SERVICE",
  ).length;
  const oosFacilitiesCount = resources.filter(
    (r) => r.type === "FACILITY" && r.status === "OUT_OF_SERVICE",
  ).length;

  return (
    <div
      className="container-fluid bg-light pt-4 pb-5"
      style={{ minHeight: "100vh" }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-5 px-3">
        <div>
          <h1
            className="fw-bold text-dark mb-1"
            style={{ letterSpacing: "-0.8px", fontSize: "2.25rem" }}
          >
            Resource Inventory ⚙️
          </h1>
          <p className="text-muted mb-0 fs-5">
            System Overview & Resource Management Portal
          </p>
        </div>
        <button
          className="btn btn-primary shadow d-flex align-items-center gap-2 fw-semibold rounded-3 px-4 py-2"
          onClick={() => {
            setIsEdit(false);
            setShowModal(true);
            setFormData({
              name: "",
              type: "FACILITY",
              capacity: "",
              location: "",
              status: "ACTIVE",
              openTime: "08:00",
              closeTime: "17:00",
              availableWeekends: false,
              purchaseYear: "",
            });
            setSelectedFile(null);
          }}
        >
          <i className="bi bi-plus-circle fs-5"></i>
          Add New Resource
        </button>
      </div>

      {/* Metric Cards */}
      <div className="row g-4 mb-5 px-3">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <i className="bi bi-tools text-primary fs-1"></i>
                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
                  Active
                </span>
              </div>
              <h2 className="fw-bold text-dark mt-3 mb-1">
                {activeEquipmentsCount}
              </h2>
              <p className="text-muted fw-medium">Active Equipments</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <i className="bi bi-building text-primary fs-1"></i>
                <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                  Active
                </span>
              </div>
              <h2 className="fw-bold text-dark mt-3 mb-1">
                {activeFacilitiesCount}
              </h2>
              <p className="text-muted fw-medium">Active Facilities</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <i className="bi bi-exclamation-triangle text-danger fs-1"></i>
                <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">
                  OutOfService
                </span>
              </div>
              <h2 className="fw-bold text-dark mt-3 mb-1">
                {oosEquipmentsCount}
              </h2>
              <p className="text-muted fw-medium">Out of Service Equipments</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start">
                <i className="bi bi-clock-history text-warning fs-1"></i>
                <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill">
                  OutOfService
                </span>
              </div>
              <h2 className="fw-bold text-dark mt-3 mb-1">
                {oosFacilitiesCount}
              </h2>
              <p className="text-muted fw-medium">Out of Service Facilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-5 mx-3 bg-info-subtle">
        <div className="card-body p-4">
          <div className="row g-4 align-items-end">
            <div className="col-md-4">
              <label className="form-label text-muted fw-semibold small mb-2">
                SEARCH RESOURCE
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 shadow-none"
                  placeholder="Search by ID, Name or Location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted fw-semibold small mb-2">
                TYPE
              </label>
              <select
                className="form-select shadow-none"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="FACILITY">Facility</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted fw-semibold small mb-2">
                LOCATION
              </label>
              <select
                className="form-select shadow-none"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                <option value="G1101">G1101</option>
                <option value="F1305">F1305</option>
                <option value="G1203">G1203</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted fw-semibold small mb-2">
                CAPACITY
              </label>
              <select
                className="form-select shadow-none"
                value={filterCapacity}
                onChange={(e) => setFilterCapacity(e.target.value)}
              >
                <option value="ALL">Any Capacity</option>
                <option value="1-10">1 - 10 Pax</option>
                <option value="11-50">11 - 50 Pax</option>
                <option value="50+">50+ Pax</option>
              </select>
            </div>

            <div className="col-md-2 text-md-end">
              <button
                className="btn btn-outline-secondary px-4 py-2"
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("ALL");
                  setFilterLocation("ALL");
                  setFilterCapacity("ALL");
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mx-3 mb-5">
        <div className="table-responsive">
          <table className="table table-hover align-middle bg-white mb-0">
            <thead className="table-info ">
              <tr>
                <th className="py-4 px-4 fw-semibold text-uppercase small">
                  Resource
                </th>
                <th className="py-4 fw-semibold text-uppercase small">Type</th>
                <th className="py-4 fw-semibold text-uppercase small">
                  Details
                </th>
                <th className="py-4 fw-semibold text-uppercase small">
                  Status
                </th>
                <th className="py-4 fw-semibold text-uppercase small">
                  Operating Hours
                </th>
                <th className="py-4 text-end px-4 fw-semibold text-uppercase small">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length > 0 ? (
                filteredResources.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            item.imageUrl ||
                            "https://via.placeholder.com/50x50/ddd/666?text=Resource"
                          }
                          alt="resource"
                          className="rounded-3 me-3 shadow-sm"
                          style={{
                            width: "52px",
                            height: "52px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div className="fw-semibold text-dark">
                            {item.name}
                          </div>
                          <small className="text-muted">ID: #{item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="badge bg-light border text-secondary px-3 py-2 rounded-pill fw-medium">
                        {item.type === "FACILITY"
                          ? "🏢 Facility"
                          : "🔧 Equipment"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div>
                        <i className="bi bi-geo-alt text-primary me-2"></i>
                        {item.location}
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-people me-2"></i>
                        {item.capacity} Pax
                      </div>
                    </td>
                    <td className="py-4">
                      {item.status === "ACTIVE" ||
                      item.status === "AVAILABLE" ? (
                        <span className="badge border border-success text-success bg-white px-4 py-2 rounded-pill">
                          <i className="bi bi-check-circle-fill me-1"></i>{" "}
                          ACTIVE
                        </span>
                      ) : (
                        <span className="badge border border-danger text-danger bg-white px-4 py-2 rounded-pill">
                          <i className="bi bi-x-circle-fill me-1"></i> OUT OF
                          SERVICE
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="fw-medium">
                        {item.openTime} – {item.closeTime}
                      </div>
                      <small className="text-muted">
                        {item.availableWeekends ? "Mon - Sun" : "Mon - Fri"}
                      </small>
                    </td>
                    <td className="text-end px-4 py-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                          }}
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                          }}
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-5 text-muted fw-medium"
                  >
                    No matching resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 py-4 px-4">
                <h4 className="modal-title fw-bold">
                  {isEdit ? "Update Resource Details" : "Add New Resource"}
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 bg-light">
                  <div className="row g-4">
                    {/* Your existing form fields - unchanged */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Resource Name
                      </label>
                      <input
                        type="text"
                        className={`form-control shadow-sm ${formErrors.name ? "is-invalid" : ""}`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.name && (
                        <div className="invalid-feedback">
                          {formErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Resource Type
                      </label>
                      <select
                        className="form-select shadow-sm"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="FACILITY">Facility</option>
                        <option value="EQUIPMENT">Equipment</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Capacity (Pax)
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${formErrors.capacity ? "is-invalid" : ""}`}
                        name="capacity"
                        value={formData.capacity}
                        min="1"
                        onChange={handleChange}
                        required
                      />
                      {formErrors.capacity && (
                        <div className="invalid-feedback">
                          {formErrors.capacity}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Location
                      </label>
                      <input
                        type="text"
                        className={`form-control shadow-sm ${formErrors.location ? "is-invalid" : ""}`}
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.location && (
                        <div className="invalid-feedback">
                          {formErrors.location}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Open Time
                      </label>
                      <input
                        type="time"
                        className={`form-control shadow-sm ${formErrors.closeTime ? "is-invalid" : ""}`}
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Close Time
                      </label>
                      <input
                        type="time"
                        className={`form-control shadow-sm ${formErrors.closeTime ? "is-invalid" : ""}`}
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleChange}
                        required
                      />
                      {formErrors.closeTime && (
                        <div className="invalid-feedback">
                          {formErrors.closeTime}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Availability
                      </label>
                      <select
                        className="form-select shadow-sm"
                        name="availableWeekends"
                        value={formData.availableWeekends}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availableWeekends: e.target.value === "true",
                          })
                        }
                      >
                        <option value="false">Weekdays Only (Mon - Fri)</option>
                        <option value="true">Full Week (Mon - Sun)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-secondary">
                        Status
                      </label>
                      <select
                        className="form-select shadow-sm"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="OUT_OF_SERVICE">Out of Service</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold text-secondary">
                        Purchase Year (Equipment Only)
                      </label>
                      <input
                        type="number"
                        className={`form-control shadow-sm ${formErrors.purchaseYear ? "is-invalid" : ""}`}
                        name="purchaseYear"
                        placeholder="e.g. 2023"
                        value={formData.purchaseYear}
                        onChange={handleChange}
                        disabled={formData.type === "FACILITY"}
                        min="2000"
                        max={new Date().getFullYear()}
                      />
                      {formErrors.purchaseYear && (
                        <div className="invalid-feedback">
                          {formErrors.purchaseYear}
                        </div>
                      )}
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold text-secondary">
                        Resource Image (Optional)
                      </label>
                      {formData.imageUrl && !selectedFile && (
                        <div className="mb-3">
                          <img
                            src={formData.imageUrl}
                            alt="Current"
                            className="rounded-3 shadow-sm border"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="small text-muted mt-1">
                            Current image
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        id="resourceImage"
                        className={`form-control shadow-sm ${formErrors.image ? "is-invalid" : ""}`}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setSelectedFile(file);
                        }}
                      />
                      {formErrors.image && (
                        <div className="invalid-feedback d-block">
                          {formErrors.image}
                        </div>
                      )}
                      <small className="text-muted">
                        JPG, PNG, WEBP (Max 5MB)
                      </small>
                    </div>

                    {isEdit && (
                      <div className="col-12 text-center border-top pt-4 mt-3">
                        <h6 className="fw-bold text-secondary mb-3">
                          Resource QR Tag
                        </h6>
                        <div className="qr-container bg-white p-4 d-inline-block rounded-4 shadow-sm border">
                          <QRCodeSVG
                            value={`http://10.218.54.1:5173/resource/view/${currentId}`}
                            size={160}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-primary px-4 rounded-pill"
                            onClick={downloadQR}
                          >
                            <i className="bi bi-download me-2"></i>Download PNG
                            Tag
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light px-4 py-4">
                  <button
                    type="button"
                    className="btn btn-light px-4 fw-semibold"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-5 fw-semibold shadow-sm"
                  >
                    {isEdit ? "Save Changes" : "Add to Catalogue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Insight Panel */}
      <div className="mx-3 mt-4">
        <AIInsightPanel resources={resources} />
      </div>
    </div>
  );
};

export default ResourceList;
