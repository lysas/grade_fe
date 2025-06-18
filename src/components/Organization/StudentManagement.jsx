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
    faExclamationCircle,
    faLayerGroup,
    faArrowRight,
    faCheck,
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import Table from '../GradeMaster/common/Table';
import { Button } from '../common';
import './StudentManagement.css';
import { useNavigate } from 'react-router-dom';

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
  const [showHierarchyModal, setShowHierarchyModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [hierarchyValues, setHierarchyValues] = useState({});
  const [selectedValues, setSelectedValues] = useState({});
  const [assigningHierarchy, setAssigningHierarchy] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [studentHierarchies, setStudentHierarchies] = useState({});
  const [showBulkAssignmentModal, setShowBulkAssignmentModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchPendingInvitations();
    fetchHierarchyLevels();
  }, []);

  // Fetch values for all levels when levels change
  useEffect(() => {
    if (hierarchyLevels.length > 0) {
      const fetchAllValues = async () => {
        const allValues = {};
        for (const level of hierarchyLevels) {
          try {
            const response = await axios.get(
              `/api/organization/hierarchy-levels/${level.id}/values/`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
            console.log(`Values for level ${level.id}:`, response.data); // Debug log
            if (response.data && response.data.data) {
              allValues[level.id] = response.data.data;
            }
          } catch (err) {
            console.error(`Error fetching values for level ${level.id}:`, err);
          }
        }
        console.log('All hierarchy values:', allValues); // Debug log
        setHierarchyValues(allValues);
      };
      fetchAllValues();
    }
  }, [hierarchyLevels]);

  const fetchStudentHierarchies = async (studentId) => {
    try {
      const response = await axios.get(`/api/organization/student-hierarchies/student_hierarchies/?student_id=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setStudentHierarchies(prev => ({
          ...prev,
          [studentId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error fetching student hierarchies:', error);
    }
  };

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
        // Fetch hierarchies for each student
        response.data.data.forEach(student => {
          fetchStudentHierarchies(student.id);
        });
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
        // Check for expired invitations
        const currentTime = new Date();
        const expiredInvitations = response.data.data.filter(invitation => 
          new Date(invitation.expires_at) < currentTime
        );
        
        // Cancel expired invitations
        for (const invitation of expiredInvitations) {
          try {
            await handleCancelInvitation(invitation.id, 'pending');
          } catch (error) {
            console.error('Error canceling expired invitation:', error);
          }
        }
        
        // Update the pending invitations list
        setPendingInvitations(response.data.data.filter(invitation => 
          new Date(invitation.expires_at) >= currentTime
        ));
      }
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
    }
  };

  // Add useEffect to periodically check for expired invitations
  useEffect(() => {
    const checkExpiredInvitations = () => {
      const currentTime = new Date();
      const expiredInvitations = pendingInvitations.filter(invitation => 
        new Date(invitation.expires_at) < currentTime
      );
      
      if (expiredInvitations.length > 0) {
        fetchPendingInvitations(); // Refresh the list
      }
    };

    // Check every minute
    const intervalId = setInterval(checkExpiredInvitations, 60000);
    
    return () => clearInterval(intervalId);
  }, [pendingInvitations]);

  const fetchHierarchyLevels = async () => {
    try {
      const response = await axios.get('/api/organization/hierarchy-levels/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Hierarchy levels response:', response.data); // Debug log
      if (response.data) {
        setHierarchyLevels(response.data);
      }
    } catch (error) {
      console.error('Error fetching hierarchy levels:', error);
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

  const handleHierarchyValueSelect = (levelId, valueId) => {
    setSelectedValues(prev => ({
      ...prev,
      [levelId]: valueId
    }));
  };

  const handleAssignHierarchy = async () => {
    if (!selectedStudent) return;

    // Validate that all hierarchy levels have a selected value
    if (Object.keys(selectedValues).length !== hierarchyLevels.length) {
      toast.error('Please select a value for each hierarchy level');
      return;
    }

    try {
      setAssigningHierarchy(true);
      const response = await axios.post(
        '/api/organization/student-hierarchies/bulk_assign/',
        {
          student_id: selectedStudent.id,
          hierarchy_values: Object.values(selectedValues)  // Send just the array of value IDs
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'success') {
        toast.success('Hierarchy values assigned successfully!');
        setShowHierarchyModal(false);
        setSelectedStudent(null);
        setSelectedValues({});
        fetchStudents(); // Refresh student list to show updated hierarchies
      } else {
        toast.error(response.data.message || 'Failed to assign hierarchy values');
      }
    } catch (error) {
      console.error('Error assigning hierarchy values:', error);
      toast.error(error.response?.data?.message || 'Failed to assign hierarchy values');
    } finally {
      setAssigningHierarchy(false);
    }
  };

  const openHierarchyModal = (student) => {
    setSelectedStudent(student);
    setSelectedValues({});
    setCurrentStep(0);
    setShowHierarchyModal(true);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps() - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalSteps = () => hierarchyLevels.length + 2; // +2 for student selection and confirmation

  const renderStepIndicator = () => {
    const steps = [
      { title: 'Select Student' },
      ...hierarchyLevels.map(level => ({ title: level.name })),
      { title: 'Confirm' }
    ];

    return (
      <div className="step-indicator mb-4">
        <div className="d-flex justify-content-between align-items-center">
          {steps.map((step, index) => (
            <div key={index} className="d-flex flex-column align-items-center">
              <div className={`step-circle ${currentStep >= index ? 'active' : ''}`}>
                {currentStep > index ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  index + 1
                )}
              </div>
              <div className="step-label mt-2 text-center" style={{ fontSize: '0.8rem', maxWidth: '80px' }}>
                {step.title}
              </div>
            </div>
          ))}
        </div>
        <div className="progress mt-2" style={{ height: '2px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${(currentStep / (totalSteps() - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      // Student Selection Step
      return (
        <div className="text-center p-4">
          <h5 className="mb-4">Confirm Student Selection</h5>
          <div className="student-info p-4 bg-light rounded">
            <FontAwesomeIcon icon={faUser} size="2x" className="text-primary mb-3" />
            <h6>{selectedStudent.username}</h6>
            <p className="text-muted mb-0">{selectedStudent.email}</p>
          </div>
        </div>
      );
    } else if (currentStep === totalSteps() - 1) {
      // Final Confirmation Step
      return (
        <div>
          <h5 className="mb-4">Review Assignment</h5>
          <div className="review-section">
            <div className="student-info mb-4 p-3 bg-light rounded">
              <h6 className="mb-2">Student</h6>
              <p className="mb-0">{selectedStudent.username} ({selectedStudent.email})</p>
            </div>
            <div className="selected-values">
              <h6 className="mb-3">Selected Hierarchy Values</h6>
              {hierarchyLevels.map(level => {
                const selectedValue = hierarchyValues[level.id]?.find(
                  v => v.id === selectedValues[level.id]
                );
                return (
                  <div key={level.id} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <span className="text-muted">{level.name}:</span>
                      <span className="fw-bold">{selectedValue?.value || 'Not selected'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else {
      // Hierarchy Level Selection Steps
      const currentLevel = hierarchyLevels[currentStep - 1];
      const levelValues = hierarchyValues[currentLevel?.id] || [];

      return (
        <div>
          <h5 className="mb-4">Select {currentLevel?.name}</h5>
          {levelValues.length === 0 ? (
            <div className="text-center p-4">
              <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
              Loading values...
            </div>
          ) : (
            <div className="row">
              {levelValues.map(value => (
                <div key={value.id} className="col-md-4 mb-3">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id={`value-${value.id}`}
                      name={`level-${currentLevel.id}`}
                      checked={selectedValues[currentLevel.id] === value.id}
                      onChange={() => handleHierarchyValueSelect(currentLevel.id, value.id)}
                      disabled={assigningHierarchy}
                    />
                    <label className="form-check-label" htmlFor={`value-${value.id}`}>
                      {value.value}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
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
            className={`btn ${studentHierarchies[row.id]?.length > 0 ? 'btn-outline-warning' : 'btn-outline-primary'} btn-sm`}
            onClick={(e) => {
              e.stopPropagation();
              openHierarchyModal(row);
            }}
            title={studentHierarchies[row.id]?.length > 0 ? "Edit Hierarchy" : "Assign Hierarchy"}
          >
            <FontAwesomeIcon icon={studentHierarchies[row.id]?.length > 0 ? faEdit : faLayerGroup} />
          </button>
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
          <div className="d-flex gap-2">

            <button
              className="btn btn-outline-secondary me-3"
              onClick={() => navigate('/organization/bulk-hierarchy-assignment')}
              disabled={loading || students.length === 0}
            ><FontAwesomeIcon icon={faLayerGroup} className="me-2" />
              Bulk Assign Hierarchy
            </button>
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

      {/* Hierarchy Assignment Modal */}
      {showHierarchyModal && selectedStudent && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">
                  Assign Hierarchy
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowHierarchyModal(false);
                    setSelectedStudent(null);
                    setSelectedValues({});
                    setCurrentStep(0);
                  }}
                  disabled={assigningHierarchy}
                ></button>
              </div>
              <div className="modal-body">
                {renderStepIndicator()}
                {renderStepContent()}
              </div>
              <div className="modal-footer border-top-0">
                {currentStep > 0 && (
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={handlePrevStep}
                    disabled={assigningHierarchy}
                  >
                    Back
                  </button>
                )}
                {currentStep < totalSteps() - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={handleNextStep}
                    disabled={
                      (currentStep > 0 && currentStep < totalSteps() - 1 && !selectedValues[hierarchyLevels[currentStep - 1]?.id]) ||
                      assigningHierarchy
                    }
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={handleAssignHierarchy}
                    disabled={assigningHierarchy}
                  >
                    {assigningHierarchy ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Confirm Assignment
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default StudentManagement; 