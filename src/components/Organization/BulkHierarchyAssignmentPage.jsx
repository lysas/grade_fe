import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faLayerGroup,
    faUser,
    faSpinner,
    faCheck,
    faInfoCircle,
    faArrowLeft,
    faHome,
    faDotCircle
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common';

const BulkHierarchyAssignmentPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [hierarchyValues, setHierarchyValues] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkHierarchyValues, setBulkHierarchyValues] = useState({});
  const [assigning, setAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tree, setTree] = useState([]);
  const [selectedPath, setSelectedPath] = useState({});

  useEffect(() => {
    fetchTree();
    fetchStudents();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/organization/hierarchy-levels/tree/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data && response.data.status === 'success') {
        setTree(response.data.data);
      } else {
        toast.error('Failed to fetch hierarchy tree');
      }
    } catch (err) {
      toast.error('Failed to fetch hierarchy tree');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/organization/students/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setStudents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  const fetchHierarchyLevels = async () => {
    try {
      const response = await axios.get('/api/organization/hierarchy-levels/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data) {
        setHierarchyLevels(response.data);
      }
    } catch (error) {
      console.error('Error fetching hierarchy levels:', error);
      throw error;
    }
  };

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
            if (response.data && response.data.data) {
              allValues[level.id] = response.data.data;
            }
          } catch (err) {
            console.error(`Error fetching values for level ${level.id}:`, err);
          }
        }
        setHierarchyValues(allValues);
      };
      fetchAllValues();
    }
  }, [hierarchyLevels]);

  const handleStudentSelection = (studentId, isSelected) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  const handleBulkHierarchyValueSelect = (levelId, valueId, order) => {
    if (valueId) {
      // Clear any existing selections for this order level
      const levelsInOrder = hierarchyLevels.filter(level => level.id === levelId);
      const clearedValues = { ...bulkHierarchyValues };
      levelsInOrder.forEach(level => {
        if (level.id !== levelId) {
          delete clearedValues[level.id];
        }
      });
      
      setBulkHierarchyValues({
        ...clearedValues,
        [levelId]: valueId
      });
    } else {
      // Clear this selection
      const newValues = { ...bulkHierarchyValues };
      delete newValues[levelId];
      setBulkHierarchyValues(newValues);
    }
  };

  // Auto-select single levels when they have values
  useEffect(() => {
    const newSelectedLevels = { ...bulkHierarchyValues };
    
    hierarchyLevels.forEach(level => {
      if (level.values && level.values.length > 0) {
        // Auto-select single level if it has a value
        const value = level.values[0];
        if (value.id && !newSelectedLevels[level.id]) {
          newSelectedLevels[level.id] = value.id;
          console.log(`Auto-selecting level ${level.name} for value ${value.value}`);
        }
      }
    });
    
    if (JSON.stringify(newSelectedLevels) !== JSON.stringify(bulkHierarchyValues)) {
      setBulkHierarchyValues(newSelectedLevels);
    }
  }, [bulkHierarchyValues, hierarchyLevels]);

  const handleBulkAssignHierarchy = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    const valueIds = Object.values(selectedPath).filter(Boolean);
    if (valueIds.length === 0) {
      toast.error('Please select at least one hierarchy value');
      return;
    }
    try {
      setAssigning(true);
      let successCount = 0;
      let failureCount = 0;
      for (const studentId of selectedStudents) {
        try {
          const response = await axios.post(
            '/api/organization/student-hierarchies/bulk_assign/',
            {
              student_id: studentId,
              hierarchy_values: valueIds
            },
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
          console.error(`Error assigning hierarchy to student ${studentId}:`, error);
        }
      }
      if (successCount > 0) {
        toast.success(`Successfully assigned hierarchy to ${successCount} student(s)`);
      }
      if (failureCount > 0) {
        toast.error(`Failed to assign hierarchy to ${failureCount} student(s)`);
      }
      navigate('/organization/students');
    } catch (error) {
      console.error('Error in bulk hierarchy assignment:', error);
      toast.error('Failed to assign hierarchy values');
    } finally {
      setAssigning(false);
    }
  };

  // Add this function before the renderTreeForPathSelection
  const handleValueSelection = (levelId, valueId) => {
    setSelectedPath(prev => {
      const newPath = { ...prev };
      if (newPath[levelId] === valueId) {
        delete newPath[levelId];
      } else {
        newPath[levelId] = valueId;
      }
      return newPath;
    });
  };

  // Update the renderTreeForPathSelection function's radio button section
  const renderTreeForPathSelection = (nodes, depth = 0) => (
    nodes.map(level => (
      <div key={level.id} style={{ marginLeft: depth * 24 }} className="bh-tree-node">
        <div className="bh-tree-row">
          <FontAwesomeIcon icon={faLayerGroup} className="bh-folder-icon" />
          <span className="bh-level-name">{level.name}</span>
        </div>
        {/* Values (files) */}
        {level.values && level.values.length > 0 && (
          <div className="bh-values-list">
            {level.values.map(value => (
              <div key={value.id} className="form-check bh-value-row" style={{ marginLeft: 24 }}>
                <input
                  type="radio"
                  className="form-check-input"
                  id={`value-${level.id}-${value.id}`}
                  name={`level-${level.id}`}
                  checked={selectedPath[level.id] === value.id}
                  onChange={() => handleValueSelection(level.id, value.id)}
                />
                <label className="form-check-label" htmlFor={`value-${level.id}-${value.id}`}>
                  <FontAwesomeIcon icon={faDotCircle} className="bh-file-icon" /> {value.value}
                  {value.description && <span className="bh-value-desc"> - {value.description}</span>}
                </label>
              </div>
            ))}
          </div>
        )}
        {/* Children (subfolders) */}
        {level.children && level.children.length > 0 && (
          <div className="bh-children-list">
            {renderTreeForPathSelection(level.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  );

  // Add this helper function before the return statement
  const findValueInTree = (tree, valueId) => {
    for (const level of tree) {
      // Check values in current level
      if (level.values) {
        const found = level.values.find(v => v.id === valueId);
        if (found) {
          return { value: found, level: level };
        }
      }
      // Check in children
      if (level.children) {
        const found = findValueInTree(level.children, valueId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center py-5">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-primary mb-3" />
          <h5>Loading...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h2 className="mb-0">
                <FontAwesomeIcon icon={faLayerGroup} className="me-2 text-primary" />
                Bulk Assign Hierarchy
              </h2>
            </div>
            <button
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate('/organization/students')}
                disabled={assigning}
              ><FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Hierarchy Selection Panel */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faLayerGroup} className="me-2 text-primary" />
                Select Hierarchy Values
              </h5>
            </div>
            <div className="card-body">
              {tree.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faLayerGroup} size="2x" className="mb-2" />
                  <p>No hierarchy levels available</p>
                </div>
              ) : (
                <div className="hierarchy-selection-tree">
                  {renderTreeForPathSelection(tree)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Selection Panel */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                  Select Students ({selectedStudents.length} selected)
                </h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleSelectAllStudents}
                  disabled={assigning}
                >
                  {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {/* Search box */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  disabled={assigning}
                />
              </div>
              {students.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faUser} size="2x" className="mb-2" />
                  <p>No students available</p>
                </div>
              ) : (
                <div className="student-list">
                  {students
                    .filter(student => {
                      const q = searchQuery.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        student.username.toLowerCase().includes(q) ||
                        student.email.toLowerCase().includes(q)
                      );
                    })
                    .map(student => (
                      <div key={student.id} className="form-check mb-3 p-3 border rounded">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                          disabled={assigning}
                        />
                        <label className="form-check-label w-100" htmlFor={`student-${student.id}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{student.username}</strong>
                              <br />
                              <small className="text-muted">{student.email}</small>
                            </div>
                            <span className={`badge ${student.is_active ? 'bg-success' : 'bg-danger'}`}>
                              {student.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {selectedStudents.length > 0 && Object.values(selectedPath).filter(Boolean).length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2 " />
                  Assignment Preview
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Students to assign:</strong> {selectedStudents.length}
                    </p>
                    <div className="selected-students-preview" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {students
                        .filter(student => selectedStudents.includes(student.id))
                        .slice(0, 8)
                        .map(student => (
                          <small key={student.id} className="d-block text-muted mb-1">
                            {student.username} ({student.email})
                          </small>
                        ))}
                      {selectedStudents.length > 8 && (
                        <small className="text-muted">
                          ... and {selectedStudents.length - 8} more
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2">
                      <strong>Selected Hierarchy:</strong>
                    </p>
                    {Object.entries(selectedPath).map(([levelId, valueId]) => {
                      if (!valueId) return null;
                      const found = findValueInTree(tree, valueId);
                      if (found) {
                        return (
                          <div key={valueId} className="d-block mb-2">
                            <small className="text-primary d-block">{found.level.name}:</small>
                            <small className="text-muted d-block ps-3">
                              <FontAwesomeIcon icon={faDotCircle} className="me-2" />
                              {found.value.value}
                              {found.value.description && (
                                <span className="text-muted"> - {found.value.description}</span>
                              )}
                            </small>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-light"
              onClick={() => navigate('/organization/students')}
              disabled={assigning}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleBulkAssignHierarchy}
              disabled={
                selectedStudents.length === 0 ||
                Object.values(selectedPath).filter(Boolean).length === 0 ||
                assigning
              }
            >
              {assigning ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                  Assigning to {selectedStudents.length} student(s)...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Assign to {selectedStudents.length} Student(s)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkHierarchyAssignmentPage; 