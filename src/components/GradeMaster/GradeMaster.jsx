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
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isRoleSelectionMode, setIsRoleSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [showAddRoleButton, setShowAddRoleButton] = useState(false);

  // Check if the user is logged in by looking at local storage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const user = authService.getCurrentUser();
  const activeRole = localStorage.getItem('activeRole');

  // Get user data from localStorage
  const userData = {
    id: user?.id,
    email: user?.email,
    role: activeRole,
    roles: user?.roles || [],
    is_allowed: user?.is_allowed,
    is_profile_completed: user?.is_profile_completed,
  };

  // Check if user has all roles
  const allRoles = ['student', 'mentor', 'qp_uploader', 'evaluator'];
  const hasAllRoles = allRoles.every(role => userData.roles.includes(role));

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
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // Submit selected roles to backend
  const handleRoleSubmission = async () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/update-user-roles/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userData.id,
          roles: selectedRoles,
          active_role: selectedRoles[0] // Set first selected role as active
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage with new user data
        localStorage.setItem('activeRole', selectedRoles[0]);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Exit role selection mode and show main dashboard
        setIsRoleSelectionMode(false);
        setInitialLoad(false);
        // Navigate to main dashboard instead of auto-redirecting
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
    // Pre-select roles that user already has
    setSelectedRoles(userData.roles);
  };

  // Handle adding new roles submission
  const handleAddRolesSubmission = async () => {
    if (selectedRoles.length === 0) {
      setError('Please select at least one role');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get only the newly selected roles (roles that weren't in userData.roles)
      const newRoles = selectedRoles.filter(role => !userData.roles.includes(role));
      
      // Add each new role one by one
      for (const newRole of newRoles) {
        const response = await fetch('http://127.0.0.1:8000/api/add_role/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            user_id: userData.id,
            new_role: newRole
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "Role already assigned.") {
            continue; // Skip if role is already assigned
          }
          throw new Error(errorData.error || 'Failed to add role');
        }
      }

      // Update local user data with new roles
      const updatedUser = {
        ...user,
        roles: [...userData.roles, ...newRoles]
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Exit role selection mode
      setIsRoleSelectionMode(false);
      setShowAddRoleButton(false);
      // Refresh the page to show updated roles
      window.location.reload();
    } catch (error) {
      setError(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle role navigation
  const handleRoleNavigation = async (role) => {
    // Check if user has this role
    if (!userData.roles.includes(role)) {
      setError(`You don't have access to ${role} role`);
      return;
    }

    // Update active role in backend
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
        
        // Navigate based on role
        switch (role) {
          case 'student':
            navigate('/grade-master/student');
            break;
          case 'mentor':
            navigate('/grade-master/mentor');
            break;
          case 'qp_uploader':
            if (userData.is_allowed === false || 
              userData.is_allowed === 'false' || 
              userData.is_allowed === 'False' ||
              String(userData.is_allowed).toLowerCase() === 'false') {
              navigate("/grade-master/role-completion");
            } else {
              navigate('/grade-master/qp_uploader');
            }
            break;
          case 'evaluator':
            if (userData.is_allowed === false || 
              userData.is_allowed === 'false' || 
              userData.is_allowed === 'False' ||
              String(userData.is_allowed).toLowerCase() === 'false') {
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
      // If user has no roles, show role selection
      if (!userData.roles.length) {
        setIsRoleSelectionMode(true);
      } else {
        // Check if user has all roles
        setShowAddRoleButton(!hasAllRoles);
        
        // User has roles - check if they're on a specific role route
        const isOnRoleRoute = location.pathname !== '/grade-master' && 
                             location.pathname !== '/grade-master/';
        
        // If user has active role and is on initial load to main route, redirect to that role
        if (activeRole && !isOnRoleRoute && location.pathname === '/grade-master') {
          switch (activeRole) {
            case 'student':
              navigate('/grade-master/student');
              break;
            case 'mentor':
              navigate('/grade-master/mentor');
              break;
            case "qp_uploader":
              if (userData.is_allowed === false || 
                userData.is_allowed === 'false' || 
                userData.is_allowed === 'False' ||
                String(userData.is_allowed).toLowerCase() === 'false') {
                navigate("/grade-master/role-completion");
              } else {
                navigate('/grade-master/qp_uploader');
              }
              break;
            case "evaluator":
              if (userData.is_allowed === false || 
                userData.is_allowed === 'false' || 
                userData.is_allowed === 'False' ||
                String(userData.is_allowed).toLowerCase() === 'false') {
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
  }, [isLoggedIn, userData.roles, activeRole, navigate, userData.is_allowed, initialLoad, location.pathname, hasAllRoles]);

  // Role selection component
  const RoleSelectionComponent = () => {
    // Filter out already selected roles when in add role mode
    const availableRoles = showAddRoleButton 
      ? [
          { key: 'student', label: 'Student', description: 'Take tests, give feedback, get results' },
          { key: 'mentor', label: 'Mentor', description: 'View student details, monitor performance' },
          { key: 'qp_uploader', label: 'Admin', description: 'Upload question papers' },
          { key: 'evaluator', label: 'Evaluator', description: 'Download answer sheets, update marks' }
        ].filter(role => !userData.roles.includes(role.key))
      : [
          { key: 'student', label: 'Student', description: 'Take tests, give feedback, get results' },
          { key: 'mentor', label: 'Mentor', description: 'View student details, monitor performance' },
          { key: 'qp_uploader', label: 'Admin', description: 'Upload question papers' },
          { key: 'evaluator', label: 'Evaluator', description: 'Download answer sheets, update marks' }
        ];

    return (
      <div className="role-selection-container">
        <h2>{showAddRoleButton ? 'Add More Roles' : 'Select Your Roles'}</h2>
        <p>{showAddRoleButton ? 'Select additional roles you want to have access to:' : 'Choose the roles you want to have access to:'}</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="role-selection-grid">
          {availableRoles.map(role => (
            <div key={role.key} className={`role-card ${selectedRoles.includes(role.key) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                id={role.key}
                checked={selectedRoles.includes(role.key)}
                onChange={() => handleRoleToggle(role.key)}
              />
              <label htmlFor={role.key}>
                <h3>{role.label}</h3>
                <p>{role.description}</p>
              </label>
            </div>
          ))}
        </div>
        
        <button 
          onClick={showAddRoleButton ? handleAddRolesSubmission : handleRoleSubmission}
          disabled={loading || selectedRoles.length === 0}
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
        {userData.roles.includes('student') && (
          <div className="role" onClick={() => handleRoleNavigation('student')}>
            <h3>Student</h3>
            <ul>
              <li>Take tests</li>
              <li>Give feedback on question papers</li>
              <li>Get results and feedback</li>
            </ul>
          </div>
        )}
        
        {userData.roles.includes('evaluator') && (
          <div className="role" onClick={() => handleRoleNavigation('evaluator')}>
            <h3>Evaluator</h3>
            <ul>
              <li>Download answer sheets</li>
              <li>Update marks</li>
              <li>Provide feedback</li>
            </ul>
          </div>
        )}
        
        {userData.roles.includes('qp_uploader') && (
          <div className="role" onClick={() => handleRoleNavigation('qp_uploader')}>
            <h3>Qp Uploader</h3>
            <ul>
              <li>Upload question papers</li>
            </ul>
          </div>
        )}
        
        {userData.roles.includes('mentor') && (
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