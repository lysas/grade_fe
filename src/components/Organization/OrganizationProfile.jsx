import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Organization.css';

const OrganizationProfile = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [organization, setOrganization] = useState({
        id: '',
        name: '',
        email: '',
        status: true
    });

    useEffect(() => {
        // Get organization details from localStorage
        const orgData = localStorage.getItem('organization');
        if (orgData) {
            setOrganization(JSON.parse(orgData));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrganization(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/organization/profile/`,
                organization,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                // Update localStorage with new data
                localStorage.setItem('organization', JSON.stringify(response.data));
                setOrganization(response.data);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Clear all organization-related data from localStorage
        localStorage.removeItem('organization');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Redirect to organization login page
        navigate('/organization-login');
    };

    return (
        <div className="organization-profile-container">
            <div className="profile-header">
                <h2>Organization Profile</h2>
                <button 
                    className="edit-button"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label>Organization ID</label>
                    <input
                        type="text"
                        value={organization.id}
                        disabled={true}
                    />
                </div>

                <div className="form-group">
                    <label>Organization Name</label>
                    <input
                        type="text"
                        name="name"
                        value={organization.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={organization.email}
                        disabled={true}
                    />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <div className="status-badge">
                        <span className={`status-indicator ${organization.status ? 'active' : 'inactive'}`}>
                            {organization.status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {isEditing && (
                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="save-button"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>

            <div className="profile-footer">
                <button 
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default OrganizationProfile; 