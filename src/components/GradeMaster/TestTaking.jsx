import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import './TestTaking.css';

const TestTaking = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [activeQuestionType, setActiveQuestionType] = useState(null);
  const [questionOrder, setQuestionOrder] = useState([]);
  const [executionResults, setExecutionResults] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Configure axios with auth token
  const configureAxios = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Fetch test details and questions
  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      configureAxios();

      const testResponse = await axios.get(`/api/organization/tests/${testId}/`);
      setTest(testResponse.data);

      const questionsResponse = await axios.get(`/api/organization/tests/${testId}/questions/`);
      
      if (questionsResponse.data && questionsResponse.data.status === 'success' && Array.isArray(questionsResponse.data.data)) {
        const questionsData = questionsResponse.data.data;
        setQuestions(questionsData);
        
        const newGroupedQuestions = {};
        const newQuestionOrder = [];

        questionsData.forEach(question => {
          if (!newGroupedQuestions[question.type]) {
            newGroupedQuestions[question.type] = [];
            newQuestionOrder.push(question.type);
          }
          newGroupedQuestions[question.type].push(question);
        });

        setGroupedQuestions(newGroupedQuestions);
        setQuestionOrder(newQuestionOrder);

        if (newQuestionOrder.length > 0) {
          setActiveQuestionType(newQuestionOrder[0]);
          setCurrentQuestionIndex(0);
        }
        
        const initialAnswers = {};
        questionsData.forEach(question => {
          switch (question.type) {
            case 'mcq':
              initialAnswers[question.id] = '';
              break;
            case 'true_false':
              initialAnswers[question.id] = null;
              break;
            case 'programming':
              initialAnswers[question.id] = {
                code: '',
                language: question.programmingLanguage || 'python'
              };
              break;
            case 'descriptive':
            case 'short_answer':
            case 'long_answer':
              initialAnswers[question.id] = '';
              break;
            case 'matching':
              initialAnswers[question.id] = question.matchingPairs.map(pair => ({
                left: pair.left,
                right: ''
              }));
              break;
            default:
              initialAnswers[question.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } else {
        setError('Invalid questions data format received from server');
      }

      if (testResponse.data) {
        const startTime = new Date(testResponse.data.start_time);
        const duration = testResponse.data.duration_minutes;
        const endTime = new Date(startTime.getTime() + duration * 60000);
        setTimeLeft(endTime - new Date());
      }
    } catch (error) {
      console.error('Error fetching test details:', error);
      setError(error.response?.data?.message || 'Failed to fetch test details');
    } finally {
      setLoading(false);
    }
  };

  // Update timer
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Fetch test details on mount
  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMCQOptionSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleCodeChange = (questionId, code) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        code: code
      }
    }));
  };

  const navigateToQuestion = (type, index) => {
    setActiveQuestionType(type);
    setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    const currentTypeQuestions = groupedQuestions[activeQuestionType];
    if (currentQuestionIndex < currentTypeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const currentTypeIndex = questionOrder.indexOf(activeQuestionType);
      if (currentTypeIndex < questionOrder.length - 1) {
        setActiveQuestionType(questionOrder[currentTypeIndex + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      const currentTypeIndex = questionOrder.indexOf(activeQuestionType);
      if (currentTypeIndex > 0) {
        setActiveQuestionType(questionOrder[currentTypeIndex - 1]);
        const prevTypeQuestions = groupedQuestions[questionOrder[currentTypeIndex - 1]];
        setCurrentQuestionIndex(prevTypeQuestions.length - 1);
      }
    }
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    if (!answer) return false;
    if (typeof answer === 'object') {
      if (Array.isArray(answer)) {
        // For matching questions
        return answer.every(pair => pair && pair.right && pair.right.trim() !== '');
      }
      return answer.code.trim() !== '';
    }
    return answer.toString().trim() !== '';
  };

  const calculateProgress = () => {
    const answeredCount = Object.values(answers).filter(answer => {
      if (!answer) return false;
      if (typeof answer === 'object') return answer.code.trim() !== '';
      return answer.toString().trim() !== '';
    }).length;
    return (answeredCount / questions.length) * 100;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      configureAxios();

      const formattedAnswers = Object.entries(answers).map(([questionId, data]) => ({
        question_id: questionId,
        answer: data,
        type: typeof data === 'object' ? data.type : null
      }));

      await axios.post(`/api/organization/tests/${testId}/submit/`, {
        answers: formattedAnswers
      });

      toast.success('Test submitted successfully!');
      navigate('/grade-master/student');
    } catch (err) {
      console.error('Error submitting test:', err);
      toast.error('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunCode = async (questionId) => {
    try {
      setIsExecuting(true);
      const question = questions.find(q => q.id === questionId);
      const code = answers[questionId]?.code || '';
      const language = answers[questionId]?.language || 'python';

      const response = await axios.post('http://localhost:8000/api/run_code/', {
        language,
        code,
      });

      setExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          output: response.data.stdout || '',
          error: response.data.stderr || '',
          status: response.data.stderr ? 'error' : 'success'
        }
      }));

    } catch (error) {
      console.error('Error executing code:', error);
      setExecutionResults(prev => ({
        ...prev,
        [questionId]: {
          output: '',
          error: error.message,
          status: 'error'
        }
      }));
    } finally {
      setIsExecuting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="mcq-options">
            {question.options.map((option, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...
              return (
                <div key={index} className="form-check">
                  <label className="form-check-label">
                    <span className="option-letter">{optionLabel}</span>
                    <span className="option-text">{option}</span>
                  </label>
                  <input
                    type="radio"
                    className="form-check-input"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleMCQOptionSelect(question.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        );

      case 'programming':
        return (
          <div className="programming-question">
            <div className="programming-editor">
              <Editor
                height="300px"
                language="python"
                theme="vs-dark"
                value={answers[question.id]?.code || ''}
                onChange={(value) => handleCodeChange(question.id, value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  quickSuggestions: true,
                  suggestOnTriggerCharacters: true,
                  tabSize: 2,
                  insertSpaces: true,
                  autoClosingBrackets: 'always',
                  autoClosingQuotes: 'always',
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            
            <div className="programming-controls mt-3">
              <button
                className="btn btn-primary"
                onClick={() => handleRunCode(question.id)}
                disabled={isExecuting || !answers[question.id]?.code}
              >
                {isExecuting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Running...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play me-2"></i>
                    Run Code
                  </>
                )}
              </button>
            </div>

            {executionResults[question.id] && (
              <div className="test-cases-results mt-3">
                <h5>Output</h5>
                <div className="output-container">
                  {executionResults[question.id].output && (
                    <pre className="p-3 rounded bg-light">
                      {executionResults[question.id].output}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'descriptive':
      case 'short_answer':
      case 'long_answer':
        return (
          <textarea
            className="form-control"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Write your answer here..."
            rows={question.type === 'long_answer' ? 8 : 4}
          />
        );

      case 'true_false':
        return (
          <div className="mcq-options">
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name={`question-${question.id}`}
                value="true"
                checked={answers[question.id] === 'true'}
                onChange={(e) => handleMCQOptionSelect(question.id, e.target.value)}
              />
              <label className="form-check-label">True</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                className="form-check-input"
                name={`question-${question.id}`}
                value="false"
                checked={answers[question.id] === 'false'}
                onChange={(e) => handleMCQOptionSelect(question.id, e.target.value)}
              />
              <label className="form-check-label">False</label>
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="matching-question">
            <div className="matching-pairs">
              {question.matchingPairs.map((pair, index) => (
                <div key={index} className="matching-pair mb-3">
                  <div className="row">
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text bg-light">Left {index + 1}</span>
                        <input
                          type="text"
                          className="form-control"
                          value={pair.left}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text bg-light">Right {index + 1}</span>
                        <select
                          className="form-select"
                          value={answers[question.id]?.[index]?.right || ''}
                          onChange={(e) => {
                            const newAnswers = { ...answers };
                            if (!newAnswers[question.id]) {
                              newAnswers[question.id] = [];
                            }

                            // If selecting a new value that's already selected elsewhere
                            if (e.target.value) {
                              // Find and remove the previous selection of this value
                              newAnswers[question.id] = newAnswers[question.id].map((ans, i) => {
                                if (i !== index && ans?.right === e.target.value) {
                                  return { left: ans.left, right: '' };
                                }
                                return ans;
                              });
                            }

                            // Set the new selection
                            newAnswers[question.id][index] = {
                              left: pair.left,
                              right: e.target.value
                            };

                            handleAnswerChange(question.id, newAnswers[question.id]);
                          }}
                        >
                          <option value="">Select matching item</option>
                          {question.matchingPairs.map((p, i) => (
                            <option key={i} value={p.right}>
                              {p.right}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <textarea
            className="form-control"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Write your answer here..."
            rows={4}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  // Calculate current question number across all types
  const getCurrentQuestionNumber = () => {
    let totalQuestions = 0;
    let currentNumber = 0;

    for (let i = 0; i < questionOrder.length; i++) {
      const type = questionOrder[i];
      const typeQuestions = groupedQuestions[type] || [];

      if (type === activeQuestionType) {
        currentNumber = totalQuestions + currentQuestionIndex + 1;
        break;
      }
      totalQuestions += typeQuestions.length;
    }

    return currentNumber;
  };

  const getTotalQuestions = () => {
    return questionOrder.reduce((total, type) => {
      return total + (groupedQuestions[type]?.length || 0);
    }, 0);
  };

  return (
    <div className="test-taking-container">
      <div className="test-content">
        {/* Left Sidebar */}
        <div className="test-sidebar">
          <div className="sidebar-header">
            <h3>Question Navigator</h3>
            <div className="question-nav-summary">
              <div className="summary-item">
                <span className="badge badge-answered">{Object.values(answers).filter(a => a && (typeof a !== 'object' || a.code?.trim())).length}</span>
                <span className="summary-text">Answered</span>
              </div>
              <div className="summary-item">
                <span className="badge badge-remaining">{questions.length - Object.values(answers).filter(a => a && (typeof a !== 'object' || a.code?.trim())).length}</span>
                <span className="summary-text">Remaining</span>
              </div>
            </div>
          </div>
          <div className="question-grid">
            {questionOrder.map(type => (
              <div key={type} className="question-type-group">
                {groupedQuestions[type].map((question, index) => {
                  const globalIndex = questionOrder.slice(0, questionOrder.indexOf(type))
                    .reduce((sum, t) => sum + (groupedQuestions[t]?.length || 0), 0) + index + 1;
                  return (
                    <button
                      key={question.id}
                      className={`question-nav-btn ${activeQuestionType === type && currentQuestionIndex === index ? 'current' : ''} ${isQuestionAnswered(question.id) ? 'answered' : 'not-answered'}`}
                      style={activeQuestionType === type && currentQuestionIndex === index ? { background: '#3973e7', color: '#fff', borderColor: '#3973e7', fontWeight: 700 } : {}}
                      onClick={() => navigateToQuestion(type, index)}
                    >
                      {globalIndex}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="question-nav-section">
            <div className="nav-status">
              <div className="status-item">
                <span className="status-dot answered"></span>
                <span>Answered</span>
              </div>
              <div className="status-item">
                <span className="status-dot not-answered"></span>
                <span>Not answered</span>
              </div>
              <div className="status-item">
                <span className="status-dot current"></span>
                <span>Current</span>
              </div>
            </div>

            
          </div>

        </div>

        {/* Main Content */}
        <div className="test-main-content">
          <div className="question-section">
            <div className="question-header-ui" style={{ background: '#f4faff', borderRadius: '12px', padding: '22px 28px 18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', border: '1px solid #e3eefd' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fas fa-clipboard-list" style={{ color: '#1a3365', fontSize: '1.3em' }}></i>
                  <span style={{ fontWeight: 700, color: '#1a3365', fontSize: '1.18em' }}>{test?.title || 'Test Title'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px', fontSize: '1em', color: '#7b8bb2', fontWeight: 500 }}>
                  <span>Question {getCurrentQuestionNumber()} of {getTotalQuestions()}</span>
                  <span style={{ fontSize: '1em', margin: '0 4px' }}>•</span>
                  <span>{Object.values(answers).filter(a => a && (typeof a !== 'object' || a.code?.trim())).length} answered</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#fff', border: '2px solid #cfe2ff', borderRadius: '22px', padding: '7px 18px', fontWeight: 600, color: '#3973e7', fontSize: '1.13em', minWidth: '90px', justifyContent: 'center' }}>
                <i className="fas fa-clock" style={{ fontSize: '1.1em' }}></i>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{Math.floor(timeLeft / 60000).toString().padStart(2, '0')}:{Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0')}</span>
              </div>
            </div>

            <div className="question-content">
              <div className="question-text">
                {getCurrentQuestionNumber()}. {groupedQuestions[activeQuestionType]?.[currentQuestionIndex]?.text}
              </div>

              <div className="answer-section">
                {activeQuestionType && groupedQuestions[activeQuestionType]?.[currentQuestionIndex] &&
                 renderQuestion(groupedQuestions[activeQuestionType][currentQuestionIndex])}
              </div>
            </div>

            <div className="question-actions">
              <div className="navigation-buttons">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0 && questionOrder.indexOf(activeQuestionType) === 0}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === (groupedQuestions[activeQuestionType]?.length || 0) - 1 &&
                           questionOrder.indexOf(activeQuestionType) === questionOrder.length - 1}
                >
                  Next
                </button>
              </div>

              <button
                className="btn btn-success submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit & View Results
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTaking; 