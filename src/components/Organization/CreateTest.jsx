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
    matchingPairs: []
  });

  const [testDetails, setTestDetails] = useState({
    title: '',
    description: '',
    start_time: '',
    duration_minutes: ''
  });

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
      matchingPairs: []
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

  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const displayName = student.username || '';
    const email = student.email || '';
    const searchTerm = studentSearch.toLowerCase();
    
    return displayName.toLowerCase().includes(searchTerm) || 
           email.toLowerCase().includes(searchTerm);
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

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Create New Test</h2>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/organization/tests')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Tests
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps mb-4">
        <div className="d-flex justify-content-between">
          {[
            { number: 1, label: 'Basic Details' },
            { number: 2, label: 'Questions' },
            { number: 3, label: 'Assign Students' }
          ].map((step) => (
            <div
              key={step.number}
              className={`d-flex align-items-center ${
                currentStep >= step.number ? 'text-primary' : 'text-muted'
              }`}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${
                  currentStep >= step.number ? 'bg-primary text-white' : 'bg-light'
                }`}
                style={{ width: '35px', height: '35px' }}
              >
                {step.number}
              </div>
              <span className="ms-2">{step.label}</span>
              {step.number < 3 && (
                <div
                  className={`mx-3 flex-grow-1 ${
                    currentStep > step.number ? 'border-primary' : 'border-secondary'
                  }`}
                  style={{ height: '2px', borderTop: '2px solid' }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

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
            <div className="card shadow-sm">
              <div className="card-body">
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
                            ))}
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setCurrentQuestion({
                                ...currentQuestion,
                                options: [...currentQuestion.options, '']
                              })}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                            {currentQuestion.options.length < 2 && (
                              <div className="text-danger mt-2">
                                <small><i className="fas fa-exclamation-circle me-1"></i>MCQ questions must have at least two options</small>
                              </div>
                            )}
                          </div>
                        )}

                        {currentQuestion.type === 'matching' && (
                          <div className="mb-3">
                            <label className="form-label">Matching Pairs</label>
                            {currentQuestion.matchingPairs.map((pair, index) => (
                              <div key={index} className="row mb-2">
                                <div className="col-md-5">
                                  <div className="input-group">
                                    <span className="input-group-text">Left {index + 1}</span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Enter left item"
                                      value={pair.left || ''}
                                      onChange={(e) => {
                                        const newPairs = [...currentQuestion.matchingPairs];
                                        newPairs[index] = { ...newPairs[index], left: e.target.value };
                                        setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-md-5">
                                  <div className="input-group">
                                    <span className="input-group-text">Right {index + 1}</span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Enter right item"
                                      value={pair.right || ''}
                                      onChange={(e) => {
                                        const newPairs = [...currentQuestion.matchingPairs];
                                        newPairs[index] = { ...newPairs[index], right: e.target.value };
                                        setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-md-2">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => {
                                      const newPairs = currentQuestion.matchingPairs.filter((_, i) => i !== index);
                                      setCurrentQuestion({ ...currentQuestion, matchingPairs: newPairs });
                                    }}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setCurrentQuestion({
                                ...currentQuestion,
                                matchingPairs: [...currentQuestion.matchingPairs, { left: '', right: '' }]
                              })}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                            {currentQuestion.matchingPairs.length < 2 && (
                              <div className="text-danger mt-2">
                                <small><i className="fas fa-exclamation-circle me-1"></i>Matching questions must have at least two pairs</small>
                              </div>
                            )}
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
          )}

          {/* Step 3: Assign Students */}
          {currentStep === 3 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-users me-2 text-primary"></i>
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

export default CreateTest; 