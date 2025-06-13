import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Organization.css';
import logo from '../../assets/logo.png';
import userProfile from '../../assets/userProfile.jpeg';
import { authService } from '../Authentication/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faUsers,
  faChartBar,
  faFileAlt,
  faUserCircle,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';

const OrganizationSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef(null);
  const user = authService.getCurrentUser();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setShowProfileDropdown(false);
    }
  }, [isCollapsed]);

  const mainMenuItems = [
    { path: "/organization/students", label: "Student Management", icon: faUsers },
    { path: "/organization/tests", label: "Test Management", icon: faFileAlt },
    { path: "/organization/test-results", label: "Test Results", icon: faClipboardList },
    { path: "/organization/progress", label: "Progress Tracking", icon: faChartBar },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/authenticate');
    setShowProfileDropdown(false);
  };

  const handleSwitchToNormalLogin = () => {
    navigate('/');
    setShowProfileDropdown(false);
  };

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Dispatch event to notify App component
    window.dispatchEvent(new CustomEvent('sidebarStateChange', { detail: newState }));
  };

  return (
    <div className={`main-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="main-sidebar-header" onClick={toggleSidebar} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Logo" className="main-sidebar-logo" />
      </div>

      <nav className="main-sidebar-nav">
        <ul className="main-sidebar-menu">
          {mainMenuItems.map(({ path, label, icon }) => (
            <li key={path}>
              <div 
                onClick={() => handleNavigation(path)}
                className={`main-nav-link ${location.pathname === path ? 'active' : ''}`}
              >
                <span className="main-menu-icon">
                  <FontAwesomeIcon icon={icon} />
                </span>
                {!isCollapsed && <span className="main-menu-label">{label}</span>}
              </div>
            </li>
          ))}
          <li>
            <div 
              onClick={handleSwitchToNormalLogin}
              className="main-nav-link"
            >
              <span className="main-menu-icon">
                <FontAwesomeIcon icon={faUserCircle} />
              </span>
              {!isCollapsed && <span className="main-menu-label">Normal Login</span>}
            </div>
          </li>
        </ul>
      </nav>

      {/* Profile Section at bottom */}
      <div className="main-sidebar-profile" ref={dropdownRef}>
        <div 
          className={`profile-trigger ${showProfileDropdown ? 'active' : ''}`}
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        >
          <div className="profile-image-container">
            <img src={userProfile} alt="Profile" className="profile-image" />
            {!isCollapsed && showProfileDropdown && (
              <div className="profile-status-indicator"></div>
            )}
          </div>
          {!isCollapsed && (
            <div className="profile-info">
              <span className="profile-name">{user?.email || 'User'}</span>
              <span className="profile-role">{user?.role_org || 'Organization Admin'}</span>
            </div>
          )}
        </div>

        {showProfileDropdown && !isCollapsed && (
          <div
            style={{
              position: 'fixed',
              bottom: '120px',
              left: '30px',
              width: '180px',
              background: 'white',
              border: '1px solid #eaeaea',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 99999,
              overflow: 'hidden'
            }}
          >
            <Link 
              to="/organization/profile" 
              className="dropdown-item"
              onClick={() => setShowProfileDropdown(false)}
            >
              <span className="dropdown-icon">👤</span>
              <span className="dropdown-label">Organization Profile</span>
            </Link>
            <Link 
              to="/organization/notifications" 
              className="dropdown-item"
              onClick={() => setShowProfileDropdown(false)}
            >
              <span className="dropdown-icon">🔔</span>
              <span className="dropdown-label">Notifications</span>
            </Link>
            <div className="dropdown-divider"></div>
            <div 
              className="dropdown-item logout" 
              onClick={handleLogout}
            >
              <span className="dropdown-icon">🚪</span>
              <span className="dropdown-label">Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSidebar; 