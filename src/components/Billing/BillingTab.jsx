import React, { useState, useEffect } from 'react';
import { FaCoins, FaHistory, FaChartLine, FaInfoCircle, FaWallet, FaCreditCard, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import './BillingTab.css';

const BillingTab = () => {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarState = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarState);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarState);
    };
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    // Convert USD to INR (assuming 1 USD = 83 INR)
    const inrAmount = amount * 83;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(inrAmount);
  };
  const formatIndianCurrency = (amount) => {
    // Convert USD to INR (assuming 1 USD = 83 INR)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/billing/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setBillingData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load billing information');
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const renderOverviewSection = () => (
    <div className="overview-section">
      <div className="overview-cards">
        <div className="overview-card total-credits">
          <FaWallet className="card-icon" />
          <span className="card-label">Total Credits</span>
          <span className="card-value">{formatCurrency(billingData.credits.total_available)}</span>
          <span className="card-subtitle">Available Balance</span>
        </div>

        <div className="overview-card free-credits">
          <FaCoins className="card-icon" />
          <span className="card-label">Free Credits</span>
          <span className="card-value">{formatCurrency(billingData.credits.free_credits)}</span>
          <span className="card-subtitle">Complimentary Balance</span>
        </div>

        <div className="overview-card paid-credits">
          <FaCreditCard className="card-icon" />
          <span className="card-label">Paid Credits</span>
          <span className="card-value">{formatCurrency(billingData.credits.paid_credits)}</span>
          <span className="card-subtitle">Purchased Balance</span>
        </div>

        <div className="overview-card usage-cost">
          <FaExchangeAlt className="card-icon" />
          <span className="card-label">Total Usage</span>
          <span className="card-value">{formatCurrency(billingData.usage_summary.total_usage_cost)}</span>
          <span className="card-subtitle">Current Period</span>
        </div>
      </div>
    </div>
  );

  const renderCreditsSection = () => (
    <div className="billing-card credits-card">
      <div className="card-header">
        <h3><FaCoins className="billing-icon" /> Available Credits</h3>
        <div className="last-updated">
          Last Updated: {formatDate(billingData.credits.last_updated)}
        </div>
      </div>
      <div className="credits-info">
        <div className="credit-item">
          <span className="credit-label">Total Credits</span>
          <span className="credit-value">{formatCurrency(billingData.credits.total_available)}</span>
        </div>
        <div className="credit-item">
          <span className="credit-label">Free Credits</span>
          <span className="credit-value free">{formatCurrency(billingData.credits.free_credits)}</span>
        </div>
        <div className="credit-item">
          <span className="credit-label">Paid Credits</span>
          <span className="credit-value paid">{formatCurrency(billingData.credits.paid_credits)}</span>
        </div>
      </div>
    </div>
  );

  const renderUsageSummary = () => (
    <div className="billing-card usage-card">
      <div className="card-header">
        <h3><FaChartLine className="billing-icon" /> Usage Summary</h3>
      </div>
      <div className="usage-info">
        <div className="usage-total">
          <span className="usage-label">Total Usage Cost:</span>
          <span className="usage-value">{formatCurrency(billingData.usage_summary.total_usage_cost)}</span>
        </div>
        
        {Object.entries(billingData.usage_summary.services).map(([service, data]) => (
          <div key={service} className="service-usage">
            <span className="service-name">{service}</span>
            <span className="service-total">{formatCurrency(data.total_cost)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentHistory = () => (
    <div className="billing-card history-card">
      <div className="card-header">
        <h3><FaHistory className="billing-icon" /> Payment History</h3>
        <div className="payment-count">
          {billingData.payment_history?.length || 0} Transactions
        </div>
      </div>
      <div className="payment-history">
        {billingData.payment_history && billingData.payment_history.length > 0 ? (
          <div className="history-list">
            {billingData.payment_history.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-left">
                  <span className="payment-date">{formatDate(payment.date)}</span>
                  {payment.status.toLowerCase() !== 'completed' && (
                    <span className={`payment-status ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  )}
                </div>
                <span className="payment-amount">{formatIndianCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-payments">No payment history available</div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="billing-loading">
        <div className="spinner"></div>
        <div className="loading-text">Loading billing information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="billing-error">
        <FaInfoCircle className="error-icon" />
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="billing-error">
        <FaInfoCircle className="error-icon" />
        <div className="error-message">No billing data available</div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="billing-header">
        <h2><FaWallet className="billing-icon" /> Billing Dashboard</h2>
      </div>

      {renderOverviewSection()}

      <div className="billing-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payment History
        </button>
      </div>

      <div className="billing-content">
        {activeTab === 'overview' && (
          <div className="billing-grid">
            {renderCreditsSection()}
            {renderUsageSummary()}
          </div>
        )}
        {activeTab === 'payments' && renderPaymentHistory()}
      </div>
    </div>
  );
};

export default BillingTab; 