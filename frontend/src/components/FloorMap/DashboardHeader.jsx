import React from "react";

const DashboardHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        paddingBottom: "15px",
        borderBottom: "2px solid #f1f5f9",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: "#0f172a",
          margin: 0,
        }}
      >
        Dashboard
      </h2>

      {/* Tab Switcher */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#f1f5f9",
          padding: "5px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <button
          onClick={() => setActiveTab("stats")}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            backgroundColor: activeTab === "stats" ? "#ffffff" : "transparent",
            color: activeTab === "stats" ? "#2563eb" : "#64748b",
            boxShadow:
              activeTab === "stats"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "none",
            transition: "all 0.3s ease",
          }}
        >
          📊 Statistics
        </button>
        <button
          onClick={() => setActiveTab("map")}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            backgroundColor: activeTab === "map" ? "#ffffff" : "transparent",
            color: activeTab === "map" ? "#2563eb" : "#64748b",
            boxShadow:
              activeTab === "map"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "none",
            transition: "all 0.3s ease",
          }}
        >
          🗺️ Interactive Map
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
