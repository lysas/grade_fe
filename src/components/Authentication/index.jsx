// import React, { useState } from "react";
// import { Routes, Route, useNavigate } from 'react-router-dom';
// import Login from "./Login";
// import Signup from "./Signup";
// import userProfile from '../../assets/userProfile.jpeg';

// function Authentication() {
//   const [isLogin, setIsLogin] = useState(true);
//   const navigate = useNavigate();
  
//   const handleSwitchForm = () => {
//     setIsLogin(!isLogin);
//   };
  
//   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/login');
//   };
  
//   // Get user data from localStorage
//   const userData = {
//     id: localStorage.getItem('userId'),
//     email: localStorage.getItem('email'), // Fixed to match what's set in the Signup component
//   };
  
//   return (
//     <div className="auth-container">
//       {!isLoggedIn ? (
//         <div className="auth-form-container">
//           {isLogin ? 
//             <Login onSwitchForm={handleSwitchForm} /> :
//             <Signup onSwitchForm={handleSwitchForm} />
//           }
//         </div>
//       ) : (
//         <div className="profile-wrapper">
//           <div className="profile-section">
//             <div className="profile-container">
//               <img src={userProfile} alt="Profile" className="profile-photo" />
//               <div className="profile-details">
//                 <h2>User Profile</h2>
//                 <p><strong>ID:</strong> {userData.id}</p>
//                 <p><strong>Email:</strong> {userData.email}</p>
//               </div>
//             </div>
//           </div>
//           <button onClick={handleLogout} className="auth-button logout-button">
//             Logout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Authentication;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./Login";
import Signup from "./Signup";
import userProfile from '../../assets/userProfile.jpeg';

function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // If logged in and on the authentication page, redirect to home
    if (isLoggedIn && location.pathname === '/authenticate') {
      navigate('/');
    }
  }, [navigate, location.pathname]);
  
  const handleSwitchForm = () => {
    setIsLogin(!isLogin);
  };
  
  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/');
    // Close dropdown after logout
    setIsProfileDropdownOpen(false);
  };
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Get user data from localStorage
  const userData = {
    id: localStorage.getItem('userId'),
    email: localStorage.getItem('userEmail') || localStorage.getItem('email'),
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // This would typically be used in your Navbar component
  const renderProfileIcon = () => {
    if (isLoggedIn) {
      return (
        <div className="profile-icon-container">
          <div className="profile-icon" onClick={toggleProfileDropdown}>
            <img src={userProfile} alt="Profile" className="nav-profile-photo" />
          </div>
          
          {isProfileDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user-info">
                <img src={userProfile} alt="Profile" className="dropdown-profile-photo" />
                <span>{userData.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => navigate('/profile')}>
                My Profile
              </div>
              <div className="dropdown-item" onClick={() => navigate('/settings')}>
                Settings
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button className="login-button" onClick={() => navigate('/authenticate')}>
          Login
        </button>
      );
    }
  };
  
  // Main component rendering logic
  if (location.pathname === '/authenticate' && !isLoggedIn) {
    return (
      <div className="auth-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="auth-form-container">
          {isLogin ? 
            <Login onSwitchForm={handleSwitchForm} /> :
            <Signup onSwitchForm={handleSwitchForm} />
          }
        </div>
      </div>
    );
  }
  
  // For demonstration purposes - this would normally be in your profile page
  if (location.pathname === '/profile' && isLoggedIn) {
    return (
      <div className="profile-page">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="profile-section">
          <div className="profile-container">
            <img src={userProfile} alt="Profile" className="profile-photo" />
            <div className="profile-details">
              <h2>User Profile</h2>
              <p><strong>ID:</strong> {userData.id}</p>
              <p><strong>Email:</strong> {userData.email}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="auth-button logout-button">
          Logout
        </button>
      </div>
    );
  }
  
  // For navbar icon demonstration
  return (
    <div className="auth-component">
      <ToastContainer position="top-right" autoClose={3000} />
      {renderProfileIcon()}
    </div>
  );
}

export default Authentication;