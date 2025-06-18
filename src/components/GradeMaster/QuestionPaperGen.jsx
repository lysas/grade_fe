import React, { useState, useEffect } from "react";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { PageHeader, ProgressSteps } from './common/SharedTestComponents';
import "./QuestionPaperGen.css";

// Custom MathJax component
const MathJaxRenderer = ({ math }) => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      try {
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
          console.error("MathJax typesetting failed:", err);
        });
      } catch (err) {
        console.error("MathJax error:", err);
      }
    }
  }, [math]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: math }} />;
};

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
          <strong>Q{index + 1}:</strong> {question.questionText}
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

const QuestionBank = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "multiple-choice",
    questionText: "",
    marks: 1,
    options: ["", ""],
    correctAnswer: "",
    complexity: "easy",
    questionImage: null,
    explanation: "",
    explanationImage: null,
    showAnswerSection: false,
  });

  // Add MathJax script to the page
  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.id = "MathJax-script";

      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
        },
        options: {
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
          enableMenu: false,
        },
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (window.MathJax && window.MathJax.typesetClear) {
          window.MathJax.typesetClear();
        }
        const script = document.getElementById('MathJax-script');
        if (script) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

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

  const examTypes = ["CBSE", "ICSE", "State Board", "JEE", "NEET"];
  const complexityLevels = ["easy", "medium", "hard"];
  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "short-answer", label: "Short Answer" },
    { value: "long-answer", label: "Long Answer" },
  ];

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'question') {
          setCurrentQuestion({
            ...currentQuestion,
            questionImage: event.target.result
          });
        } else {
          setCurrentQuestion({
            ...currentQuestion,
            explanationImage: event.target.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'question') {
      setCurrentQuestion({
        ...currentQuestion,
        questionImage: null
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        explanationImage: null
      });
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.type === "multiple-choice" && currentQuestion.options.length < 2) {
      alert("Multiple choice questions must have at least two options");
      return;
    }

    setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    setCurrentQuestion({
      type: "multiple-choice",
      questionText: "",
      marks: 1,
      options: ["", ""],
      correctAnswer: "",
      complexity: "easy",
      questionImage: null,
      explanation: "",
      explanationImage: null,
      showAnswerSection: false,
    });
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question before saving.");
      return;
    }

    try {
      let allSucceeded = true;
      for (const questionToSubmit of questions) {
        const questionData = { ...questionToSubmit };
        delete questionData.id;

        try {
          const response = await fetch('/api/organization/questions/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(questionData)
          });

          if (!response.ok) {
            allSucceeded = false;
            console.error(`Failed to save question: ${questionData.questionText}`);
          }
        } catch (error) {
          allSucceeded = false;
          console.error('Error saving question:', error);
        }
      }

      if (allSucceeded) {
        alert("All questions saved successfully!");
        setQuestions([]);
        setCurrentQuestion({
          type: "multiple-choice",
          questionText: "",
          marks: 1,
          options: ["", ""],
          correctAnswer: "",
          complexity: "easy",
          questionImage: null,
          explanation: "",
          explanationImage: null,
          showAnswerSection: false,
        });
      } else {
        alert("Some questions failed to save. Check console for details.");
      }
    } catch (error) {
      console.error("Error saving question bank:", error);
      alert("Error saving question bank. Please try again.");
    }
  };

  const steps = [
    { number: 1, label: 'Basic Details' },
    { number: 2, label: 'Questions' },
    { number: 3, label: 'Review' }
  ];

  return (
    <div className="qpg-question-bank-container container-fluid py-4">
      <PageHeader 
        title="Create Question Bank" 
        onBack={() => window.history.back()} 
      />

      <ProgressSteps currentStep={currentStep} steps={steps} />

      {/* Step Content */}
      <div className="row">
        <div className="col-12">
          {/* Step 1: Basic Details */}
          {currentStep === 1 && (
            <div className="qpg-question-card card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  Basic Information
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Subject</label>
                    <select
                      className="qpg-form-select form-select"
                      value={questions[0]?.subject}
                      onChange={(e) => {
                        const newQuestions = questions.map(q => ({
                          ...q,
                          subject: e.target.value
                        }));
                        setQuestions(newQuestions);
                      }}
                    >
                      <option value="">Select a subject</option>
                      <option value="English">English</option>
                      <option value="Maths">Maths</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Topic</label>
                    <input
                      type="text"
                      className="qpg-form-control form-control"
                      value={questions[0]?.topic}
                      onChange={(e) => {
                        const newQuestions = questions.map(q => ({
                          ...q,
                          topic: e.target.value
                        }));
                        setQuestions(newQuestions);
                      }}
                      placeholder="Enter topic"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Exam Type</label>
                    <select
                      className="qpg-form-select form-select"
                      value={questions[0]?.examType}
                      onChange={(e) => {
                        const newQuestions = questions.map(q => ({
                          ...q,
                          examType: e.target.value
                        }));
                        setQuestions(newQuestions);
                      }}
                    >
                      <option value="">Select an exam type</option>
                      {examTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Questions */}
          {currentStep === 2 && (
            <div className="qpg-question-card card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-question-circle me-2 text-primary"></i>
                  Questions
                </h6>
                <div className="card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="flex-grow-1 me-3">
                        <label className="form-label visually-hidden">Question Text</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={currentQuestion.questionText}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                          placeholder="Question"
                        />
                      </div>
                      <div className="me-3">
                        <label htmlFor="questionImageUpload" className="btn btn-light shadow-sm" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-image fa-lg"></i>
                        </label>
                        <input
                          id="questionImageUpload"
                          type="file"
                          className="d-none"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'question')}
                        />
                      </div>
                      <div className="me-3">
                        <label className="form-label visually-hidden">Question Type</label>
                        <select
                          className="form-select"
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                          style={{ width: '200px' }}
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <button
                          className="btn btn-light shadow-sm"
                          style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                          onClick={handleAddQuestion}
                          disabled={!currentQuestion.questionText}
                        >
                          <i className="fas fa-plus fa-lg"></i>
                        </button>
                      </div>
                    </div>

                    {currentQuestion.questionImage && (
                      <div className="qpg-image-preview mt-3 mb-4">
                        <img
                          src={currentQuestion.questionImage}
                          alt="Question"
                          onClick={() => setSelectedImage(currentQuestion.questionImage)}
                        />
                        <button
                          className="qpg-remove-image-btn"
                          onClick={() => handleRemoveImage('question')}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}

                    {currentQuestion.type === "multiple-choice" && (
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
                                onClick={() => {
                                  if (currentQuestion.options.length <= 2) {
                                    alert("Multiple choice questions must have at least two options");
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
                        </div>
                      </div>
                    )}

                    {/* Answer and Explanation */}
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
                      <div className="d-flex align-items-center">
                        <i className="fas fa-layer-group me-2 text-primary"></i>
                        <span>Complexity:</span>
                        <select
                          className="form-select ms-2"
                          style={{ width: '120px' }}
                          value={currentQuestion.complexity}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, complexity: e.target.value })}
                        >
                          {complexityLevels.map(level => (
                            <option key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="ms-auto">
                        <button
                          type="button"
                          className="qpg-answer-key-button d-flex align-items-center"
                          onClick={() => setCurrentQuestion(prev => ({ ...prev, showAnswerSection: !prev.showAnswerSection }))}
                        >
                          <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                          Answer key
                        </button>
                      </div>
                    </div>

                    {currentQuestion.showAnswerSection && (
                      <div className="mb-4 mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label mb-0">Answer and Explanation</label>
                          <div>
                            <label htmlFor="explanationImageUpload" className="btn btn-light shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                              <i className="fas fa-image fa-lg"></i>
                            </label>
                            <input
                              id="explanationImageUpload"
                              type="file"
                              className="d-none"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'explanation')}
                            />
                          </div>
                        </div>
                        <textarea
                          className="form-control"
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                          rows="3"
                          placeholder="Enter answer and explanation"
                        />
                        {currentQuestion.explanationImage && (
                          <div className="qpg-image-preview mt-3 mb-4">
                            <img
                              src={currentQuestion.explanationImage}
                              alt="Explanation"
                              onClick={() => setSelectedImage(currentQuestion.explanationImage)}
                            />
                            <button
                              className="qpg-remove-image-btn"
                              onClick={() => handleRemoveImage('explanation')}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="qpg-question-card card shadow-sm">
              <div className="card-body">
                <h6 className="card-title mb-4">
                  <i className="fas fa-clipboard-check me-2 text-primary"></i>
                  Review Questions
                </h6>
                {questions.map((question, index) => (
                  <div key={question.id} className="mb-4 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="mb-0">Question {index + 1}</h5>
                      <div>
                        <span className="badge bg-primary me-2">{question.type}</span>
                        <span className="badge bg-secondary">{question.marks} marks</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Question:</strong>
                      <p className="mt-2">{question.questionText}</p>
                      {question.questionImage && (
                        <div className="mt-2">
                          <img
                            src={question.questionImage}
                            alt="Question"
                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                            onClick={() => setSelectedImage(question.questionImage)}
                          />
                        </div>
                      )}
                    </div>
                    {question.type === "multiple-choice" && (
                      <div className="mb-3">
                        <strong>Options:</strong>
                        <ul className="list-unstyled mt-2">
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} className="mb-1">
                              {option === question.correctAnswer ? (
                                <span className="text-success">
                                  <i className="fas fa-check-circle me-2"></i>
                                  {option}
                                </span>
                              ) : (
                                option
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(question.explanation || question.explanationImage) && (
                      <div className="mt-3">
                        <strong>Answer and Explanation:</strong>
                        {question.explanation && (
                          <p className="mt-2">{question.explanation}</p>
                        )}
                        {question.explanationImage && (
                          <div className="mt-2">
                            <img
                              src={question.explanationImage}
                              alt="Explanation"
                              style={{ maxWidth: '100%', maxHeight: '200px' }}
                              onClick={() => setSelectedImage(question.explanationImage)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between mt-4">
            <div>
              {currentStep > 1 && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Previous
                </button>
              )}
            </div>
            <div>
              {currentStep < 3 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={handleSubmit}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Questions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="qpg-image-modal" onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Full size"
            style={{ transform: `scale(${imageScale})` }}
          />
          <button
            className="qpg-image-modal-close"
            onClick={() => setSelectedImage(null)}
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="qpg-image-controls">
            <button
              className="qpg-zoom-button"
              onClick={(e) => {
                e.stopPropagation();
                setImageScale(prev => Math.min(prev + 0.1, 2));
              }}
            >
              <i className="fas fa-search-plus"></i>
            </button>
            <button
              className="qpg-zoom-button"
              onClick={(e) => {
                e.stopPropagation();
                setImageScale(prev => Math.max(prev - 0.1, 0.5));
              }}
            >
              <i className="fas fa-search-minus"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;