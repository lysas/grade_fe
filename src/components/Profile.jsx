

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserCircle, FaCoins, FaSignOutAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { authService } from './Authentication/authService';
import { PaymentService } from './Upgrade/PaymentService';
import CreditUpgrade from './Upgrade/CreditUpgrade';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [credits, setCredits] = useState({
    free_credit: 0,
    paid_credit: 0,
    total_credit: 0,
    loading: true
  });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const activeRole = localStorage.getItem('activeRole');
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Try to refresh token if needed
        const tokenValid = await authService.refreshTokenIfNeeded();
        if (!tokenValid) {
          throw new Error('Token refresh failed');
        }
        
        // Continue with loading user data
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUserData({
            id: storedUser.id,
            email: storedUser.email,
            username: storedUser.username,
            full_name: storedUser.full_name || storedUser.username ,
            role:  activeRole,
          });
          
          await loadUserCredits();
        } else {
          throw new Error('User data not found');
        }
      } catch (error) {
        toast.error('Session expired. Please log in again.');
        authService.logout();
        navigate('/authenticate');
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuthAndLoadData();
  }, [navigate]);

  const loadUserCredits = async () => {
    try {
      setCredits(prev => ({ ...prev, loading: true }));
      const data = await PaymentService.getUserCredits();
      setCredits({
        free_credit: parseFloat(data.free_credit) || 0,
        paid_credit: parseFloat(data.paid_credit) || 0,
        total_credit: parseFloat(data.total_credit) || 0,
        loading: false
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load credit balance');
      setCredits(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate('/authenticate');
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1><FaUserCircle className="profile-icon" /> My Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-photo-container">
              <FaUserCircle className="profile-photo" />
            </div>
            <div className="profile-text">
              <h2>{userData.full_name}</h2>
              <p className="profile-email">{userData.email}</p>
              <p className="profile-id">User ID: {userData.id}</p>
              <p className="profile-email"> Role: {userData.role}</p>
            </div>
          </div>

          <div className="credit-card">
            <div className="credit-header">
              <FaCoins className="credit-icon" />
              <h3>Credit Balance</h3>
            </div>
            
            {credits.loading ? (
              <div className="credit-loading">
                <div className="spinner small"></div>
              </div>
            ) : (
              <div className="credit-details">
                <div className="credit-row">
                  <span>Free Credits:</span>
                  <span className="credit-amount free">${credits.free_credit.toFixed(7)}</span>
                </div>
                <div className="credit-row">
                  <span>Paid Credits:</span>
                  <span className="credit-amount paid">${credits.paid_credit.toFixed(7)}</span>
                </div>
                <div className="credit-row total">
                  <span>Total Credits:</span>
                  <span className="credit-amount total">${credits.total_credit.toFixed(7)}</span>
                </div>
              </div>
            )}
            
            <button 
              className="upgrade-toggle-btn"
              onClick={() => setShowUpgrade(!showUpgrade)}
            >
              {showUpgrade ? (
                <>
                  <FaChevronUp /> Hide Upgrade Options
                </>
              ) : (
                <>
                  <FaChevronDown /> Upgrade Credits
                </>
              )}
            </button>
          </div>
        </div>
        
        {showUpgrade && (
          <div className="upgrade-section">
            <CreditUpgrade onCreditsUpdated={loadUserCredits} />
          </div>
        )}
        
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;