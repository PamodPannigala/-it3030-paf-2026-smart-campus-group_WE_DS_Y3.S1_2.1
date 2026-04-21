import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "../styles/Dashboard.css";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const Dashboard = () => {
  const [totalResources, setTotalResources] = useState(0);
  const [available, setAvailable] = useState(0);
  const [underMaintenance, setUnderMaintenance] = useState(0);

  // New state for storing the full list of resources (for charts and export)
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("stats");

  useEffect(() => {
    const fetchData = async () => {
      try {
        //Old Analytics API (for Cards)
        const analyticsResponse = await axios.get(
          "http://localhost:8080/api/resources/analytics",
        );
        setTotalResources(analyticsResponse.data.totalResources);
        setAvailable(analyticsResponse.data.availableResources);
        setUnderMaintenance(analyticsResponse.data.maintenanceResources);

        //New Resources API එක (for Charts)
        const resourcesResponse = await axios.get(
          "http://localhost:8080/api/resources",
        );
        setResources(resourcesResponse.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="mt-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="mt-4 text-danger">
        Error: Unable to load data. Please ensure the backend is running.
      </div>
    );
  }

  // ==========================================
  // --- Prepare data for charts ---
  // ==========================================

  // 1. left side Bar Chart ekata data hadanwa
  const facilities = resources.filter((item) => item.type === "FACILITY");
  const capacityByLocation = facilities.reduce((acc, item) => {
    const loc = item.location || "Unknown";
    // using Number() ,fixed the calculation
    acc[loc] = (acc[loc] || 0) + (Number(item.capacity) || 0);
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(capacityByLocation),
    datasets: [
      {
        label: "Total Capacity",
        data: Object.values(capacityByLocation),
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: ["#36a2eb", "#4bc0c0", "#9966ff", "#ff9f40"],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  // 2. Making data for Right side Donut Chart (based on Status & Type)
  const healthBreakdown = resources.reduce(
    (acc, item) => {
      const isBroken =
        item.status === "OUT_OF_SERVICE" ||
        item.status === "BROKEN" ||
        item.status === "MAINTENANCE";
      const bucket = `${item.type} - ${isBroken ? "Broken" : "Active"}`;
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    },
    {
      "FACILITY - Active": 0,
      "FACILITY - Broken": 0,
      "EQUIPMENT - Active": 0,
      "EQUIPMENT - Broken": 0,
    },
  );

  const donutChartData = {
    labels: Object.keys(healthBreakdown),
    datasets: [
      {
        data: Object.values(healthBreakdown),
        backgroundColor: ["#28a745", "#dc3545", "#20c997", "#ffc107"],
        borderWidth: 2,
      },
    ],
  };

  // Tooltip % display karanna options hadanawa
  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            let value = context.parsed;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) + "%" : "0%";
            return label + value + " (" + percentage + ")";
          },
        },
      },
    },
  };

  // ==========================================
  //report generation Excel
  const exportToExcel = () => {
    // --- 1. CARD DATA (Summary Statistics) ---
    const summaryData = [
      { Metric: "Total Resources", Value: totalResources },
      { Metric: "Available Resources", Value: available },
      { Metric: "Resources Under Maintenance", Value: underMaintenance },
      { Metric: "Report Generated Date", Value: new Date().toLocaleString() },
    ];

    // --- 2. BAR CHART DATA (Facility Capacity by Location) ---
    //Here we are converting the capacityByLocation object into an array of objects suitable for Excel export
    const locationData = Object.keys(capacityByLocation).map((loc) => ({
      "Location ID": loc,
      "Total Capacity": capacityByLocation[loc],
    }));

    //  3. DONUT CHART DATA (Health Breakdown)
    //
    const healthData = Object.keys(healthBreakdown).map((category) => ({
      "Category Status": category,
      "Asset Count": healthBreakdown[category],
    }));

    //  4. Create EXCEL WORKBOOK
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Summary Stats
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Executive Summary");

    // Sheet 2: Capacity Analysis
    const locationSheet = XLSX.utils.json_to_sheet(locationData);
    XLSX.utils.book_append_sheet(workbook, locationSheet, "Location Capacity");

    // Sheet 3: Health Breakdown
    const healthSheet = XLSX.utils.json_to_sheet(healthData);
    XLSX.utils.book_append_sheet(workbook, healthSheet, "Health Analysis");

    // 5. FILE DOWNLOAD
    XLSX.writeFile(workbook, "Infrastructure_Dashboard_Report.xlsx");
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1 className="mt-4 mb-4  d-flex align-items-center fw-bold">
          Resource Dashboard
        </h1>
        <button className="btn-download-pro shadow-sm" onClick={exportToExcel}>
          <i className="bi bi-cloud-arrow-down-fill"></i>
          <span>Download Report</span>
        </button>
      </div>

      {/*My cards */}
      <div className="row">
        <div className="col-md-4">
          <div className="card custom-card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Resources</h5>
              <p className="card-text fs-3 fw-bold">{totalResources}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card custom-card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Available Resources</h5>
              <p className="card-text fs-3 fw-bold text-success">{available}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card custom-card mb-4 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Under Maintenance Resources</h5>
              <p className="card-text fs-3 fw-bold text-danger">
                {underMaintenance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row of newly added 2 charts */}
      <div className="row">
        {/* left side: Bar Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold text-secondary mb-3">
                Facility Capacity by Location
              </h5>
              <div style={{ height: "300px" }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Donut Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold text-secondary mb-3">
                Resource Health Breakdown
              </h5>
              <div
                style={{ height: "300px" }}
                className="d-flex justify-content-center"
              >
                <Doughnut data={donutChartData} options={donutChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
