import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Student from './Student';
import Mentor from './Mentor';
import Admin from './Admin';
import Evaluator from './Evaluator';
import GradingResult from './GradingResult';
import UploadAnswer from './uploadAnser';
import './GradeMaster.css';
import { authService } from "../Authentication/authService";

const GradeMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRoles, setSelectedRoles] = useState({
    student: false,
    mentor: false,
    qp_uploader: false,
    evaluator: false
  });
  const [isRoleSelectionMode, setIsRoleSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAddRoleButton, setShowAddRoleButton] = useState(false);

  // Check if the user is logged in by looking at local storage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = authService.getCurrentUser();
  const activeRole = localStorage.getItem('activeRole');

  // Use state for userData
  const [userData, setUserData] = useState({
    id: user?.id,
    email: user?.email,
    role: activeRole,
    is_student: user?.is_student,
    is_evaluator: user?.is_evaluator,
    is_qp_uploader: user?.is_qp_uploader,
    is_mentor: user?.is_mentor,
    is_qp_uploader_allowed: user?.is_qp_uploader_allowed ?? user?.is_allowed, // fallback for backward compatibility
    is_evaluator_allowed: user?.is_evaluator_allowed ?? user?.is_allowed, // fallback for backward compatibility
    is_profile_completed: user?.is_profile_completed,
  });

  // Check if user has all roles
  const hasAllRoles = userData.is_student && userData.is_mentor && userData.is_qp_uploader && userData.is_evaluator;

  // Handle logout or getting started
  const handleGetStarted = () => {
    navigate('/authenticate');
  };

  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/authenticate');
      return;
    }
  }, [isLoggedIn, navigate]);

  // Handle role selection toggle
  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  // Add state for active role selection
  const [selectedActiveRole, setSelectedActiveRole] = useState('');

  // Update selectedActiveRole whenever selectedRoles changes
  useEffect(() => {
    const selected = Object.keys(selectedRoles).filter(r => selectedRoles[r]);
    if (selected.length > 0) {
      setSelectedActiveRole(selected[0]);
    } else {
      setSelectedActiveRole('');
    }
  }, [selectedRoles]);

  // Submit selected roles to backend
  const handleRoleSubmission = async () => {
    let selected = Object.keys(selectedRoles).filter(r => selectedRoles[r]);
    // Ensure active role is in selected
    let activeRoleToSend = selectedActiveRole;
    if (!selected.includes(selectedActiveRole)) {
      activeRoleToSend = selected[0] || '';
      setSelectedActiveRole(activeRoleToSend);
    }
    if (selected.length === 0) {
      setError('Please select at least one role');
      return;
    }
    if (!activeRoleToSend || !selectedRoles[activeRoleToSend]) {
      setError('Please select an active role from the selected roles');
      return;
    }
    setLoading(true);
    setError('');
    // Debug log
    console.log('Submitting roles:', { user_id: userData.id, roles: selected, active_role: activeRoleToSend });
    try {
      const response = await fetch('http://127.0.0.1:8000/api/update-user-roles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userData.id,
          roles: selected, // send as array
          active_role: activeRoleToSend
        })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('activeRole', activeRoleToSend);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUserData({
          id: data.user?.id,
          email: data.user?.email,
          role: activeRoleToSend,
          is_student: data.user?.is_student,
          is_evaluator: data.user?.is_evaluator,
          is_qp_uploader: data.user?.is_qp_uploader,
          is_mentor: data.user?.is_mentor,
          is_qp_uploader_allowed: data.user?.is_qp_uploader_allowed ?? data.user?.is_allowed,
          is_evaluator_allowed: data.user?.is_evaluator_allowed ?? data.user?.is_allowed,
          is_profile_completed: data.user?.is_profile_completed,
        });
        setIsRoleSelectionMode(false);
        setInitialLoad(false);
        navigate('/grade-master');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update roles');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new roles
  const handleAddRoles = async () => {
    setIsRoleSelectionMode(true);
    setSelectedRoles({
      student: userData.is_student,
      mentor: userData.is_mentor,
      qp_uploader: userData.is_qp_uploader,
      evaluator: userData.is_evaluator
    });
  };

  // Handle adding new roles submission
  const handleAddRolesSubmission = handleRoleSubmission;

  // Handle role navigation
  const handleRoleNavigation = async (role) => {
    if (!userData[`is_${role}`]) {
      setError(`You don't have access to ${role} role`);
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/update-active-role/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userData.id,
          active_role: role
        })
      });
      if (response.ok) {
        localStorage.setItem('activeRole', role);
        switch (role) {
          case 'student':
            navigate('/grade-master/student');
            break;
          case 'mentor':
            navigate('/grade-master/mentor');
            break;
          case 'qp_uploader':
            if (!userData.is_qp_uploader_allowed) {
              navigate("/grade-master/role-completion");
            } else {
              navigate('/grade-master/qp_uploader');
            }
            break;
          case 'evaluator':
            if (!userData.is_evaluator_allowed) {
              navigate("/grade-master/role-completion");
            } else {
              navigate('/grade-master/evaluator');
            }
            break;
          default:
            console.log('Unexpected role received.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update active role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  // Handle initial routing logic
  useEffect(() => {
    if (isLoggedIn && initialLoad) {
      if (!userData.is_student && !userData.is_mentor && !userData.is_qp_uploader && !userData.is_evaluator) {
        setIsRoleSelectionMode(true);
      } else {
        setShowAddRoleButton(!hasAllRoles);
        const isOnRoleRoute = location.pathname !== '/grade-master' && 
                             location.pathname !== '/grade-master/';
        if (activeRole && !isOnRoleRoute && location.pathname === '/grade-master') {
          switch (activeRole) {
            case 'student':
              navigate('/grade-master/student');
              break;
            case 'mentor':
              navigate('/grade-master/mentor');
              break;
            case "qp_uploader":
              if (!userData.is_qp_uploader_allowed) {
                navigate("/grade-master/role-completion");
              } else {
                navigate('/grade-master/qp_uploader');
              }
              break;
            case "evaluator":
              if (!userData.is_evaluator_allowed) {
                navigate("/grade-master/role-completion");
              } else {
                navigate('/grade-master/evaluator');
              }
              break;
            default:
              console.log('Unexpected role received.');
          }
        }
      }
      setInitialLoad(false);
    }
  }, [isLoggedIn, userData, activeRole, navigate, userData.is_qp_uploader_allowed, userData.is_evaluator_allowed, initialLoad, location.pathname, hasAllRoles]);

  // Role selection component
  const RoleSelectionComponent = () => {
    const availableRoles = [
      { key: 'student', label: 'Student', description: 'Take tests, give feedback, get results' },
      { key: 'mentor', label: 'Mentor', description: 'View student details, monitor performance' },
      { key: 'qp_uploader', label: 'Admin', description: 'Upload question papers' },
      { key: 'evaluator', label: 'Evaluator', description: 'Download answer sheets, update marks' }
    ];
    const selected = Object.keys(selectedRoles).filter(r => selectedRoles[r]);
    return (
      <div className="role-selection-container">
        <h2>{showAddRoleButton ? 'Add More Roles' : 'Select Your Roles'}</h2>
        <p>{showAddRoleButton ? 'Select additional roles you want to have access to:' : 'Choose the roles you want to have access to:'}</p>
        {error && <div className="error-message">{error}</div>}
        <div className="role-selection-grid">
          {availableRoles.map(role => (
            <div key={role.key} className={`role-card ${selectedRoles[role.key] ? 'selected' : ''}`}>
              <input
                type="checkbox"
                id={role.key}
                checked={selectedRoles[role.key]}
                onChange={() => handleRoleToggle(role.key)}
              />
              <label htmlFor={role.key}>
                <h3>{role.label}</h3>
                <p>{role.description}</p>
              </label>
            </div>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="active-role-select">
            <label htmlFor="activeRoleSelect">Select Active Role:</label>
            <select
              id="activeRoleSelect"
              value={selectedActiveRole}
              onChange={e => setSelectedActiveRole(e.target.value)}
            >
              {selected.map(roleKey => (
                <option key={roleKey} value={roleKey}>{availableRoles.find(r => r.key === roleKey)?.label || roleKey}</option>
              ))}
            </select>
          </div>
        )}
        <button 
          onClick={showAddRoleButton ? handleAddRolesSubmission : handleRoleSubmission}
          disabled={loading || !Object.values(selectedRoles).some(Boolean)}
          className="submit-roles-button"
        >
          {loading ? 'Updating...' : (showAddRoleButton ? 'Add Selected Roles' : 'Continue with Selected Roles')}
        </button>
      </div>
    );
  };

  // Main dashboard with role navigation
  const MainDashboard = () => (
    <div className="roles-section">
      <h2>Welcome to GradeMaster</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="actions-container">
        {!userData.is_profile_completed && (
          <button 
            onClick={() => navigate('/grade-master/profileSection')}
            className="action-button"
          >
            Complete Your Profile
          </button>
        )}
        {showAddRoleButton && (
          <button 
            onClick={handleAddRoles}
            className="action-button"
          >
            Add More Roles
          </button>
        )}
      </div>
      <p>Select a role to continue:</p>
      <div className="roles">
        {userData.is_student && (
          <div className="role" onClick={() => handleRoleNavigation('student')}>
            <h3>Student</h3>
            <ul>
              <li>Take tests</li>
              <li>Give feedback on question papers</li>
              <li>Get results and feedback</li>
            </ul>
          </div>
        )}
        {userData.is_evaluator && (
          <div className="role" onClick={() => handleRoleNavigation('evaluator')}>
            <h3>Evaluator</h3>
            <ul>
              <li>Download answer sheets</li>
              <li>Update marks</li>
              <li>Provide feedback</li>
            </ul>
          </div>
        )}
        {userData.is_qp_uploader && (
          <div className="role" onClick={() => handleRoleNavigation('qp_uploader')}>
            <h3>Qp Uploader</h3>
            <ul>
              <li>Upload question papers</li>
            </ul>
          </div>
        )}
        {userData.is_mentor && (
          <div className="role" onClick={() => handleRoleNavigation('mentor')}>
            <h3>Mentor</h3>
            <ul>
              <li>View student details</li>
              <li>Monitor student performance</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grade-master-container">
      <h1 className="grade-master-title">GradeMaster</h1>
      {isRoleSelectionMode ? (
        <RoleSelectionComponent />
      ) : (
        <Routes>
          <Route path="/" element={<MainDashboard />} />
          <Route path="/student" element={<Student />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/qp_uploader" element={<Admin />} />
          <Route path="/evaluator" element={<Evaluator />} />
          <Route path="/grading-result" element={<GradingResult />} />
          <Route path="/upload-answer" element={<UploadAnswer />} />
        </Routes>
      )}
    </div>
  );
};

export default GradeMaster;