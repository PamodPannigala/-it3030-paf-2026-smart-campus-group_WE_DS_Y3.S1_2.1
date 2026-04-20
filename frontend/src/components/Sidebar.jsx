import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, CalendarCheck, BookOpen } from 'lucide-react'; // ADDED CalendarCheck and BookOpen
import '../styles/Sidebar.css';


const Sidebar = () => {
  return (
    <div className="bg-light border-right" id="sidebar-wrapper">
      <div className="sidebar-heading p-3">Campus Hub</div>
      <div className="list-group list-group-flush">
        <Link to="/" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <LayoutDashboard className="me-2" size={18} />
          Dashboard
        </Link>
        <Link to="/inventory" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <Package className="me-2" size={18} />
          Inventory
        </Link>
        <Link to="/catalogue" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <Package className="me-2" size={18} />
          Catalogue
        </Link>
        {/* ADD THIS - Admin Bookings Link */}
        <Link to="/admin/bookings" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <CalendarCheck className="me-2" size={18} />
          Manage Bookings
        </Link>
        <Link to="/resourseDetail/view" className="list-group-item list-group-item-action bg-light p-3 d-flex align-items-center">
          <Package className="me-2" size={18} />
          ResourceDetail
        </Link>

      </div>
    </div>
  );
};

export default Sidebar;