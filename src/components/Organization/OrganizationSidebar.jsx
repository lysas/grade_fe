import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const OrganizationSidebar = ({ isCollapsed, onCollapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      path: '/organization/students',
      label: 'Student Management',
      icon: 'fas fa-user-graduate'
    },
    {
      path: '/organization/tests',
      label: 'Test Management',
      icon: 'fas fa-file-alt'
    },
    {
      path: '/organization/progress',
      label: 'Progress Tracking',
      icon: 'fas fa-chart-line'
    },
    {
      path: '/organization/profile',
      label: 'Profile',
      icon: 'fas fa-user-circle'
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`organization-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header p-3 bg-primary text-white">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className={`mb-0 ${isCollapsed ? 'd-none' : ''}`}>Organization Dashboard</h4>
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-white p-0 me-2"
              onClick={() => onCollapse(!isCollapsed)}
            >
              <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
            <button 
              className="btn btn-link text-white d-md-none p-0"
              onClick={toggleMobileMenu}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>
      <div className={`sidebar-menu ${isMobileMenuOpen ? 'show' : ''}`}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item d-flex align-items-center p-3 ${
                isActive ? 'active' : ''
              }`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <i className={`${item.icon} ${isCollapsed ? 'mx-auto' : 'me-3'}`}></i>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default OrganizationSidebar; 