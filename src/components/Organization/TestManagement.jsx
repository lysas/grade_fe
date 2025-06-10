import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Table from '../GradeMaster/common/Table';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);

  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    start_time: '',
  });
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    text: '',
    marks: 1,
    options: [],
    correctAnswer: '',
    programmingLanguage: '',
    testCases: [],
    timeLimit: 5,
    memoryLimit: 512
  });

  const [questionEntryMode, setQuestionEntryMode] = useState('manual'); // 'manual' or 'upload'

  const questionTypes = [
    { value: 'mcq', label: 'Multiple Choice' },
    { value: 'descriptive', label: 'Descriptive' },
    { value: 'true_false', label: 'True/False' },
    { value: 'programming', label: 'Programming' },
    { value: 'fill_blank', label: 'Fill in the Blank' },
    { value: 'matching', label: 'Matching' },
    { value: 'short_answer', label: 'Short Answer' },
    { value: 'long_answer', label: 'Long Answer' }
  ];

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', token ? 'Yes' : 'No');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Configure axios defaults
  const configureAxios = () => {
    try {
      const token = getAuthToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set');
      } else {
        console.log('No token found, authorization header not set');
      }
    } catch (error) {
      console.error('Error configuring axios:', error);
    }
  };

  // Add function to fetch assigned students
  const fetchAssignedStudents = async (testId) => {
    try {
      console.log('Fetching assigned students for test:', testId);
      const response = await axios.get(`/api/organization/tests/${testId}/assigned_students/`);
      console.log('Assigned students API response:', response.data);
      
      if (response.data.status === 'success') {
        const assignedData = response.data.data || [];
        console.log('Setting assigned students:', assignedData);
        setAssignedStudents(assignedData);
      } else {
        console.log('No assigned students found or invalid response');
        setAssignedStudents([]);
      }
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      setAssignedStudents([]);
    }
  };

  // Modify the filteredStudents to handle both cases
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const displayName = student.username || '';
    const email = student.email || '';
    const searchTerm = studentSearch.toLowerCase();
    
    // If we're in assign modal, filter out assigned students
    if (showAssignModal && selectedTest) {
      console.log('Filtering students for assign modal');
      console.log('Current student being checked:', { 
        email: student.email, 
        username: student.username 
      });
      console.log('Current assigned students:', assignedStudents);
      
      // Check if student is already assigned to this test
      const isAssigned = assignedStudents.some(assigned => {
        // Log the structure of the assigned student for debugging
        console.log('Checking against assigned student:', assigned);
        
        // Check if the student's email matches any assigned student's email
        const match = assigned.student_details && student.email && 
                     assigned.student_details.email && 
                     assigned.student_details.email.toLowerCase() === student.email.toLowerCase();
        
        if (match) {
          console.log('Found assigned student:', assigned.student_details.email);
        }
        return match;
      });

      console.log('Is student assigned:', isAssigned);
      
      // Only show unassigned students that match the search
      const shouldShow = !isAssigned && (
        displayName.toLowerCase().includes(searchTerm) || 
        email.toLowerCase().includes(searchTerm)
      );
      
      console.log('Should show student:', shouldShow);
      return shouldShow;
    }
    
    // For create modal, show all students
    return displayName.toLowerCase().includes(searchTerm) || 
           email.toLowerCase().includes(searchTerm);
  });

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map(student => student.id);
    setSelectedStudents(allFilteredIds);
  };

  const handleClearAll = () => {
    setSelectedStudents([]);
  };

  // Fetch tests
  const fetchTests = async () => {
    try {
      console.log('Fetching tests...');
      setLoading(true);
      setError(null);
      configureAxios();
      const response = await axios.get('/api/organization/tests/');
      console.log('Tests response:', response.data);
      // Check if data is in response.data or response.data.data
      const testsData = response.data.data || response.data;
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Failed to fetch tests');
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch tests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      setError(null);
      configureAxios();
      const response = await axios.get('/api/organization/students/');
      console.log('Students response:', response.data);
      // Ensure we have valid data before setting state
      const studentsData = response.data.data || response.data;
      if (Array.isArray(studentsData)) {
        // Filter out any invalid student objects
        const validStudents = studentsData.filter(student => 
          student && typeof student === 'object' && 
          (student.username || student.email)
        );
        setStudents(validStudents);
      } else {
        console.error('Invalid students data format:', studentsData);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch students');
      }
      setStudents([]);
    }
  };

  useEffect(() => {
    console.log('Component mounted');
    const initialize = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.log('No token found, redirecting to login');
          toast.error('Please login to continue');
          window.location.href = '/login';
          return;
        }

        console.log('Token found, fetching data');
        await Promise.all([fetchTests(), fetchStudents()]);
        setInitialized(true);
      } catch (error) {
        console.error('Error in initialization:', error);
        setError('Failed to initialize component');
        setInitialized(true);
      }
    };

    initialize();
  }, []);

  const handleCreateTest = async () => {
    try {
      setLoading(true);
      configureAxios();
      
      // Create test first
      const response = await axios.post('/api/organization/tests/', newTest);
      console.log('Create test response:', response.data);
      
      // Get the test ID from the response
      const testId = response.data.id || response.data.data?.id;
      if (!testId) {
        throw new Error('Test ID not found in response');
      }

      // Create FormData for question paper and questions
      const formData = new FormData();
      
      if (questionEntryMode === 'upload') {
        if (questionPaper) {
          formData.append('pdf_file', questionPaper);
        }
        if (answerKey) {
          formData.append('answer_key', answerKey);
        }
      } else {
        // Add questions data for manual entry
        if (questions.length > 0) {
          formData.append('questions', JSON.stringify(questions));
        }
      }
      
      // Upload question paper and questions
      await axios.post(
        `/api/organization/tests/${testId}/upload_question_paper/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Assign selected students if any
      if (selectedStudents.length > 0) {
        await axios.post(`/api/organization/tests/${testId}/assign_students/`, {
          student_ids: selectedStudents
        });
      }

      toast.success('Test created successfully');
      setShowCreateModal(false);
      // Add a small delay before fetching to ensure backend has processed the creation
      setTimeout(() => {
        fetchTests();
      }, 500);
      resetForm();
    } catch (error) {
      console.error('Error creating test:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        window.location.href = '/login';
      } else {
        toast.error(error.message || 'Failed to create test');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the Assign Students modal opening logic
  const handleOpenAssignModal = async (test) => {
    console.log('Opening assign modal for test:', test);
    setSelectedTest(test);
    setShowAssignModal(true);
    setSelectedStudents([]); // Clear selected students
    setStudentSearch(''); // Clear search
    await fetchAssignedStudents(test.id);
  };

  // Update the modal close handler
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTest(null);
    setSelectedStudents([]);
    setStudentSearch('');
    setAssignedStudents([]);
  };

  // Update the Assign Students button click handler
  const handleAssignStudents = async () => {
    try {
      setLoading(true);
      configureAxios();
      await axios.post(`/api/organization/tests/${selectedTest.id}/assign_students/`, {
        student_ids: selectedStudents
      });
      
      toast.success('Students assigned successfully');
      handleCloseAssignModal();
      fetchTests();
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        window.location.href = '/login';
      } else {
        toast.error('Failed to assign students');
        console.error('Error assigning students:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        setLoading(true);
        configureAxios();
        await axios.delete(`/api/organization/tests/${testId}/`);
        toast.success('Test deleted successfully');
        fetchTests();
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Please login to continue');
          window.location.href = '/login';
        } else {
          toast.error('Failed to delete test');
          console.error('Error deleting test:', error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Update the resetForm function
  const resetForm = () => {
    setNewTest({
      title: '',
      description: '',
      duration_minutes: '',
      start_time: '',
    });
    setQuestionPaper(null);
    setAnswerKey(null);
    setSelectedStudents([]);
    setStudentSearch('');
    setAssignedStudents([]);
    setQuestionEntryMode('manual');
    setQuestions([]);
    setCurrentQuestion({
      type: 'mcq',
      text: '',
      marks: 1,
      options: [],
      correctAnswer: '',
      programmingLanguage: '',
      testCases: [],
      timeLimit: 5,
      memoryLimit: 512
    });
  };

  // Add a function to refresh the test list
  const refreshTestList = () => {
    fetchTests();
  };

  // Add useEffect to refresh the list periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTestList();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Add useEffect to log state changes
  useEffect(() => {
    if (showAssignModal && selectedTest) {
      console.log('Assign modal state:', {
        showModal: showAssignModal,
        selectedTest,
        assignedStudents,
        totalStudents: students.length,
        filteredStudents: filteredStudents.length
      });
    }
  }, [showAssignModal, selectedTest, assignedStudents, students, filteredStudents]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      type: 'mcq',
      text: '',
      marks: 1,
      options: [],
      correctAnswer: '',
      programmingLanguage: '',
      testCases: [],
      timeLimit: 5,
      memoryLimit: 512
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="container-fluid">
      {!initialized ? (
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Initializing...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <h2>Test Management</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
                disabled={loading}
              >
                <i className="fas fa-plus me-2"></i>Create Test
              </button>
            </div>
          </div>

          {/* Test List */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <Table 
                      columns={[
                        {
                          header: <div className="text-center">Title</div>,
                          accessor: 'title'
                        },
                        {
                          header: <div className="text-center">Description</div>,
                          accessor: 'description'
                        },
                        {
                          header: <div className="text-center">Duration (min)</div>,
                          accessor: 'duration_minutes'
                        },
                        {
                          header: <div className="text-center">Start Time</div>,
                          accessor: 'start_time',
                          renderCell: (column, row) => new Date(row.start_time).toLocaleString()
                        },
                        {
                          header: <div className="text-center">Actions</div>,
                          accessor: 'actions',
                          renderCell: (column, row) => (
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => handleOpenAssignModal(row)}
                              >
                                <i className="fas fa-users"></i> Add Students
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteTest(row.id)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          )
                        }
                      ]}
                      data={tests}
                      emptyMessage="No tests found. Create your first test!"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-plus-circle me-2"></i>
                  Create New Test
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left Column - Basic Test Details */}
                  <div className="col-md-4 border-end">
                    <div className="mb-4">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Basic Information
                      </h6>
                      <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newTest.title}
                          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                          placeholder="Enter test title"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          value={newTest.description}
                          onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                          placeholder="Enter test description"
                          rows="3"
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Duration (minutes)</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newTest.duration_minutes}
                              onChange={(e) => setNewTest({ ...newTest, duration_minutes: e.target.value })}
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={newTest.start_time}
                              onChange={(e) => setNewTest({ ...newTest, start_time: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-users me-2"></i>
                        Assign Students
                      </h6>
                      <div className="mb-3">
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <i className="fas fa-search"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search students..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={handleSelectAll}
                            disabled={filteredStudents.length === 0}
                          >
                            <i className="fas fa-check-double me-1"></i>
                            Select All
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleClearAll}
                            disabled={selectedStudents.length === 0}
                          >
                            <i className="fas fa-times me-1"></i>
                            Clear All
                          </button>
                        </div>
                        <div className="text-muted">
                          <small>
                            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                          </small>
                        </div>
                      </div>

                      <div className="border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredStudents.length === 0 ? (
                          <div className="text-center p-4 text-muted">
                            <i className="fas fa-user-slash fa-2x mb-2"></i>
                            <div>
                              {studentSearch ? 'No students found matching your search.' : 'No students available.'}
                            </div>
                          </div>
                        ) : (
                          <div className="list-group list-group-flush">
                            {filteredStudents.map(student => (
                              <div
                                key={student.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center ${
                                  selectedStudents.includes(student.id) ? 'list-group-item-primary' : ''
                                }`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleStudentToggle(student.id)}
                              >
                                <div className="form-check me-3">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => handleStudentToggle(student.id)}
                                  />
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <h6 className="mb-1">
                                        <i className="fas fa-user me-2"></i>
                                        {student.username}
                                      </h6>
                                      <p className="mb-0 text-muted small">
                                        <i className="fas fa-envelope me-1"></i>
                                        {student.email}
                                      </p>
                                    </div>
                                    {selectedStudents.includes(student.id) && (
                                      <span className="badge bg-primary">
                                        <i className="fas fa-check"></i>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Questions */}
                  <div className="col-md-8">
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="text-primary mb-0">
                          <i className="fas fa-question-circle me-2"></i>
                          Questions
                        </h6>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="questionEntryMode"
                            checked={questionEntryMode === 'manual'}
                            onChange={(e) => setQuestionEntryMode(e.target.checked ? 'manual' : 'upload')}
                          />
                          <label className="form-check-label" htmlFor="questionEntryMode">
                            {questionEntryMode === 'manual' ? 'Manual Entry' : 'Upload Question Paper'}
                          </label>
                        </div>
                      </div>

                      {questionEntryMode === 'upload' ? (
                        <div className="card shadow-sm">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">
                                    <i className="fas fa-file-pdf me-2 text-danger"></i>
                                    Question Paper (PDF)
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    accept=".pdf"
                                    onChange={(e) => setQuestionPaper(e.target.files[0])}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">
                                    <i className="fas fa-key me-2 text-warning"></i>
                                    Answer Key (PDF)
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    accept=".pdf"
                                    onChange={(e) => setAnswerKey(e.target.files[0])}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="card shadow-sm mb-3">
                            <div className="card-body">
                              <div className="row mb-3">
                                <div className="col-md-4">
                                  <label className="form-label">Question Type</label>
                                  <select
                                    className="form-select"
                                    value={currentQuestion.type}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                  >
                                    {questionTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">Marks</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={currentQuestion.marks}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 0 })}
                                    min="1"
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">Question Text</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={currentQuestion.text}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                                    placeholder="Enter question text"
                                  />
                                </div>
                              </div>

                              {currentQuestion.type === 'mcq' && (
                                <div className="mb-3">
                                  <label className="form-label">Options</label>
                                  {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="input-group mb-2">
                                      <span className="input-group-text">{String.fromCharCode(65 + index)}</span>
                                      <input
                                        type="text"
                                        className="form-control"
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...currentQuestion.options];
                                          newOptions[index] = e.target.value;
                                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                        }}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                      <button
                                        className="btn btn-outline-danger"
                                        onClick={() => {
                                          const newOptions = currentQuestion.options.filter((_, i) => i !== index);
                                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                        }}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setCurrentQuestion({
                                      ...currentQuestion,
                                      options: [...currentQuestion.options, '']
                                    })}
                                  >
                                    <i className="fas fa-plus me-1"></i>
                                    Add Option
                                  </button>
                                </div>
                              )}

                              {currentQuestion.type === 'programming' && (
                                <>
                                  <div className="row mb-3">
                                    <div className="col-md-4">
                                      <label className="form-label">Programming Language</label>
                                      <select
                                        className="form-select"
                                        value={currentQuestion.programmingLanguage}
                                        onChange={(e) => setCurrentQuestion({
                                          ...currentQuestion,
                                          programmingLanguage: e.target.value
                                        })}
                                      >
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="javascript">JavaScript</option>
                                      </select>
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label">Time Limit (seconds)</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={currentQuestion.timeLimit}
                                        onChange={(e) => setCurrentQuestion({
                                          ...currentQuestion,
                                          timeLimit: parseInt(e.target.value) || 5
                                        })}
                                        min="1"
                                      />
                                    </div>
                                    <div className="col-md-4">
                                      <label className="form-label">Memory Limit (MB)</label>
                                      <input
                                        type="number"
                                        className="form-control"
                                        value={currentQuestion.memoryLimit}
                                        onChange={(e) => setCurrentQuestion({
                                          ...currentQuestion,
                                          memoryLimit: parseInt(e.target.value) || 512
                                        })}
                                        min="128"
                                      />
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Test Cases</label>
                                    {currentQuestion.testCases.map((testCase, index) => (
                                      <div key={index} className="card mb-2">
                                        <div className="card-body">
                                          <div className="row">
                                            <div className="col-md-6">
                                              <label className="form-label">Input</label>
                                              <textarea
                                                className="form-control"
                                                value={testCase.input}
                                                onChange={(e) => {
                                                  const newTestCases = [...currentQuestion.testCases];
                                                  newTestCases[index] = { ...testCase, input: e.target.value };
                                                  setCurrentQuestion({ ...currentQuestion, testCases: newTestCases });
                                                }}
                                                rows="2"
                                              />
                                            </div>
                                            <div className="col-md-6">
                                              <label className="form-label">Expected Output</label>
                                              <textarea
                                                className="form-control"
                                                value={testCase.output}
                                                onChange={(e) => {
                                                  const newTestCases = [...currentQuestion.testCases];
                                                  newTestCases[index] = { ...testCase, output: e.target.value };
                                                  setCurrentQuestion({ ...currentQuestion, testCases: newTestCases });
                                                }}
                                                rows="2"
                                              />
                                            </div>
                                          </div>
                                          <button
                                            className="btn btn-outline-danger btn-sm mt-2"
                                            onClick={() => {
                                              const newTestCases = currentQuestion.testCases.filter((_, i) => i !== index);
                                              setCurrentQuestion({ ...currentQuestion, testCases: newTestCases });
                                            }}
                                          >
                                            <i className="fas fa-trash-alt me-1"></i>
                                            Remove Test Case
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => setCurrentQuestion({
                                        ...currentQuestion,
                                        testCases: [...currentQuestion.testCases, { input: '', output: '' }]
                                      })}
                                    >
                                      <i className="fas fa-plus me-1"></i>
                                      Add Test Case
                                    </button>
                                  </div>
                                </>
                              )}

                              <div className="text-end">
                                <button
                                  className="btn btn-primary"
                                  onClick={handleAddQuestion}
                                  disabled={!currentQuestion.text || !currentQuestion.marks}
                                >
                                  <i className="fas fa-plus me-1"></i>
                                  Add Question
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* List of added questions */}
                          {questions.length > 0 && (
                            <div className="card shadow-sm">
                              <div className="card-body">
                                <h6 className="card-title mb-3">
                                  <i className="fas fa-list me-2"></i>
                                  Added Questions
                                </h6>
                                {questions.map((question, index) => (
                                  <div key={question.id} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                                    <div>
                                      <strong>Q{index + 1}:</strong> {question.text}
                                      <span className="ms-2 badge bg-primary">{question.type}</span>
                                      <span className="ms-2 badge bg-secondary">{question.marks} marks</span>
                                    </div>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleRemoveQuestion(question.id)}
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateTest}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-1"></i>
                      Create Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {showAssignModal && selectedTest && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-users me-2"></i>
                  Assign Students to "{selectedTest.title}"
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAssignModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Search Bar */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search students by name or email..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={handleSelectAll}
                      disabled={filteredStudents.length === 0}
                    >
                      <i className="fas fa-check-double me-1"></i>
                      Select All ({filteredStudents.length})
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleClearAll}
                      disabled={selectedStudents.length === 0}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear All
                    </button>
                  </div>
                  <div className="text-muted">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </small>
                  </div>
                </div>

                {/* Students List */}
                <div className="border rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                      <i className="fas fa-user-slash fa-2x mb-2"></i>
                      <div>
                        {studentSearch ? 'No students found matching your search.' : 'No students available.'}
                      </div>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredStudents.map(student => (
                        <div
                          key={student.id}
                          className={`list-group-item list-group-item-action d-flex align-items-center ${
                            selectedStudents.includes(student.id) ? 'list-group-item-primary' : ''
                          }`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleStudentToggle(student.id)}
                        >
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  <i className="fas fa-user me-2"></i>
                                  {student.username}
                                </h6>
                                <p className="mb-0 text-muted small">
                                  <i className="fas fa-envelope me-1"></i>
                                  {student.email}
                                </p>
                              </div>
                              {selectedStudents.includes(student.id) && (
                                <span className="badge bg-primary">
                                  <i className="fas fa-check"></i>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection Summary */}
                {selectedStudents.length > 0 && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6 className="mb-2">
                      <i className="fas fa-clipboard-list me-2"></i>
                      Selected Students ({selectedStudents.length}):
                    </h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedStudents.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <span key={studentId} className="badge bg-primary">
                            {student.username}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1"
                              style={{ fontSize: '0.7em' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentToggle(studentId);
                              }}
                            ></button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseAssignModal}
                >
                  <i className="fas fa-times me-1"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignStudents}
                  disabled={loading || selectedStudents.length === 0}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-1"></i>
                      Assign {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
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

export default TestManagement; 