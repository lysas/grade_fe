// Updated Navbar.jsx with fixes for the profile dropdown

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from './Authentication/authService';
import './Navbar.css';
import logo from '../assets/logo.png';
import userProfileImg from '../assets/userProfile.jpeg';

const Navbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    // Check authentication status
    const authStatus = authService.isAuthenticated();
    setIsLoggedIn(authStatus);
    
    if (authStatus) {
      setUser(authService.getCurrentUser());
    }
  }, []);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const toggleProfileDropdown = (e) => {
    e.preventDefault();
    
    if (isLoggedIn) {
      setShowProfileDropdown(!showProfileDropdown);
    } else {
      navigate('/authenticate');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
      <Link to="/" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
        <p className="m-0 fw-bold" style={{ fontSize: '25px' }}>
          <img src={logo} alt="Logo" height="50" />
        </p>
      </Link>
      
      <button 
        type="button" 
        className="navbar-toggler me-4" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarCollapse" 
        style={{ border: 'none' }}
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarCollapse">
        <div className="navbar-nav ms-auto p-4 p-lg-0">
          <Link to="/" className="nav-item nav-link">Home</Link>
          <Link to="/" className="nav-item nav-link">EasyWithAi</Link>
          <Link to="/questiongenerator" className="nav-item nav-link">Question Generator</Link>
          <Link to="/grade-master" className="nav-item nav-link">Grade Master</Link>
          <Link to="/contact" className="nav-item nav-link">Contact</Link>
          
          {/* Notification Button */}
          <Link to="/grade-master/notifications" className="nav-item nav-link">
            <i className="fas fa-bell"></i>
          </Link>
          
          {/* Statistics Button */}
          <Link to="/grade-master/statstudent" className="nav-item nav-link">
            <i className="fas fa-chart-bar"></i>
          </Link>
          
          {/* Profile icon with dropdown */}
          <div className="nav-item position-relative" id="profile-container" ref={profileRef}>
            <a 
              href="#" 
              className="nav-item nav-link" 
              id="profile-icon" 
              onClick={toggleProfileDropdown}
            >
              <img src={userProfileImg} alt="Profile" className="nav-profile-photo" id="profile-image" />
            </a>
            
            {showProfileDropdown && isLoggedIn && (
              <div className="profile-dropdown show" id="profile-dropdown">
                <div className="dropdown-user-info">
                  <img src={userProfileImg} alt="Profile" className="dropdown-profile-photo" />
                  <span className="dropdown-email">{user?.email || 'No email'}</span>
                </div>
                
                <div 
                  className="dropdown-item"
                  onClick={handleProfileClick}
                  style={{ cursor: 'pointer', marginBottom: '8px' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  My Profile
                </div>
                
                <hr className="dropdown-divider" />
                
                <div 
                  className="logout" 
                  onClick={handleLogout}
                  style={{ marginTop: '8px' }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;