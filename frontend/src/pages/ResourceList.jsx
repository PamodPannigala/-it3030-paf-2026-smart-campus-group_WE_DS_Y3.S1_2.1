import React, { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useLocation } from "react-router-dom";
import { uploadImageToCloudinary } from "../utils/ImageUpload.js";
import AIInsightPanel from "../components/AIInsightPanel/AIInsightPanel.jsx";

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation(); // URL එකේ විස්තර කියවන්න මේක ඕනේ
  const [selectedFile, setSelectedFile] = useState(null); //Image upload state

  // --- Search සහ Filter සඳහා States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // Add ද Update ද කියලා බලන්න
  const [currentId, setCurrentId] = useState(null); // Edit කරන row එකේ ID එක තියාගන්න
  const [formData, setFormData] = useState({
    name: "",
    type: "FACILITY",
    capacity: "",
    location: "",
    status: "ACTIVE", // Default එක ACTIVE කළා
    openTime: "08:00", // Default විවෘත කරන වෙලාව
    closeTime: "17:00", // Default වහන වෙලාව
    availableWeekends: false,
  });

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/resources");
      setResources(response.data);
    } catch (err) {
      setError("Unable to fetch data. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  //Handle Edit Function
  const handleEdit = (item) => {
    setIsEdit(true); // දැන් අපි ඉන්නේ Edit mode එකේ
    setCurrentId(item.id); // අදාළ ID එක save කරගන්නවා
    setFormData({
      // පරණ දත්ත ටික form එකට දානවා
      name: item.name,
      type: item.type,
      capacity: item.capacity,
      location: item.location,
      status: item.status,
      openTime: item.openTime,
      closeTime: item.closeTime,
      availableWeekends: item.availableWeekends,
    });
    setShowModal(true); // Modal එක open කරනවා
  };

  useEffect(() => {
    fetchResources();
  }, []); // මුලින්ම data ටික ඇදලා ගන්නවා

  useEffect(() => {
    fetchResources(); // මුලින්ම දත්ත ටික ගේනවා

    // URL එකේ ?editId=... කියලා කෑල්ලක් තියෙනවද බලනවා
    const queryParams = new URLSearchParams(location.search);
    const editIdFromURL = queryParams.get("editId");

    // resources ලිස්ට් එක ලෝඩ් වෙලා තියෙනවා නම් සහ URL එකේ ID එකක් තියෙනවා නම්:
    if (editIdFromURL && resources.length > 0) {
      const itemToEdit = resources.find(
        (r) => r.id === parseInt(editIdFromURL),
      );
      if (itemToEdit) {
        handleEdit(itemToEdit); // මෙතනින් තමයි ඔයාගේ Edit Modal එක ඔටෝම ඇරෙන්නේ
      }
    }
  }, [location.search, resources.length]); // Dependency array එකට මේ දෙක දෙන්න

  // --- Filter Logic එක (Frontend එකේම සිද්ධ වෙනවා) ---
  const filteredResources = resources.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const downloadQR = () => {
    // 1. QR එක තියෙන SVG එක හොයාගන්නවා
    const svg = document.querySelector(".qr-container svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // SVG එක පින්තූරයක් බවට පත් කරන ලොජික් එක
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      // බ්‍රවුසරයෙන් ඔටෝමැටිකව ඩවුන්ලෝඩ් වෙන්න සලස්වනවා
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Tag_${formData.name || currentId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Form එක refresh වෙන්න කලින් අල්ලගන්න

    // 🔴 1. Cloudinary Upload (අලුත් කෑල්ල)
    let uploadedImageUrl = formData.imageUrl || ""; // පින්තූරේ ලින්ක් එක තියාගන්න

    // selectedFile state එකේ පින්තූරයක් තෝරලා තියෙනවා නම් විතරක් Cloudinary යවනවා
    // මචං, selectedFile state එක උඩින් හදාගන්න අමතක කරන්න එපා!
    if (selectedFile) {
      try {
        // මෙන්න අර utils එකේ function එක call කරනවා!
        const url = await uploadImageToCloudinary(selectedFile);
        if (url) {
          uploadedImageUrl = url; // URL එක සාර්ථකව ලැබුණොත් ඒක final variable එකට දානවා
        } else {
          console.error("Failed to get image URL from Cloudinary");
          alert("Resorse Image Uploaded Successfully...");
          return; // Error එකක් ආවොත් එතනින් නවත්වනවා
        }
      } catch (error) {
        console.error("Error during image upload", error);
        alert("පින්තූරය upload කිරීමේදී ගැටලුවක් මතු විය.");
        return; // Error එකක් ආවොත් එතනින් නවත්වනවා
      }
    }

    // 2. Data Object එක Backend එකට ගැලපෙන විදිහට හදනවා
    // ඔයාගේ formData එක ඇතුළට imageUrl එකත් එකතු කරනවා
    const resourceData = {
      ...formData, // ඔයාගේ දැනට තියෙන name, type, etc. ටික
      imageUrl: uploadedImageUrl, // මෙන්න අලුත් පින්තූර ලින්ක් එක යනවා!
    };

    try {
      if (isEdit) {
        // Update කරනවා නම් (PUT Request)
        // formData වෙනුවට resourceData යවනවා
        await axios.put(
          `http://localhost:8080/api/resources/${currentId}`,
          resourceData,
        );
        alert("Resource updated successfully!");
      } else {
        // අලුතින් දානවා නම් (POST Request)
        // formData වෙනුවට resourceData යවනවා
        await axios.post("http://localhost:8080/api/resources", resourceData);
        alert("Resource added successfully!");
      }

      // වැඩේ ඉවර වුණාම ඔක්කොම reset කරනවා (ඇතුළතimageUrl reset කරන්න ඕනේ නැහැ, formData reset වෙද්දී ඒකත් فاضි වෙයි)
      setShowModal(false);
      setIsEdit(false);
      setCurrentId(null);
      setFormData({
        name: "",
        type: "FACILITY",
        capacity: "",
        location: "",
        status: "ACTIVE",
        imageUrl: "", // Reset කරද්දී මේකත් කරන්න
      });

      // 3. selectedFile State එක reset කරන්න (ඊළඟ පාරට)
      setSelectedFile(null);

      // 4. Input එකේ පේන file එකේ නමත් reset කරන්න
      const fileInput = document.getElementById("resourceImage"); // Input id එක
      if (fileInput) fileInput.value = "";

      fetchResources(); // Table එක refresh කරනවා
    } catch (err) {
      console.error("Error saving resource to backend", err);
      alert("Error saving resource! Please check backend.");
    }
  };

  //delete
  const handleDelete = async (id) => {
    // මකන්න කලින් ඇත්තටම ඕනෙද කියලා අහනවා (Safety first!)
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await axios.delete(`http://localhost:8080/api/resources/${id}`);
        alert("Resource deleted successfully!");
        fetchResources(); // ටේබල් එකේ ලිස්ට් එක ආයෙත් ඇදලා ගන්න (Refresh)
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete the resource. Please try again.");
      }
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Inventory Catalogue</h1>

        <button
          className="btn btn-primary"
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
            });
          }}
        >
          + Add Resource
        </button>
      </div>

      {/* --- Search and Filter Bar --- */}
      <div className="row mb-4 p-3 bg-light rounded shadow-sm">
        <div className="col-md-6">
          <label className="form-label font-weight-bold">Search by Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Type resource name (e.g. Lab 01)..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label font-weight-bold">Filter by Type</label>
          <select
            className="form-select"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="FACILITY">Facility</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <table className="table table-hover table-bordered shadow-sm bg-white text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Location</th>
            <th>Status</th>
            <th style={{ width: "140px" }}>Availability</th>
            {/* Header එකේ කළු පාට එන්න මෙතන <th>Actions</th> එක අනිවාර්යයි */}
            <th style={{ width: "180px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.length > 0 ? (
            filteredResources.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <img
                    /* 'res' වෙනුවට 'item' (map එකේ තියෙන නම) පාවිච්චි කර නිවැරදි කරන ලදී */
                    src={item.imageUrl || "https://via.placeholder.com/50"}
                    alt="resource"
                    className="img-thumbnail"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.type}</td>
                <td>{item.capacity}</td>
                <td>{item.location}</td>
                <td>
                  <span
                    className={`badge ${
                      item.status === "ACTIVE" || item.status === "AVAILABLE"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="align-middle text-nowrap">
                  <div
                    className="fw-bold text-primary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {item.openTime} - {item.closeTime}
                  </div>
                  <span
                    className={`badge ${item.availableWeekends ? "bg-info" : "bg-secondary"}`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {item.availableWeekends ? "Mon - Sun" : "Mon - Fri"}
                  </span>
                </td>

                {/* බටන් මැදට කරලා, සයිස් එක සමාන කරපු කොටස */}
                <td>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-success btn-sm"
                      style={{ width: "80px" }} // Edit බටන් එක කොළ පාට සහ සයිස් එක 70px
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ width: "80px" }} // Delete බටන් එකේ සයිස් එකත් 70px
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            /* colSpan එක 9 කරන්න (Columns 9ක් තියෙන නිසා) */
            <tr>
              <td colSpan="9" className="text-center">
                No matching resources found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal - Add Resource (ACTIVE / OUT_OF_SERVICE options) */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {isEdit ? "Update Resource" : "Add New Resource"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="FACILITY">Facility</option>
                        <option value="EQUIPMENT">Equipment</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Time Selection Row */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Open Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Close Time</label>
                      <input
                        type="time"
                        className="form-control"
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Weekend Availability Toggle */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Availability Window
                    </label>
                    <select
                      className="form-select"
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

                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>

                  {/* --- Image Upload--- */}
                  <div className="mb-3 border-top pt-3">
                    <label
                      htmlFor="resourceImage"
                      className="form-label fw-bold"
                    >
                      Resource Image (Optional)
                    </label>
                    <div className="input-group">
                      <input
                        type="file"
                        id="resourceImage"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                          }
                        }}
                      />
                      <label
                        className="input-group-text"
                        htmlFor="resourceImage"
                      >
                        Upload
                      </label>
                    </div>
                    <div className="form-text mt-1 text-muted">
                      Accepted formats: JPG, PNG, WEBP (Max: 5MB)
                    </div>
                  </div>

                  {/* QR Code Section - පෙන්වන්නේ Edit කරද්දී විතරයි */}
                  {isEdit && (
                    <div className="mt-4 pt-3 border-top text-center">
                      <h6 className="fw-bold text-secondary mb-3">
                        Resource QR Tag
                      </h6>

                      {/* මෙතන අනිවාර්යයෙන්ම qr-container කියන class එක තියෙන්න ඕනේ */}
                      <div className="qr-container bg-light p-3 d-inline-block rounded shadow-sm border">
                        <QRCodeSVG
                          value={`http://10.187.244.1:5173/resource/view/${currentId}`}
                          size={160}
                          level={"H"}
                          includeMargin={true}
                        />
                      </div>

                      <div className="mt-2 text-center">
                        <small className="text-muted d-block mb-2">
                          Save this tag for physical labeling
                        </small>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm px-4"
                          onClick={downloadQR} // <--- මෙන්න මෙතනට download function එක දුන්නා
                        >
                          Download PNG Tag
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Save to Catalogue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-4">
        <div className="col-md-8"></div>
        <div className="col-md-4">
          <AIInsightPanel resources={resources} />
        </div>
      </div>
    </div>
  );
};

export default ResourceList;
