import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // State for stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalEvaluators: 0,
    totalQPUploaders: 0,
    totalOrganizations: 0,
    totalUploads: 0,
    pendingRequests: 0,
    feedbackCount: 0,
  });
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docLoadingId, setDocLoadingId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");
  const [evaluators, setEvaluators] = useState([]);
  const [unassignedAnswers, setUnassignedAnswers] = useState([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [manualAssignLoading, setManualAssignLoading] = useState(false);
  const [manualAssignMessage, setManualAssignMessage] = useState("");
  const isAdmin = true; // TODO: Replace with real admin check

  // Helper to get auth header (from Main.jsx)
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { headers: { 'Authorization': `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const authHeader = getAuthHeader();
        if (!authHeader) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }
        // Fetch total user count and role counts
        const [userCountRes, roleCountsRes, orgsRes, reqsRes, feedbackRes] = await Promise.all([
          axios.get('/api/user-count/', authHeader),
          axios.get('/api/user-role-counts/', authHeader),
          axios.get('/api/organization/list/', authHeader),
          axios.get('/api/grade/main-requests/', authHeader),
          axios.get('/api/feedback/list/', authHeader),
        ]);
        setOrganizations(orgsRes.data.data);
        setRequests(reqsRes.data);
        setFeedback(feedbackRes.data.data || []);

        setStats({
          totalUsers: userCountRes.data.count,
          totalStudents: roleCountsRes.data.student,
          totalEvaluators: roleCountsRes.data.evaluator,
          totalQPUploaders: roleCountsRes.data.qp_uploader,
          totalMentors: roleCountsRes.data.mentor,
          totalOrganizations: orgsRes.data.data.length,
          totalUploads: 0,
          pendingRequests: reqsRes.data.length,
          feedbackCount: feedbackRes.data.count || 0,
        });

        // Fetch evaluators
        const evalRes = await axios.get('/api/grade/get-evaluators/', authHeader);
        setEvaluators(evalRes.data);
        // Fetch unassigned answers
        const unassignedRes = await axios.get('/api/grade/unassigned-answers/', authHeader);
        console.log("unassigned",unassignedRes)
        setUnassignedAnswers(unassignedRes.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Action handlers (placeholders)
  const handleActivateUser = (userId) => {/* ... */};
  const handleDeactivateUser = (userId) => {/* ... */};
  const handleAssignRole = (userId, role) => {/* ... */};
  const handleApproveOrg = async (orgId) => {
    try {
      const notes = prompt('Enter verification notes:');
      if (!notes) return;
      const authHeader = getAuthHeader();
      await axios.post(`/api/organization/verify/${orgId}/`, { verification_notes: notes }, authHeader);
      setOrganizations(prev => prev.filter(org => org.id !== orgId));
    } catch (err) {
      alert('Failed to approve organization.');
    }
  };
  const handleRejectOrg = async (orgId) => {
    try {
      const notes = prompt('Enter rejection notes:');
      if (!notes) return;
      const authHeader = getAuthHeader();
      await axios.post(`/api/organization/reject/${orgId}/`, { verification_notes: notes }, authHeader);
      setOrganizations(prev => prev.filter(org => org.id !== orgId));
    } catch (err) {
      alert('Failed to reject organization.');
    }
  };
  const handleApproveRequest = async (reqId) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      const url = `/api/grade/accept_main_request/${reqId}/accept/`;
      await axios.post(url, {}, authHeader);
      setRequests(prev => prev.filter(req => req.id !== reqId));
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to approve request.");
      alert(error.response?.data?.detail || "Failed to approve request.");
    }
  };
  const handleRejectRequest = async (reqId) => {
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        return;
      }
      const url = `/api/grade/accept_main_request/${reqId}/reject/`;
      await axios.post(url, {}, authHeader);
      setRequests(prev => prev.filter(req => req.id !== reqId));
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to reject request.");
      alert(error.response?.data?.detail || "Failed to reject request.");
    }
  };

  // Add handleViewDocument for registration proof
  const handleViewDocument = async (orgId) => {
    setDocLoadingId(orgId);
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setError("Authentication token not found. Please log in again.");
        setDocLoadingId(null);
        return;
      }
      const apiUrl = `/api/organization/${orgId}/view_document/`;
      const response = await axios.get(apiUrl, {
        ...authHeader,
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      setError('No registration document found for this organization.');
      alert('No registration document found for this organization.');
    } finally {
      setDocLoadingId(null);
    }
  };

  // Handler for assigning answers to evaluators
  const handleAssignAnswers = async () => {
    setAssignLoading(true);
    setAssignMessage("");
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setAssignMessage("Authentication token not found. Please log in again.");
        setAssignLoading(false);
        return;
      }
      await axios.post('/api/grade/assign-answers/', {}, authHeader);
      setAssignMessage("Answer sheets assigned to evaluators successfully!");
    } catch (err) {
      setAssignMessage("Failed to assign answer sheets. Only admins can perform this action.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Handler for manual assignment
  const handleManualAssign = async () => {
    setManualAssignLoading(true);
    setManualAssignMessage("");
    try {
      const authHeader = getAuthHeader();
      if (!authHeader) {
        setManualAssignMessage("Authentication token not found. Please log in again.");
        setManualAssignLoading(false);
        return;
      }
      await axios.post('/api/grade/assign-answer-to-evaluator/', {
        answer_upload_id: selectedAnswer,
        evaluator_id: selectedEvaluator
      }, authHeader);
      setManualAssignMessage("Answer assigned to evaluator successfully!");
    } catch (err) {
      setManualAssignMessage("Failed to assign answer. " + (err.response?.data?.error || ""));
    } finally {
      setManualAssignLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      {error && <div className="admin-dashboard-error">{error}</div>}
      {loading ? (
        <div className="admin-dashboard-loading">Loading...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="admin-dashboard-stats">
            <div className="stat-card">Total Users<br /><span>{stats.totalUsers}</span></div>
            <div className="stat-card">Students<br /><span>{stats.totalStudents}</span></div>
            <div className="stat-card">Evaluators<br /><span>{stats.totalEvaluators}</span></div>
            <div className="stat-card">QP Uploaders<br /><span>{stats.totalQPUploaders}</span></div>
            <div className="stat-card">Mentors<br /><span>{stats.totalMentors}</span></div>
            <div className="stat-card">Organizations<br /><span>{stats.totalOrganizations}</span></div>
            <div className="stat-card">Pending Requests<br /><span>{stats.pendingRequests}</span></div>
            <div className="stat-card">Feedback<br /><span>{stats.feedbackCount}</span></div>
          </div>

          {/* Organization Management */}
          <section className="admin-dashboard-section">
            <h2>Organization Management</h2>
            <div className="admin-dashboard-table-wrapper">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Registration Date</th>
                    <th>Registration Proof</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map(org => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>{org.email}</td>
                      <td>{org.address}</td>
                      <td>{org.phone_number}</td>
                      <td>{org.registration_date}</td>
                      <td>
                        <button onClick={() => handleViewDocument(org.id)} disabled={docLoadingId === org.id}>
                          {docLoadingId === org.id ? 'Loading...' : 'View Document'}
                        </button>
                      </td>
                      <td>{org.description}</td>
                      <td>{org.created_at}</td>
                      <td>
                        <button onClick={() => handleApproveOrg(org.id)}>Approve</button>
                        <button onClick={() => handleRejectOrg(org.id)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Requests Management */}
          <section className="admin-dashboard-section">
            <h2>Requests</h2>
            <div className="admin-dashboard-table-wrapper">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Board</th>
                    <th>Subject</th>
                    <th>Resume</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td>{req.email}</td>
                      <td>{req.role}</td>
                      <td>{req.board}</td>
                      <td>{req.subject}</td>
                      <td>
                        {req.resume ? (
                          <a href={req.resume.startsWith('http') ? req.resume : `${window.location.origin}${req.resume}`} target="_blank" rel="noopener noreferrer">View Resume</a>
                        ) : 'No Resume'}
                      </td>
                      <td>
                        <button onClick={() => handleApproveRequest(req.id)}>Approve</button>
                        <button onClick={() => handleRejectRequest(req.id)}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Feedback/Notifications */}
          <section className="admin-dashboard-section">
            <h2>Feedback</h2>
            <div className="admin-dashboard-table-wrapper">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map(fb => (
                    <tr key={fb.id}>
                      <td>{fb.user_name}</td>
                      <td>{fb.user_email}</td>
                      <td>
                        <span className={`rating-badge ${fb.emoji_rating}`}>
                          {fb.emoji_rating === 'good' && '😊'}
                          {fb.emoji_rating === 'neutral' && '😐'}
                          {fb.emoji_rating === 'bad' && '😞'}
                          {!fb.emoji_rating && 'N/A'}
                        </span>
                      </td>
                      <td>{fb.comment || 'No comment'}</td>
                      <td>{fb.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {isAdmin && (
            <section className="admin-dashboard-section">
              <h2>Assign Answer Sheets to Evaluators</h2>
              <button className="assign-answers-btn" onClick={handleAssignAnswers} disabled={assignLoading}>
                {assignLoading ? 'Assigning...' : 'Assign Answer Sheets'}
              </button>
              {assignMessage && <div className="assign-message">{assignMessage}</div>}

              <div className="manual-assign-section">
                <h3>Manual Assignment</h3>
                <div className="manual-assign-row">
                  <select value={selectedAnswer} onChange={e => setSelectedAnswer(e.target.value)}>
                    <option value="">Select Answer Sheet</option>
                    {unassignedAnswers.map(ans => (
                      <option key={ans.id} value={ans.id}>{ans.file_name || `Answer #${ans.id}`}</option>
                    ))}
                  </select>
                  <select value={selectedEvaluator} onChange={e => setSelectedEvaluator(e.target.value)}>
                    <option value="">Select Evaluator</option>
                    {evaluators.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name || ev.username || ev.email}</option>
                    ))}
                  </select>
                  <button className="manual-assign-btn" onClick={handleManualAssign} disabled={manualAssignLoading || !selectedAnswer || !selectedEvaluator}>
                    {manualAssignLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
                {manualAssignMessage && <div className="assign-message">{manualAssignMessage}</div>}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 