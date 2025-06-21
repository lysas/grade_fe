import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageHeader, ProgressSteps } from '../GradeMaster/common/SharedTestComponents';

const SortableQuestionItem = ({ question, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
      {...attributes}
      {...listeners}
    >
      <div className="d-flex align-items-center">
        <i className="fas fa-grip-vertical me-2 text-muted" style={{ cursor: 'grab' }}></i>
        <div>
          <strong>Q{index + 1}:</strong> {question.text}
          <span className="ms-2 badge bg-primary">{question.type}</span>
          <span className="ms-2 badge bg-secondary">{question.marks} marks</span>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline-danger btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(question.id);
        }}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
    </div>
  );
};

const CreateTest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionEntryMode, setQuestionEntryMode] = useState('manual');
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    text: '',
    marks: 1,
    options: [],
    correctAnswer: '',
    programmingLanguage: '',
    testCases: [],
    timeLimit: 5,
    memoryLimit: 512,
    matchingPairs: [],
    blanks: []
  });

  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: ''
  });

  const questionTypes = [
    { value: 'mcq', label: 'MCQ' },
    { value: 'fill_blank', label: 'Fill in the blanks' },
    { value: 'matching', label: 'Match the following' },
    { value: 'true_false', label: 'True/False' },
    { value: 'divider1', label: '-----' },
    { value: 'short_answer', label: 'Short-answer Questions' },
    { value: 'long_answer', label: 'Long Answer' },
    { value: 'programming', label: 'Programming Exercise' },
  ];

  // Hierarchy filter state
  const [hierarchyLevels, setHierarchyLevels] = useState([]);
  const [hierarchyValues, setHierarchyValues] = useState({});
  const [selectedHierarchyFilters, setSelectedHierarchyFilters] = useState({});
  const [studentHierarchies, setStudentHierarchies] = useState({});

  // Get auth token from localStorage
  const getAuthToken = () => {
    try {
      const token = localStorage.getItem('token');
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
      }
    } catch (error) {
      console.error('Error configuring axios:', error);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      configureAxios();
      const response = await axios.get('/api/organization/students/');
      const studentsData = response.data.data || response.data;
      if (Array.isArray(studentsData)) {
        const validStudents = studentsData.filter(student => 
          student && typeof student === 'object' && 
          (student.username || student.email)
        );
        setStudents(validStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    fetchStudents();
  }, [navigate]);

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

  const handleAddQuestion = () => {
    // Validate MCQ questions have at least two options
    if (currentQuestion.type === 'mcq' && currentQuestion.options.length < 2) {
      toast.error('MCQ questions must have at least two options');
      return;
    }
    // For MCQ, if correctAnswer is not set, set it to the first option
    if (currentQuestion.type === 'mcq' && !currentQuestion.correctAnswer && currentQuestion.options.length > 0) {
      setCurrentQuestion(prev => ({ ...prev, correctAnswer: prev.options[0] }));
    }

    // Validate matching questions have at least two pairs
    if (currentQuestion.type === 'matching' && currentQuestion.matchingPairs.length < 2) {
      toast.error('Matching questions must have at least two pairs');
      return;
    }

    // Validate matching pairs are not empty
    if (currentQuestion.type === 'matching') {
      const hasEmptyPairs = currentQuestion.matchingPairs.some(pair => !pair.left?.trim() || !pair.right?.trim());
      if (hasEmptyPairs) {
        toast.error('All matching pairs must have both left and right items filled');
        return;
      }
    }

    // For fill-in-the-blank questions, validate that there's at least one blank
    if (currentQuestion.type === 'fill_blank') {
      const blankCount = (currentQuestion.text.match(/\\[BLANK\\]/g) || []).length;
      if (blankCount === 0) {
        toast.error('Fill in the blank questions must have at least one [BLANK] placeholder');
        return;
      }
    }

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
      memoryLimit: 512,
      matchingPairs: [],
      blanks: []
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleCreateTest = async () => {
    try {
      setLoading(true);
      configureAxios();
      
      // Create test first
      const response = await axios.post('/api/organization/tests/', testDetails);
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
        if (questions.length > 0) {
          // Format questions data before sending
          const formattedQuestions = questions.map(q => {
            const question = { ...q };
            // Remove the id field as it's not needed by the backend
            delete question.id;
            
            // Ensure matching pairs are properly formatted
            if (question.type === 'matching') {
              question.matchingPairs = question.matchingPairs.map(pair => ({
                left: pair.left?.trim() || '',
                right: pair.right?.trim() || ''
              }));
            }
            // For MCQ, ensure correct answer is part of options if "Other" was added
            if (question.type === 'mcq' && question.correctAnswer === 'Other' && !question.options.includes('Other')) {
              question.options.push('Other'); // Add "Other" if it was chosen as correct but not explicitly added
            }
            
            return question;
          });
          formData.append('questions', JSON.stringify(formattedQuestions));
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
      navigate('/organization/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to create test');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch hierarchy levels and values on mount (Step 3 only)
  useEffect(() => {
    if (currentStep !== 3) return;
    const fetchHierarchyData = async () => {
      try {
        configureAxios();
        const levelsRes = await axios.get('/api/organization/hierarchy-levels/');
        setHierarchyLevels(levelsRes.data || []);
        // Fetch values for each level
        const allValues = {};
        for (const level of levelsRes.data || []) {
          const valuesRes = await axios.get(`/api/organization/hierarchy-levels/${level.id}/values/`);
          allValues[level.id] = valuesRes.data.data || [];
        }
        setHierarchyValues(allValues);
      } catch (err) {
        console.error('Error fetching hierarchy data:', err);
      }
    };
    fetchHierarchyData();
  }, [currentStep]);

  // Fetch student hierarchies when students change (Step 3 only)
  useEffect(() => {
    if (currentStep !== 3 || students.length === 0) return;
    const fetchAllStudentHierarchies = async () => {
      const all = {};
      for (const student of students) {
        try {
          const res = await axios.get(`/api/organization/student-hierarchies/student_hierarchies/?student_id=${student.id}`);
          all[student.id] = res.data.data || [];
        } catch (err) {
          all[student.id] = [];
        }
      }
      setStudentHierarchies(all);
    };
    fetchAllStudentHierarchies();
  }, [currentStep, students]);

  // Handler for filter change
  const handleHierarchyFilterChange = (levelId, valueId) => {
    setSelectedHierarchyFilters(prev => ({ ...prev, [levelId]: valueId }));
  };
  const handleClearHierarchyFilters = () => setSelectedHierarchyFilters({});

  // Filter students by selected hierarchy filters
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    // Text search
    const displayName = student.username || '';
    const email = student.email || '';
    const searchTerm = studentSearch.toLowerCase();
    const matchesText = displayName.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm);
    // Hierarchy filter
    const filters = Object.entries(selectedHierarchyFilters).filter(([_, v]) => v);
    if (filters.length === 0) return matchesText;
    const studentH = studentHierarchies[student.id] || [];
    // All selected filters must match
    const matchesHierarchy = filters.every(([levelId, valueId]) =>
      studentH.some(h => String(h.hierarchy_level.id) === String(levelId) && String(h.value) === String(hierarchyValues[levelId]?.find(v => String(v.id) === String(valueId))?.value))
    );
    return matchesText && matchesHierarchy;
  });

  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add handler for drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const steps = [
    { number: 1, label: 'Basic Details' },
    { number: 2, label: 'Questions' },
    { number: 3, label: 'Assign Students' }
  ];

  return (
    <div className="container-fluid py-4">
      <PageHeader 
        title="Create New Test" 
        onBack={() => navigate('/organization/tests')} 
      />

      <ProgressSteps currentStep={currentStep} steps={steps} />

      {/* Step Content */}
      <div className="row">
        <div className="col-12">
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  Basic Test Information
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Test Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={testDetails.title}
                      onChange={(e) => setTestDetails({ ...testDetails, title: e.target.value })}
                      placeholder="Enter test title"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={testDetails.duration_minutes}
                      onChange={(e) => setTestDetails({ ...testDetails, duration_minutes: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={testDetails.start_time}
                      onChange={(e) => setTestDetails({ ...testDetails, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={testDetails.description}
                      onChange={(e) => setTestDetails({ ...testDetails, description: e.target.value })}
                      placeholder="Enter test description"
                      rows="3"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {currentStep === 2 && (
            <div className="row">
              <div className="col-lg-12">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="card-title mb-0">
                        <i className="fas fa-question-circle me-2 text-primary"></i>
                        Questions
                      </h6>
                      <div className="btn-group" role="group">
                        <button
                          type="button"
                          className={`btn ${questionEntryMode === 'manual' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setQuestionEntryMode('manual')}
                        >
                          <i className="fas fa-keyboard me-2"></i>
                          Manual Entry
                        </button>
                        <button
                          type="button"
                          className={`btn ${questionEntryMode === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => setQuestionEntryMode('upload')}
                        >
                          <i className="fas fa-file-upload me-2"></i>
                          Upload Questions
                        </button>
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
                        <div className="card shadow-sm mb-4">
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-4">
                              {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false' || currentQuestion.type === 'short_answer' || currentQuestion.type === 'long_answer' || currentQuestion.type === 'programming' || currentQuestion.type === 'matching') && (
                                <div className="flex-grow-1 me-3">
                                  <label className="form-label visually-hidden">Question Text</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={currentQuestion.text}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                                    placeholder="Question"
                                  />
                                </div>
                              )}
                              <div className="me-3">
                                <label className="form-label visually-hidden">Question Type</label>
                                <select
                                  className="select-common"
                                  value={currentQuestion.type}
                                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                                  style={{
                                    width: '200px',
                                    padding: '10px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    appearance: 'menulist'
                                  }}
                                >
                                  {questionTypes.map(type => (
                                    type.value.startsWith('divider') ? (
                                      <option key={type.value} disabled>-----</option>
                                    ) : (
                                      <option 
                                        key={type.value} 
                                        value={type.value}
                                        style={{
                                          backgroundColor: 'white',
                                          color: '#333'
                                        }}
                                      >
                                        {type.label}
                                      </option>
                                    )
                                  ))}
                                </select>
                                <style>
                                  {`
                                    select option:checked {
                                      background-color: white !important;
                                      color: #333 !important;
                                    }
                                    select option:hover {
                                      background-color: #f8f9fa !important;
                                    }
                                    select option {
                                      background-color: white;
                                      color: #333;
                                    }
                                  `}
                                </style>
                              </div>
                              <div>
                                <button
                                  className="btn btn-light shadow-sm"
                                  style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                                  onClick={handleAddQuestion}
                                  disabled={!currentQuestion.text || !currentQuestion.marks || (currentQuestion.type === 'mcq' && currentQuestion.options.length < 2) || (currentQuestion.type === 'matching' && currentQuestion.matchingPairs.length < 2) || (currentQuestion.type === 'fill_blank' && (currentQuestion.text.match(/\\[BLANK\\]/g) || []).length === 0)}
                                >
                                  <i className="fas fa-plus fa-lg"></i>
                                </button>
                              </div>
                            </div>

                            {currentQuestion.type === 'mcq' && (
                              <div className="mb-4">
                                {currentQuestion.options.map((option, index) => (
                                  <div key={index} className="d-flex align-items-center mb-2">
                                    <div className="me-2">
                                      <input
                                        type="radio"
                                        className="form-check-input"
                                        style={{ width: '18px', height: '18px' }}
                                        name="correctAnswerMcq"
                                        value={option}
                                        checked={currentQuestion.correctAnswer === option}
                                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: option })}
                                      />
                                    </div>
                                    <div className="input-group">
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
                                        style={{ padding: '0.375rem 0.75rem' }}
                                        onClick={() => {
                                          if (currentQuestion.options.length <= 2) {
                                            toast.error('MCQ questions must have at least two options');
                                            return;
                                          }
                                          const newOptions = currentQuestion.options.filter((_, i) => i !== index);
                                          setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                        }}
                                      >
                                        <i className="fas fa-times"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="mt-3">
                                  <button
                                    className="btn btn-link text-decoration-none p-0"
                                    onClick={() => setCurrentQuestion({
                                      ...currentQuestion,
                                      options: [...currentQuestion.options, '']
                                    })}
                                  >
                                    <i className="fas fa-plus me-1"></i> Add option
                                  </button>
                                  <span className="mx-2">or</span>
                                  <button
                                    className="btn btn-link text-decoration-none p-0"
                                    onClick={() => setCurrentQuestion({
                                      ...currentQuestion,
                                      options: [...currentQuestion.options, 'Other'],
                                      correctAnswer: currentQuestion.correctAnswer === '' ? 'Other' : currentQuestion.correctAnswer
                                    })}
                                  >
                                    Add "Other"
                                  </button>
                                </div>
                                {currentQuestion.options.length < 2 && (
                                  <div className="text-danger mt-3">
                                    <small><i className="fas fa-exclamation-circle me-2"></i>MCQ questions must have at least two options</small>
                                  </div>
                                )}
                              </div>
                            )}

                            {currentQuestion.type === 'matching' && (
                              <div className="mb-4">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="card">
                                      <div className="card-header bg-light">
                                        <h6 className="mb-0">Column A</h6>
                                      </div>
                                      <div className="card-body">
                                        {currentQuestion.matchingPairs.map((pair, index) => (
                                          <div key={`left-${index}`} className="mb-2">
                                            <div className="input-group">
                                              <span className="input-group-text">{index + 1}</span>
                                              <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Item ${index + 1}`}
                                                value={pair.left || ''}
                                                onChange={(e) => {
                                                  const newPairs = [...currentQuestion.matchingPairs];
                                                  newPairs[index] = { ...newPairs[index], left: e.target.value };
                                                  setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                                }}
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="card">
                                      <div className="card-header bg-light">
                                        <h6 className="mb-0">Column B</h6>
                                      </div>
                                      <div className="card-body">
                                        {currentQuestion.matchingPairs.map((pair, index) => (
                                          <div key={`right-${index}`} className="mb-2">
                                            <div className="input-group">
                                              <span className="input-group-text">{index + 1}</span>
                                              <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Match for Item ${index + 1}`}
                                                value={pair.right || ''}
                                                onChange={(e) => {
                                                  const newPairs = [...currentQuestion.matchingPairs];
                                                  newPairs[index] = { ...newPairs[index], right: e.target.value };
                                                  setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                                }}
                                              />
                                              <button
                                                className="btn btn-outline-danger"
                                                onClick={() => {
                                                  const newPairs = currentQuestion.matchingPairs.filter((_, i) => i !== index);
                                                  setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                                }}
                                              >
                                                <i className="fas fa-times"></i>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <button
                                    className="btn btn-link text-decoration-none p-0"
                                    onClick={() => setCurrentQuestion({
                                      ...currentQuestion,
                                      matchingPairs: [...currentQuestion.matchingPairs, { left: '', right: '' }]
                                    })}
                                  >
                                    <i className="fas fa-plus me-1"></i> Add pair
                                  </button>
                                </div>
                                {currentQuestion.matchingPairs.length < 2 && (
                                  <div className="text-danger mt-3">
                                    <small><i className="fas fa-exclamation-circle me-2"></i>Matching questions must have at least two pairs</small>
                                  </div>
                                )}
                              </div>
                            )}

                            {currentQuestion.type === 'fill_blank' && (
                              <div className="mb-3">
                                <label className="form-label">Question Text with Blanks</label>
                                <textarea
                                  className="form-control"
                                  value={currentQuestion.text}
                                  onChange={(e) => {
                                    const text = e.target.value;
                                    // Extract all [BLANK] occurrences and their positions
                                    const blanks = [];
                                    let match;
                                    const regex = /\\[BLANK\\]/g;
                                    while ((match = regex.exec(text)) !== null) {
                                      blanks.push({
                                        position: match.index,
                                        correctAnswer: ''
                                      });
                                    }
                                    setCurrentQuestion({
                                      ...currentQuestion,
                                      text,
                                      blanks
                                    });
                                  }}
                                  placeholder="Enter your question text. Use [BLANK] to indicate where the answer should be filled in."
                                  rows="4"
                                />
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
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
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
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setCurrentQuestion({
                                        ...currentQuestion,
                                        testCases: [...currentQuestion.testCases, { input: '', output: '' }]
                                      });
                                    }}
                                  >
                                    <i className="fas fa-plus me-1"></i>
                                    Add Test Case
                                  </button>
                                </div>
                              </>
                            )}

                            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
                              <div className="d-flex align-items-center">
                                <i className="fas fa-check-square me-2 text-primary"></i>
                                <span>Marks:</span>
                                <input
                                  type="number"
                                  className="form-control ms-2"
                                  style={{ width: '80px' }}
                                  value={currentQuestion.marks}
                                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 0 })}
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {questions.length > 0 && (
                          <div className="card shadow-sm mt-3">
                            <div className="card-body">
                              <h6 className="card-title mb-3">
                                <i className="fas fa-list me-2"></i>
                                Added Questions ({questions.length})
                              </h6>
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                              >
                                <SortableContext
                                  items={questions.map(q => q.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {questions.map((question, index) => (
                                    <SortableQuestionItem
                                      key={question.id}
                                      question={question}
                                      index={index}
                                      onRemove={handleRemoveQuestion}
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assign Students */}
          {currentStep === 3 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-users me-2 text-primary"></i>
                  Assign Students
                </h6>
                {/* Hierarchy Filters */}
                <HierarchyFilters
                  hierarchyLevels={hierarchyLevels}
                  hierarchyValues={hierarchyValues}
                  selectedFilters={selectedHierarchyFilters}
                  onChange={handleHierarchyFilterChange}
                  onClear={handleClearHierarchyFilters}
                />
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
                      {filteredStudents.map(student => {
                        const isSelected = selectedStudents.includes(student.id);
                        // Get initials for avatar
                        const initials = (student.username || student.email || '?')
                          .split(' ')
                          .map(w => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase();
                        return (
                          <div
                            key={student.id}
                            className={`custom-student-card d-flex align-items-center position-relative ${isSelected ? 'selected' : ''}`}
                            style={{ cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s', marginBottom: 12 }}
                            onClick={() => handleStudentToggle(student.id)}
                          >
                            {/* Avatar/Initials */}
                            <div className="student-avatar me-3">
                              {initials}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">
                                    {student.username}
                                  </h6>
                                  <p className="mb-0 text-muted small">
                                    <i className="fas fa-envelope me-1"></i>
                                    {student.email}
                                  </p>
                                  {/* Show hierarchy values for this student */}
                                  <div className="small text-muted">
                                    {studentHierarchies[student.id] && studentHierarchies[student.id].length > 0 && (
                                      studentHierarchies[student.id].map(h => (
                                        <span key={h.id} className="badge bg-light text-dark border me-1">
                                          {h.hierarchy_level.name}: {h.value}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Checkmark overlay if selected */}
                            {isSelected && (
                              <span className="checkmark-overlay">
                                <i className="fas fa-check"></i>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Custom styles for student selection card */}
                <style>{`
                  .custom-student-card {
                    background: #fff;
                    border-radius: 14px;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                    border: 2px solid transparent;
                    padding: 16px 18px;
                    position: relative;
                    min-height: 64px;
                  }
                  .custom-student-card.selected {
                    background: #e6f0ff;
                    border: 2px solid #3399ff;
                    box-shadow: 0 2px 8px rgba(51,153,255,0.10);
                  }
                  .custom-student-card:hover {
                    box-shadow: 0 4px 16px rgba(51,153,255,0.13);
                    background: #f7fbff;
                  }
                  .student-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #3399ff22;
                    color: #3399ff;
                    font-weight: bold;
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
                  }
                  .checkmark-overlay {
                    position: absolute;
                    top: 10px;
                    right: 18px;
                    background: #3399ff;
                    color: #fff;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    box-shadow: 0 2px 6px rgba(51,153,255,0.18);
                    z-index: 2;
                  }
                `}</style>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/organization/tests')}
            >
              <i className="fas fa-times me-1"></i>
              Cancel
            </button>
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <i className="fas fa-arrow-right ms-1"></i>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// HierarchyFilters component
function HierarchyFilters({ hierarchyLevels, hierarchyValues, selectedFilters, onChange, onClear }) {
  if (!hierarchyLevels.length) return null;
  return (
    <div className="mb-3 d-flex flex-wrap align-items-end gap-3">
      {hierarchyLevels.map(level => (
        <div key={level.id} style={{ minWidth: 180 }}>
          <label className="form-label mb-1">{level.name}</label>
          <select
            className="form-select"
            value={selectedFilters[level.id] || ''}
            onChange={e => onChange(level.id, e.target.value)}
          >
            <option value="">All</option>
            {(hierarchyValues[level.id] || []).map(v => (
              <option key={v.id} value={v.id}>{v.value}</option>
            ))}
          </select>
        </div>
      ))}
      <button type="button" className="btn btn-outline-secondary btn-sm ms-2" onClick={onClear}>
        Clear Filters
      </button>
    </div>
  );
}

export default CreateTest; 