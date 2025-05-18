import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ menuItems = [] }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">EasyWithAI</h2>
      
      <nav>
        <ul className="sidebar-menu">
          {menuItems.map(({ path, label, icon }) => (
            <li key={path}>
              <Link 
                to={path} 
                className={`nav-link-left ${location.pathname === path ? 'active' : ''}`}
              >
                <span className="menu-icon">{icon}</span>
                <span className="menu-label">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 