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


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [totalResources, setTotalResources] = useState(0);
  const [available, setAvailable] = useState(0);
  const [underMaintenance, setUnderMaintenance] = useState(0);
  
  // Charts වලට අවශ්‍ය මුළු දත්ත ලිස්ට් එක තියාගන්න අලුත් state එක
  const [resources, setResources] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const fetchData = async () => {
      try {
        //Old Analytics API (for Cards)
        const analyticsResponse = await axios.get('http://localhost:8080/api/resources/analytics');
        setTotalResources(analyticsResponse.data.totalResources);
        setAvailable(analyticsResponse.data.availableResources);
        setUnderMaintenance(analyticsResponse.data.maintenanceResources);

        //New Resources API එක (for Charts)
        const resourcesResponse = await axios.get('http://localhost:8080/api/resources');
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
  const facilities = resources.filter(item => item.type === "FACILITY");
  const capacityByLocation = facilities.reduce((acc, item) => {
    const loc = item.location || "Unknown";
    // using Number() ,fixed the calculation
    acc[loc] = (acc[loc] || 0) + (Number(item.capacity) || 0); 
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(capacityByLocation),
    datasets: [{
      label: 'Total Capacity',
      data: Object.values(capacityByLocation),
      backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)'],
      borderColor: ['#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'],
      borderWidth: 1,
      borderRadius: 5,
    }],
  };

  const barChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  // 2. Making data for Right side Donut Chart (based on Status & Type)
  const healthBreakdown = resources.reduce((acc, item) => {
    const isBroken = item.status === "OUT_OF_SERVICE" || item.status === "BROKEN" || item.status === "MAINTENANCE";
    const bucket = `${item.type} - ${isBroken ? "Broken" : "Active"}`;
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, { 'FACILITY - Active': 0, 'FACILITY - Broken': 0, 'EQUIPMENT - Active': 0, 'EQUIPMENT - Broken': 0 });

  const donutChartData = {
    labels: Object.keys(healthBreakdown),
    datasets: [{
      data: Object.values(healthBreakdown),
      backgroundColor: ['#28a745', '#dc3545', '#20c997', '#ffc107'],
      borderWidth: 2,
    }],
  };

  // Tooltip % display karanna options hadanawa
  const donutChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    cutout: '70%', 
    plugins: { 
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) { label += ': '; }
            let value = context.parsed;
            let total = context.dataset.data.reduce((a, b) => a + b, 0);
            let percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return label + value + ' (' + percentage + ')';
          }
        }
      }
    } 
  };

  // ==========================================

  return (
    <div className="container-fluid">
      <h1 className="mt-4 mb-4">Dashboard</h1>
      
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
              <p className="card-text fs-3 fw-bold text-danger">{underMaintenance}</p>
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
              <h5 className="card-title fw-bold text-secondary mb-3">Facility Capacity by Location</h5>
              <div style={{ height: '300px' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Donut Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold text-secondary mb-3">Resource Health Breakdown</h5>
              <div style={{ height: '300px' }} className="d-flex justify-content-center">
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