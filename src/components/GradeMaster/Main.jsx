import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Main.css"; // Import CSS for styling
import { useNavigate } from "react-router-dom";
import { authService } from "../Authentication/authService";

const Main = () => {
  console.log("Main component rendering");
  const [adminRequests, setAdminRequests] = useState([]);
  const [evaluatorRequests, setEvaluatorRequests] = useState([]);
  const [organizationRequests, setOrganizationRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // Get the auth token
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      return null;
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has admin role
        const userRoles = Array.isArray(user?.roles) ? user?.roles : user?.roles?.split(',') || [];
        console.log("User roles:", userRoles);
        
        // Check both roles array and is_admin flag
        const isAdmin = userRoles.includes('admin') || user?.is_admin;
        if (!isAdmin) {
          console.log("User is not an admin, redirecting...");
          navigate('/grade-master');
          return;
        }

        const authHeader = getAuthHeader();
        if (!authHeader) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        console.log("Fetching requests...");
        // Fetch requests from the backend
        const [mainResponse, orgResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/grade/main-requests/", authHeader),
          axios.get("http://127.0.0.1:8000/api/organization/list/", authHeader)
        ]);

        console.log("Main requests response:", mainResponse.data);
        console.log("Organization requests response:", orgResponse.data);

        const data = mainResponse.data;
        const admin = data.filter((request) => request.role === "qp_uploader");
        const evaluator = data.filter((request) => request.role === "evaluator");
        
        setAdminRequests(admin);
        setEvaluatorRequests(evaluator);
        setOrganizationRequests(orgResponse.data.data || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.detail || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, user]);

  const handleAction = async (id, action) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const url = `http://127.0.0.1:8000/api/grade/accept_main_request/${id}/${action}/`;
      const response = await axios.post(url, {}, authHeader);
      
      console.log(response.data.message);
      setAdminRequests((prev) => prev.filter((req) => req.id !== id));
      setEvaluatorRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      setError(error.response?.data?.detail || `Error performing ${action} action`);
    }
  };

  const handleOrganizationAction = async (id, action) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const notes = prompt(`Enter ${action === 'verify' ? 'verification' : 'rejection'} notes:`);
      if (notes === null) return; // User cancelled the prompt
      if (!notes.trim()) {
        alert('Notes are required for this action.');
        return;
      }

      const url = `http://127.0.0.1:8000/api/organization/${action}/${id}/`;
      const response = await axios.post(url, { verification_notes: notes }, authHeader);
      
      if (response.data.status === 'success') {
        // Update the state by filtering out the rejected/verified organization
        setOrganizationRequests(prevRequests => 
          prevRequests.filter(org => org.id !== id)
        );
        
        // Show success message
        const successMessage = action === 'verify' 
          ? 'Organization verified successfully and user updated!' 
          : 'Organization rejected and removed successfully!';
        alert(response.data.message || successMessage);
      } else {
        throw new Error(response.data.message || `Failed to ${action} organization`);
      }
    } catch (error) {
      console.error(`Error performing ${action} action on organization:`, error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || `Error performing ${action} action on organization`;
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewDocument = async (id, type) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const apiUrl = `http://127.0.0.1:8000/api/organization/${id}/view_document/`;
      const response = await axios.get(apiUrl, {
        ...authHeader,
        responseType: 'blob'
      });

      // Create a blob URL and open in new tab
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      const errorMessage = error.response?.data?.message || 'Error viewing document';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleViewResume = async (id) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      // For now, use the direct media URL since we don't have a resume endpoint yet
      const resumeUrl = `http://127.0.0.1:8000/media/resumes/${id}`;
      window.open(resumeUrl, '_blank');
    } catch (error) {
      console.error('Error viewing resume:', error);
      const errorMessage = error.response?.data?.message || 'Error viewing resume';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const renderTable = (requests, role) => (
    <div className={`main-request-section main-request-section-${role}`}>
      <h2 className={`main-request-title main-request-title-${role}`}>
        {role === "admin" ? "Qp Uploader Requests" : "Evaluator Requests"}
      </h2>
      <div className="main-request-table-wrapper">
        <table className={`main-request-table main-request-table-${role}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.email}</td>
                  <td>{request.role}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewResume(request.id)}
                    >
                      View Resume
                    </button>
                  </td>
                  <td>
                    <button
                      className="main-request-btn accept-btn"
                      onClick={() => handleAction(request.id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="main-request-btn reject-btn"
                      onClick={() => handleAction(request.id, "reject")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-requests-row">
                  No requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrganizationTable = () => (
    <div className="main-request-section main-request-section-organization">
      <h2 className="main-request-title main-request-title-organization">
        Organization Requests
      </h2>
      <div className="main-request-table-wrapper">
        <table className="main-request-table main-request-table-organization">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Registration Date</th>
              <th>Registration Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizationRequests.length > 0 ? (
              organizationRequests.map((org) => (
                <tr key={org.id}>
                  <td>{org.id}</td>
                  <td>{org.name}</td>
                  <td>{org.email}</td>
                  <td>{new Date(org.registration_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewDocument(org.id)}
                    >
                      View Document
                    </button>
                  </td>
                  <td>
                    <button
                      className="main-request-btn accept-btn"
                      onClick={() => handleOrganizationAction(org.id, "verify")}
                    >
                      Verify
                    </button>
                    <button
                      className="main-request-btn reject-btn"
                      onClick={() => handleOrganizationAction(org.id, "reject")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-requests-row">
                  No organization requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="main-request-container">
      {renderOrganizationTable()}
      {renderTable(adminRequests, "admin")}
      {renderTable(evaluatorRequests, "evaluator")}
    </div>
  );
};

export default Main;
