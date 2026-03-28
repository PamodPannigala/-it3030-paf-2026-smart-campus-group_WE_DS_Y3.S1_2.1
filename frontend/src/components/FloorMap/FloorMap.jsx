import React, { useState } from "react";

const FloorMap = ({ resources }) => {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, room: "" });

  const getStatus = (loc) => {
    const items = resources.filter((r) => r.location === loc);
    const isBroken = items.some((i) => i.status === "OUT_OF_SERVICE");
    return {
      color: isBroken ? "#f87171" : "#4ade80",
      items,
      bg: isBroken ? "rgba(248, 113, 113, 0.1)" : "rgba(74, 222, 128, 0.1)",
    };
  };

  const showInfo = (e, loc) => {
    setTooltip({
      show: true,
      x: e.clientX + 10,
      y: e.clientY - 40,
      room: loc,
      data: getStatus(loc),
    });
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        padding: "40px",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: 0, color: "#1f2937" }}>
          Interactive Campus Layout
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Hover over a room to see resource status
        </p>
      </div>

      {/* SVG MAP START */}
      <svg
        viewBox="0 0 900 450"
        style={{
          width: "100%",
          height: "auto",
          filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.05))",
        }}
      >
        {/* Main Corridor (බිම සහ කොරිඩෝව) */}
        <rect x="0" y="180" width="900" height="40" fill="#f8fafc" />

        {/* Room 1: Lab 01 */}
        <g
          onMouseMove={(e) => showInfo(e, "Lab 01")}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
          style={{ cursor: "pointer" }}
        >
          <rect
            x="50"
            y="50"
            width="250"
            height="130"
            rx="12"
            fill={getStatus("Lab 01").bg}
            stroke={getStatus("Lab 01").color}
            strokeWidth="2"
          />
          <text
            x="175"
            y="120"
            textAnchor="middle"
            fill="#374151"
            fontWeight="bold"
          >
            💻 Lab 01
          </text>
        </g>

        {/* Room 2: Server Room */}
        <g
          onMouseMove={(e) => showInfo(e, "Server Room")}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
          style={{ cursor: "pointer" }}
        >
          <rect
            x="320"
            y="50"
            width="180"
            height="130"
            rx="12"
            fill={getStatus("Server Room").bg}
            stroke={getStatus("Server Room").color}
            strokeWidth="2"
          />
          <text
            x="410"
            y="120"
            textAnchor="middle"
            fill="#374151"
            fontWeight="bold"
          >
            🖥️ Server Room
          </text>
        </g>

        {/* Room 3: Lecture Hall */}
        <g
          onMouseMove={(e) => showInfo(e, "Lecture Hall")}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
          style={{ cursor: "pointer" }}
        >
          <rect
            x="520"
            y="50"
            width="330"
            height="130"
            rx="12"
            fill={getStatus("Lecture Hall").bg}
            stroke={getStatus("Lecture Hall").color}
            strokeWidth="2"
          />
          <text
            x="685"
            y="120"
            textAnchor="middle"
            fill="#374151"
            fontWeight="bold"
          >
            🎓 Lecture Hall
          </text>
        </g>

        {/* Room 4: Main Office (eeee) */}
        <g
          onMouseMove={(e) => showInfo(e, "eeee")}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
          style={{ cursor: "pointer" }}
        >
          <rect
            x="50"
            y="240"
            width="800"
            height="150"
            rx="12"
            fill={getStatus("eeee").bg}
            stroke={getStatus("eeee").color}
            strokeWidth="2"
          />
          <text
            x="450"
            y="320"
            textAnchor="middle"
            fill="#374151"
            fontWeight="bold"
            fontSize="20"
          >
            🏢 Main Admin Facility (eeee)
          </text>
        </g>
      </svg>

      {/* TOOLTIP */}
      {tooltip.show && (
        <div
          style={{
            position: "fixed",
            top: tooltip.y,
            left: tooltip.x,
            background: "rgba(17, 24, 39, 0.9)",
            backdropFilter: "blur(5px)",
            color: "#fff",
            padding: "15px",
            borderRadius: "12px",
            zIndex: 100,
            minWidth: "220px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              borderBottom: "1px solid #374151",
              paddingBottom: "8px",
              marginBottom: "8px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{tooltip.room}</span>
            <span style={{ color: tooltip.data.color }}>●</span>
          </div>
          {tooltip.data.items.length > 0 ? (
            tooltip.data.items.map((item, i) => (
              <div
                key={i}
                style={{
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>{item.name}</span>
                <span
                  style={{
                    color: item.status === "ACTIVE" ? "#4ade80" : "#f87171",
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              No resources assigned.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FloorMap;
