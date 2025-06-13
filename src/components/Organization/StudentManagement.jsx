import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faTrash, 
    faEnvelope, 
    faClock,
    faTimes,
    faSpinner,
    faFileUpload,
    faFileCsv,
    faDownload,
    faInfoCircle,
    faPaperPlane,
    faUser,
    faCheckCircle,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import Table from '../GradeMaster/common/Table';
import { Button } from '../common';
import './StudentManagement.css';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:8000';  // Update this with your backend URL
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
);

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    email: '',
  });
  const [bulkEmails, setBulkEmails] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isCsvMode, setIsCsvMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchPendingInvitations();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/organization/students/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setStudents(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const response = await axios.get('/api/organization/students/pending_invitations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        console.log('Pending invitations:', response.data.data); // Debug log
        setPendingInvitations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  const handleInviteStudent = async () => {
    if (isCsvMode) {
      if (!csvFile) {
        setError('Please select a CSV file');
        return;
      }

      try {
        setInviting(true);
        const formData = new FormData();
        formData.append('file', csvFile);

        const response = await axios.post('/api/organization/students/upload_csv/', 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data.status === 'success') {
          const { success_count, already_member_count, already_invited_count, invalid_count } = response.data.data;
          let message = [];
          if (success_count > 0) message.push(`Successfully sent ${success_count} invitation(s)`);
          if (already_member_count > 0) message.push(`${already_member_count} student(s) are already members`);
          if (already_invited_count > 0) message.push(`${already_invited_count} student(s) already have pending invitations`);
          if (invalid_count > 0) message.push(`${invalid_count} invitation(s) failed`);
          
          toast.success(message.join('. '));
          setCsvFile(null);
          setShowAddModal(false);
          setError(null);
          fetchPendingInvitations();
        } else {
          setError(response.data.message || 'Failed to process CSV file');
        }
      } catch (error) {
        console.error('Error processing CSV file:', error);
        setError(error.response?.data?.message || 'Failed to process CSV file');
      } finally {
        setInviting(false);
      }
    } else if (isBulkMode) {
      if (!bulkEmails.trim()) {
        setError('Please enter at least one email address');
        return;
      }

      // Split emails by newline or comma and clean them
      const emailList = bulkEmails
        .split(/[\n,]/)
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emailList.length === 0) {
        setError('Please enter at least one valid email address');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        setError(`Invalid email format: ${invalidEmails.join(', ')}`);
        return;
      }

      try {
        setInviting(true);
        let successCount = 0;
        let failureCount = 0;

        // Send invitations sequentially
        for (const email of emailList) {
          try {
            const response = await axios.post('/api/organization/students/', 
              { email },
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            
            if (response.data.status === 'success') {
              successCount++;
            } else {
              failureCount++;
            }
          } catch (error) {
            failureCount++;
            console.error(`Error sending invitation to ${email}:`, error);
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully sent ${successCount} invitation(s)`);
        }
        if (failureCount > 0) {
          toast.error(`Failed to send ${failureCount} invitation(s)`);
        }

        setBulkEmails('');
        setShowAddModal(false);
        setError(null);
        fetchPendingInvitations();
      } catch (error) {
        console.error('Error sending invitations:', error);
        setError(error.response?.data?.message || 'Failed to send invitations');
      } finally {
        setInviting(false);
      }
    } else {
    if (!newStudent.email) {
      setError('Email is required');
      return;
    }

    try {
      setInviting(true);
      const response = await axios.post('/api/organization/students/', 
        { email: newStudent.email },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        toast.success('Invitation sent successfully!');
        setNewStudent({ email: '' });
        setShowAddModal(false);
        setError(null);
        fetchPendingInvitations();
      } else {
        setError(response.data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
      }
    }
  };

  const handleCancelInvitation = async (invitationId, status) => {
    if (!invitationId) {
      toast.error('Invalid invitation ID');
      return;
    }

    try {
      let endpoint;
      if (status === 'accepted') {
        endpoint = `/api/organization/students/${invitationId}/remove/`;
      } else {
        endpoint = `/api/organization/students/${invitationId}/cancel_invitation/`;
      }

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        toast.success(status === 'accepted' ? 'Student removed successfully' : 'Invitation cancelled successfully');
        if (status === 'accepted') {
          fetchStudents();
        } else {
          fetchPendingInvitations();
        }
      } else {
        toast.error(response.data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 404) {
        toast.error('Not found');
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    }
  };

  const handleRemoveStudent = async (id) => {
    try {
      const response = await axios.post(
        `/api/organization/students/${id}/remove/`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        setStudents(students.filter(student => student.id !== id));
        toast.success('Student removed successfully');
      } else {
        toast.error(response.data.message || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setCsvFile(file);
      setError(null);
    }
  };

  const studentColumns = [
    { 
      header: <div className="text-center">Name</div>,
      accessor: 'username'
    },
    { 
      header: <div className="text-center">Email</div>,
      accessor: 'email'
    },
    { 
      header: <div className="text-center">Status</div>,
      accessor: 'is_active',
      renderCell: (column, row) => (
        <span className={`badge ${row.is_active ? 'bg-success' : 'bg-danger'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: <div className="text-center">Actions</div>,
      accessor: 'actions',
      renderCell: (column, row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelInvitation(row.id, 'accepted');
            }}
            title="Remove Student"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      )
    }
  ];

  const invitationColumns = [
    { 
      header: <div className="text-center">Email</div>,
      accessor: 'email',
      renderCell: (column, row) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
          {row.email}
        </div>
      )
    },
    { 
      header: <div className="text-center">Sent At</div>,
      accessor: 'created_at',
      renderCell: (column, row) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
          {new Date(row.created_at).toLocaleString()}
        </div>
      )
    },
    { 
      header: <div className="text-center">Expires At</div>,
      accessor: 'expires_at',
      renderCell: (column, row) => (
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faClock} className="me-2 text-muted" />
          {new Date(row.expires_at).toLocaleString()}
        </div>
      )
    },
    { 
      header: <div className="text-center">Status</div>,
      accessor: 'status',
      renderCell: (column, row) => (
        <span className={`badge ${row.status === 'expired' ? 'bg-danger' : 'bg-warning'}`}>
          {row.status === 'expired' ? 'Expired' : 'Pending'}
        </span>
      )
    },
    {
      header: <div className="text-center">Actions</div>,
      accessor: 'actions',
      renderCell: (column, row) => (
        <div className="d-flex gap-2 justify-content-center">
          {row.status !== 'expired' && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelInvitation(row.id, 'pending');
              }}
              title="Cancel Invitation"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2 className="mb-0">
            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
            Student Management
          </h2>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            icon={<FontAwesomeIcon icon={faPlus} />}
          >
            Invite Student
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <FontAwesomeIcon icon={faExclamationCircle} className="me-2" />
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                  Pending Invitations
                </h5>
              </div>
              <div className="card-body pt-0">
                <Table
                  columns={invitationColumns}
                  data={pendingInvitations}
                  emptyMessage="No pending invitations"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                Student List
              </h5>
            </div>
            <div className="card-body pt-0">
              {loading ? (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Loading...
                </div>
              ) : (
                <Table
                  columns={studentColumns}
                  data={students}
                  emptyMessage="No students found"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Invite New Student{isBulkMode || isCsvMode ? 's' : ''}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setIsBulkMode(false);
                    setIsCsvMode(false);
                    setBulkEmails('');
                    setCsvFile(null);
                  }}
                  disabled={inviting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="invite-modes mb-4">
                  <div className="d-flex gap-3">
                    <button
                      className={`btn ${!isBulkMode && !isCsvMode ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                      onClick={() => {
                        setIsBulkMode(false);
                        setIsCsvMode(false);
                      }}
                      disabled={inviting}
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Single Invite
                    </button>
                    <button
                      className={`btn ${isBulkMode ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                      onClick={() => {
                        setIsBulkMode(true);
                        setIsCsvMode(false);
                      }}
                      disabled={inviting}
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Bulk Emails
                    </button>
                    <button
                      className={`btn ${isCsvMode ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                      onClick={() => {
                        setIsCsvMode(true);
                        setIsBulkMode(false);
                      }}
                      disabled={inviting}
                    >
                      <FontAwesomeIcon icon={faFileUpload} className="me-2" />
                      CSV Upload
                    </button>
                  </div>
                </div>

                {isCsvMode ? (
                  <div className="csv-upload-section">
                    <div className="upload-area p-4 border rounded-3 text-center mb-3">
                      <input
                        type="file"
                        className="d-none"
                        id="csvFileInput"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={inviting}
                      />
                      <label
                        htmlFor="csvFileInput"
                        className="d-flex flex-column align-items-center cursor-pointer"
                        style={{ cursor: 'pointer' }}
                      >
                        <FontAwesomeIcon icon={faFileUpload} size="2x" className="text-primary mb-2" />
                        <span className="fw-bold">Click to upload CSV file</span>
                        <small className="text-muted">or drag and drop</small>
                      </label>
                    </div>
                    {csvFile && (
                      <div className="selected-file p-2 bg-light rounded-3 d-flex align-items-center justify-content-between">
                        <div>
                          <FontAwesomeIcon icon={faFileCsv} className="text-primary me-2" />
                          {csvFile.name}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setCsvFile(null)}
                          disabled={inviting}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )}
                    <div className="mt-3">
                      <a href="/sample_students.csv" download className="text-decoration-none">
                        <FontAwesomeIcon icon={faDownload} className="me-1" />
                        Download sample CSV template
                      </a>
                    </div>
                  </div>
                ) : isBulkMode ? (
                  <div className="bulk-email-section">
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        id="bulkEmails"
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        disabled={inviting}
                        placeholder="Enter email addresses (one per line or comma-separated)"
                        style={{ height: '150px' }}
                      />
                      <label htmlFor="bulkEmails">Email Addresses</label>
                    </div>
                    <div className="alert alert-info">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                      Enter multiple email addresses, separated by commas or new lines
                    </div>
                  </div>
                ) : (
                  <div className="single-email-section">
                    <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                        id="singleEmail"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    disabled={inviting}
                    placeholder="Enter student's email"
                  />
                      <label htmlFor="singleEmail">Email Address</label>
                    </div>
                </div>
                )}
              </div>
              <div className="modal-footer border-top-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    setShowAddModal(false);
                    setIsBulkMode(false);
                    setIsCsvMode(false);
                    setBulkEmails('');
                    setCsvFile(null);
                  }}
                  disabled={inviting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleInviteStudent}
                  disabled={inviting}
                >
                  {inviting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      Sending Invitation{isBulkMode || isCsvMode ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                      Send Invitation{isBulkMode || isCsvMode ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 