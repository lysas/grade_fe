import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Organization.css';

axios.defaults.baseURL = 'http://localhost:8000'; // Or use your env variable

const OrganizationProfile = () => {
    const navigate = useNavigate();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper to get auth header
    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    // Fetch organization profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/organization/profile/', getAuthHeader());
                setOrganization(response.data); // If your backend wraps in {status, data}, use response.data.data
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Failed to fetch organization profile');
                if (error.response?.status === 401) {
                    navigate('/organization-login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('organization');
        toast.success('Logged out successfully');
        navigate('/organization-login');
    };

    if (loading || !organization) {
        return <div className="org-profile-loading">Loading...</div>;
    }

    return (
        <div className="organization-profile-container improved-ui">
            <div className="profile-header">
                <h2>Organization Profile</h2>
            </div>
            <div className="org-profile-card">
                <div className="org-profile-row">
                    <span className="org-profile-label">ID:</span>
                    <span className="org-profile-value">{organization.id || '-'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Name:</span>
                    <span className="org-profile-value">{organization.name || '-'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Email:</span>
                    <span className="org-profile-value">{organization.email || '-'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Status:</span>
                    <span className={`org-profile-status ${organization.status ? 'active' : 'inactive'}`}>{organization.status ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Address:</span>
                    <span className="org-profile-value">{organization.address || '-'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Phone Number:</span>
                    <span className="org-profile-value">{organization.phone_number || '-'}</span>
                </div>
                <div className="org-profile-row">
                    <span className="org-profile-label">Description:</span>
                    <span className="org-profile-value">{organization.description || '-'}</span>
                </div>
            </div>
            <div className="profile-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default OrganizationProfile; 