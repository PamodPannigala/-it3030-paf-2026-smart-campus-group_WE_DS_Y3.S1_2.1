import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading p-3">Campus Hub</div>
      <div className="list-group list-group-flush">
        <Link to="/" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <LayoutDashboard className="me-2" size={18} />
          Member 4
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
