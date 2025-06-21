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
    faHome
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

  // Group hierarchy levels by order
  const groupedLevels = hierarchyLevels.reduce((groups, level) => {
    const order = level.order;
    if (!groups[order]) {
      groups[order] = [];
    }
    groups[order].push(level);
    return groups;
  }, {});

  // Get sorted order keys
  const sortedOrderKeys = Object.keys(groupedLevels).sort((a, b) => parseInt(a) - parseInt(b));

  // Track selected level per order (only one level per order can be selected)
  const [selectedLevelsPerOrder, setSelectedLevelsPerOrder] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStudents(),
        fetchHierarchyLevels()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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
      const levelsInOrder = groupedLevels[order];
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
      
      setSelectedLevelsPerOrder(prev => ({
        ...prev,
        [order]: levelId
      }));
    } else {
      // Clear this selection
      const newValues = { ...bulkHierarchyValues };
      delete newValues[levelId];
      setBulkHierarchyValues(newValues);
      
      setSelectedLevelsPerOrder(prev => {
        const newSelected = { ...prev };
        delete newSelected[order];
        return newSelected;
      });
    }
  };

  // Auto-select single levels when they have values
  useEffect(() => {
    const newSelectedLevels = { ...selectedLevelsPerOrder };
    
    sortedOrderKeys.forEach(order => {
      const levels = groupedLevels[order];
      if (levels.length === 1) {
        // Auto-select single level if it has a value
        const level = levels[0];
        if (bulkHierarchyValues[level.id] && !newSelectedLevels[order]) {
          newSelectedLevels[order] = level.id;
          console.log(`Auto-selecting level ${level.name} for order ${order}`);
        }
      }
    });
    
    if (JSON.stringify(newSelectedLevels) !== JSON.stringify(selectedLevelsPerOrder)) {
      setSelectedLevelsPerOrder(newSelectedLevels);
    }
  }, [bulkHierarchyValues, sortedOrderKeys, groupedLevels, selectedLevelsPerOrder]);

  const handleBulkAssignHierarchy = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    // Validate that exactly one level is selected for each order
    const hasSelectionForEachOrder = sortedOrderKeys.every(order => {
      const levels = groupedLevels[order];
      // Check if any level in this order has a value selected
      return levels.some(level => bulkHierarchyValues[level.id]);
    });

    if (!hasSelectionForEachOrder) {
      toast.error('Please select one level for each hierarchy level');
      return;
    }

    try {
      setAssigning(true);
      let successCount = 0;
      let failureCount = 0;

      // Get all selected hierarchy values
      const selectedHierarchyValues = Object.values(bulkHierarchyValues).filter(value => value);

      // Assign hierarchy to each selected student
      for (const studentId of selectedStudents) {
        try {
          const response = await axios.post(
            '/api/organization/student-hierarchies/bulk_assign/',
            {
              student_id: studentId,
              hierarchy_values: selectedHierarchyValues
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

      // Navigate back to student management
      navigate('/organization/students');
    } catch (error) {
      console.error('Error in bulk hierarchy assignment:', error);
      toast.error('Failed to assign hierarchy values');
    } finally {
      setAssigning(false);
    }
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
              {hierarchyLevels.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faLayerGroup} size="2x" className="mb-2" />
                  <p>No hierarchy levels available</p>
                </div>
              ) : (
                <div className="hierarchy-selection">
                  {sortedOrderKeys.map(order => {
                    const levels = groupedLevels[order];
                    const hasMultipleLevels = levels.length > 1;
                    
                    return (
                      <div key={order} className="mb-4">
                        <label className="form-label fw-bold">Level {order}</label>
                        <div className="row">
                          {levels.map(level => {
                            const levelValues = hierarchyValues[level.id] || [];
                            const isSelected = selectedLevelsPerOrder[order] === level.id;
                            
                            // If only one level in this order, show dropdown directly
                            if (!hasMultipleLevels) {
                              return (
                                <div key={level.id} className="col-md-6 mb-2">
                                  <label className="form-label text-muted small">{level.name}</label>
                                  <select
                                    className="form-select"
                                    value={bulkHierarchyValues[level.id] || ''}
                                    onChange={(e) => handleBulkHierarchyValueSelect(level.id, e.target.value, order)}
                                    disabled={assigning}
                                  >
                                    <option value="">Select {level.name}</option>
                                    {levelValues.map(value => (
                                      <option key={value.id} value={value.id}>
                                        {value.value}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }
                            
                            // If multiple levels, show radio buttons
                            return (
                              <div key={level.id} className="col-md-6 mb-2">
                                <div className="form-check">
                                  <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`level-${level.id}`}
                                    name={`order-${order}`}
                                    checked={isSelected}
                                    onChange={() => {
                                      if (!isSelected) {
                                        // If this level is not selected, select it with the first value
                                        const firstValue = levelValues[0]?.id;
                                        if (firstValue) {
                                          handleBulkHierarchyValueSelect(level.id, firstValue, order);
                                        }
                                      }
                                    }}
                                    disabled={assigning}
                                  />
                                  <label className="form-check-label" htmlFor={`level-${level.id}`}>
                                    <strong>{level.name}</strong>
                                  </label>
                                </div>
                                {isSelected && (
                                  <select
                                    className="form-select mt-2"
                                    value={bulkHierarchyValues[level.id] || ''}
                                    onChange={(e) => handleBulkHierarchyValueSelect(level.id, e.target.value, order)}
                                    disabled={assigning}
                                  >
                                    <option value="">Select {level.name}</option>
                                    {levelValues.map(value => (
                                      <option key={value.id} value={value.id}>
                                        {value.value}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
      {selectedStudents.length > 0 && sortedOrderKeys.every(order => {
        const levels = groupedLevels[order];
        // Check if any level in this order has a value selected
        return levels.some(level => bulkHierarchyValues[level.id]);
      }) && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
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
                      <strong>Hierarchy values:</strong>
                    </p>
                    {sortedOrderKeys.map(order => {
                      const selectedLevelId = selectedLevelsPerOrder[order];
                      const selectedValueId = selectedLevelId ? bulkHierarchyValues[selectedLevelId] : null;
                      
                      if (selectedLevelId && selectedValueId) {
                        const selectedLevel = hierarchyLevels.find(level => level.id === selectedLevelId);
                        const selectedValue = hierarchyValues[selectedLevelId]?.find(
                          v => v.id == selectedValueId // Use == for type coercion since valueId might be string or number
                        );
                        
                        if (selectedLevel && selectedValue) {
                          return (
                            <small key={order} className="d-block text-muted mb-1">
                              <strong>Level {order}:</strong> {selectedLevel.name} - {selectedValue.value}
                            </small>
                          );
                        }
                      }
                      
                      return (
                        <small key={order} className="d-block text-muted mb-1">
                          <strong>Level {order}:</strong> Not selected
                        </small>
                      );
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
                !sortedOrderKeys.every(order => {
                  const levels = groupedLevels[order];
                  // Check if any level in this order has a value selected
                  return levels.some(level => bulkHierarchyValues[level.id]);
                }) ||
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