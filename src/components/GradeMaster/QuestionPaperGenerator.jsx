import React, { useState, useEffect } from "react";
import axios from "axios";
import "./QuestionPaperGenerator.css";

const QuestionPaperGenerator = ({ userId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [errorLogs, setErrorLogs] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState("questionTypes"); // "questionTypes", "blooms", "lessons"
  const [showSummary, setShowSummary] = useState(false);
  
  // State for question type counts
  const [questionTypeCounts, setQuestionTypeCounts] = useState({
    mcq: 0,
    shortAnswerI: 0,
    shortAnswerII: 0,
    longAnswerI: 0,
    longAnswerII: 0
  });

  // State for Bloom's taxonomy counts per question type
  const [bloomsCounts, setBloomsCounts] = useState({
    mcq: {
      remembering: 0,
      understanding: 0,
      applying: 0,
      analyzing: 0,
      evaluating: 0
    },
    shortAnswerI: {
      remembering: 0,
      understanding: 0,
      applying: 0,
      analyzing: 0,
      evaluating: 0
    },
    shortAnswerII: {
      remembering: 0,
      understanding: 0,
      applying: 0,
      analyzing: 0,
      evaluating: 0
    },
    longAnswerI: {
      remembering: 0,
      understanding: 0,
      applying: 0,
      analyzing: 0,
      evaluating: 0
    },
    longAnswerII: {
      remembering: 0,
      understanding: 0,
      applying: 0,
      analyzing: 0,
      evaluating: 0
    }
  });

  // State for lesson question counts
  const [lessonQuestionCounts, setLessonQuestionCounts] = useState({});

  // State for selected question type
  const [selectedQuestionType, setSelectedQuestionType] = useState("");
  const [selectedBloomsType, setSelectedBloomsType] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  // Add these for the new UI logic
  const [bloomsSpecific, setBloomsSpecific] = useState(false);
  const [lessonSpecific, setLessonSpecific] = useState(false);
  const [validationError, setValidationError] = useState("");

  // For storing bloom pairs and lesson pairs for each type
  const [bloomsPairs, setBloomsPairs] = useState({}); // { mcq: [{level: 'remembering', count: 2}, ...], ... }
  const [lessonsPairs, setLessonsPairs] = useState({}); // { mcq: [{lesson: 'Lesson 1', count: 2}, ...], ... }
  // For current selection in add-pair UI
  const [currentBlooms, setCurrentBlooms] = useState({}); // { mcq: {level: '', count: ''}, ... }
  const [currentLessons, setCurrentLessons] = useState({}); // { mcq: {lesson: '', count: ''}, ... }

  // Fetch lessons when subject changes
  useEffect(() => {
    const fetchLessons = async () => {
      if (!subject) {
        setLessons([]);
        setLessonQuestionCounts({});
        return;
      }

      try {
        const response = await axios.get(`http://127.0.0.1:5000/get_lessons/${subject}`);
        if (response.data && response.data.lessons) {
          setLessons(response.data.lessons);
          // Initialize lesson question counts
          const initialCounts = {};
          response.data.lessons.forEach(lesson => {
            initialCounts[lesson] = {
              mcq: 0,
              shortAnswerI: 0,
              shortAnswerII: 0,
              longAnswerI: 0,
              longAnswerII: 0
            };
          });
          setLessonQuestionCounts(initialCounts);
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        setError("Failed to fetch lessons. Please try again.");
        logError(`Error fetching lessons: ${err.message}`);
      }
    };

    fetchLessons();
  }, [subject]);

  // Helper function to update question type counts
  const updateQuestionTypeCount = (type, count) => {
    setQuestionTypeCounts(prev => ({
      ...prev,
      [type]: parseInt(count) || 0
    }));
  };

  // Helper function to update Bloom's counts
  const updateBloomsCount = (questionType, level, count) => {
    setBloomsCounts(prev => ({
      ...prev,
      [questionType]: {
        ...prev[questionType],
        [level]: parseInt(count) || 0
      }
    }));
  };

  // Helper function to update lesson question count
  const updateLessonQuestionCount = (lesson, questionType, count) => {
    setLessonQuestionCounts(prev => ({
      ...prev,
      [lesson]: {
        ...prev[lesson],
        [questionType]: parseInt(count) || 0
      }
    }));
  };

  // Helper function to log errors
  const logError = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setErrorLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  // Map for display labels
  const typeLabelMap = {
    mcq: 'MCQ',
    shortAnswerI: 'Short Answer Type I',
    shortAnswerII: 'Short Answer Type II',
    longAnswerI: 'Long Answer Type I',
    longAnswerII: 'Long Answer Type II'
  };

  // Helper to build a brief summary
  const getBriefSummary = () => {
    const summary = [];
    // Question Types
    Object.entries(questionTypeCounts).forEach(([type, count]) => {
      if (count > 0) summary.push(`${typeLabelMap[type]}: ${count}`);
    });
    // Blooms
    Object.entries(bloomsCounts).forEach(([type, levels]) => {
      Object.entries(levels).forEach(([level, count]) => {
        if (count > 0) summary.push(`${typeLabelMap[type]} (${level.charAt(0).toUpperCase() + level.slice(1)}): ${count}`);
      });
    });
    // Lessons
    Object.entries(lessonQuestionCounts).forEach(([lesson, counts]) => {
      Object.entries(counts).forEach(([type, count]) => {
        if (count > 0) summary.push(`${lesson} - ${typeLabelMap[type]}: ${count}`);
      });
    });
    return summary;
  };

  // Add this helper function to check if any questions are selected
  const hasSelectedQuestions = () => {
    return Object.values(questionTypeCounts).some(count => count > 0);
  };

  // Modify the toggle handlers to include validation and clearing
  const handleBloomsSpecificToggle = (value) => {
    if (value && !hasSelectedQuestions()) {
      alert("Please select the number of questions above before configuring Bloom's levels");
      setBloomsSpecific(false);
      return;
    }
    if (!value) {
      // Clear all Bloom's distributions when switching to No
      setBloomsPairs({});
      setCurrentBlooms({});
      setSelectedBloomsType("");
    }
    setValidationError("");
    setBloomsSpecific(value);
  };

  const handleLessonSpecificToggle = (value) => {
    if (value && !hasSelectedQuestions()) {
      alert("Please select the number of questions above before configuring lesson-wise distribution");
      setLessonSpecific(false);
      return;
    }
    if (!value) {
      // Clear all lesson distributions when switching to No
      setLessonsPairs({});
      setCurrentLessons({});
      setSelectedLesson("");
    }
    setValidationError("");
    setLessonSpecific(value);
  };

  // Modified handleSubmit: directly generate instead of showing confirmation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Please enter a subject name");
      logError("Form submission failed: Missing subject name");
      return;
    }
    const hasQuestionType = Object.values(questionTypeCounts).some(count => count > 0);
    if (!hasQuestionType) {
      setError("Please specify at least one question in any section");
      logError("Form submission failed: No questions specified in any section");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Build payload as per required JSON
      const questionSelection = {};
      const lessonConfig = {};
      // Add main question type counts (subtracting blooms and lesson pairs)
      questionTypes.forEach(type => {
        const typeLabel = typeLabelMap[type.id];
        const mainCount = Number(questionTypeCounts[type.id]) || 0;
        // Sum of all bloom and lesson pairs for this type
        const bloomSum = (bloomsPairs[type.id] || []).reduce((a, b) => a + Number(b.count), 0);
        const lessonSum = (lessonsPairs[type.id] || []).reduce((a, b) => a + Number(b.count), 0);
        // Unclassified count
        const unclassified = mainCount - (bloomSum + lessonSum);
        if (unclassified > 0) {
          lessonConfig[typeLabel] = unclassified;
        }
      });
      // Blooms
      const bloomsLevelConfig = {};
      questionTypes.forEach(type => {
        const typeLabel = typeLabelMap[type.id];
        (bloomsPairs[type.id] || []).forEach(pair => {
          const bloomLabel = bloomsLevels.find(l => l.toLowerCase() === pair.level) || pair.level;
          if (!bloomsLevelConfig[bloomLabel]) bloomsLevelConfig[bloomLabel] = {};
          bloomsLevelConfig[bloomLabel][typeLabel] = Number(pair.count);
        });
      });
      if (Object.keys(bloomsLevelConfig).length > 0) {
        lessonConfig.blooms_level = bloomsLevelConfig;
      }
      // Lessons
      const classifiedLessonConfig = {};
      questionTypes.forEach(type => {
        const typeLabel = typeLabelMap[type.id];
        (lessonsPairs[type.id] || []).forEach(pair => {
          if (!classifiedLessonConfig[pair.lesson]) classifiedLessonConfig[pair.lesson] = {};
          classifiedLessonConfig[pair.lesson][typeLabel] = Number(pair.count);
        });
      });
      if (Object.keys(classifiedLessonConfig).length > 0) {
        lessonConfig.classified_lesson = classifiedLessonConfig;
      }
      questionSelection['placeholder_filename.xlsx'] = lessonConfig;
      const configData = {
        inputDir: subject,
        outputDir: "generated_pdfs",
        imageRepo: "images",
        uploadToApi: true,
        user_id: userId,
        config: {
          question_selection: questionSelection
        }
      };
      console.log('Config data to be sent to backend:', configData);
      logError(`Sending API request with config: ${JSON.stringify(configData, null, 2)}`);
      const response = await axios.post(
        "http://127.0.0.1:5000/process",
        configData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      // Check if any result has error status
      const hasError = response.data.results?.some(result => result.status === "error");
      if (hasError) {
        const errorMessage = response.data.results[0].message || "Error generating question paper";
        setError(errorMessage);
        alert(errorMessage);
        if (response.data.results[0].processing_log) {
          response.data.results[0].processing_log.forEach(log => {
            logError(log);
          });
        }
      } else {
        alert("Question paper generated successfully!");
        // onClose();
      }
    } catch (err) {
      console.error("Error generating question paper:", err);
      const errorDetails = err.response?.data?.message || err.message;
      setError("Error generating question paper: " + errorDetails);
      alert("Error generating question paper: " + errorDetails);
      logError(`API error: ${errorDetails}`);
      if (err.response) {
        logError(`Response status: ${err.response.status}`);
        logError(`Response data: ${JSON.stringify(err.response.data)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubject("");
    setLessons([]);
    setQuestionTypeCounts({
      mcq: 0,
      shortAnswerI: 0,
      shortAnswerII: 0,
      longAnswerI: 0,
      longAnswerII: 0
    });
    setBloomsCounts({
      mcq: {
        remembering: 0,
        understanding: 0,
        applying: 0,
        analyzing: 0,
        evaluating: 0
      },
      shortAnswerI: {
        remembering: 0,
        understanding: 0,
        applying: 0,
        analyzing: 0,
        evaluating: 0
      },
      shortAnswerII: {
        remembering: 0,
        understanding: 0,
        applying: 0,
        analyzing: 0,
        evaluating: 0
      },
      longAnswerI: {
        remembering: 0,
        understanding: 0,
        applying: 0,
        analyzing: 0,
        evaluating: 0
      },
      longAnswerII: {
        remembering: 0,
        understanding: 0,
        applying: 0,
        analyzing: 0,
        evaluating: 0
      }
    });
    setLessonQuestionCounts({});
    setError("");
    setSelectedConfig("questionTypes");
    setSelectedQuestionType("");
    setSelectedBloomsType("");
    setSelectedLesson("");
  };

  const clearErrorLogs = () => {
    setErrorLogs([]);
  };

  const bloomsLevels = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating'];
  const questionTypes = [
    { id: 'mcq', label: 'MCQ' },
    { id: 'shortAnswerI', label: 'Short Answer Type I' },
    { id: 'shortAnswerII', label: 'Short Answer Type II' },
    { id: 'longAnswerI', label: 'Long Answer Type I' },
    { id: 'longAnswerII', label: 'Long Answer Type II' }
  ];

  return (
    <div className="questionPaperGenerator">
      <div className="generatorHeader">
        <h2>Create Question Paper</h2>
      </div>

      <form onSubmit={handleSubmit} className="generatorForm">
        {error && (
          <div className="errorMessage" role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
            </svg>
            {error}
          </div>
        )}

        {validationError && (
          <div className="errorMessage" role="alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
            </svg>
            {validationError}
          </div>
        )}
        
        {/* Subject Name Dropdown */}
        <div className="formSection">
          <div className="subjectContainer">
            <label htmlFor="subject-name">Subject Name</label>
            <select
              id="subject-name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="subjectField"
            >
              <option value="">Select a subject</option>
              <option value="Accountancy">Accountancy</option>
              <option value="History">History</option>
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Business_Studies">Business Studies</option>
              <option value="Computer_Science">Computer Science</option>
              <option value="Economics">Economics</option>
              <option value="English">English</option>
              <option value="Geography">Geography</option>
              <option value="Political_Science">Political Science</option>
              <option value="Psychology">Psychology</option>
            </select>
          </div>
        </div>

        {/* Question Types Inputs */}
        {subject && (
          <>
            <div className="formSection">
              <h4>Question Type Distribution</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '24px', flexWrap: 'wrap' }}>
                {questionTypes.map(type => (
                  <div key={type.id} style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', minWidth: '180px', maxWidth: '220px' }}>
                    <label style={{ marginBottom: '6px', fontWeight: 500 }}>{type.label}</label>
                    <input
                      type="number"
                      value={questionTypeCounts[type.id]}
                      onChange={(e) => {
                        updateQuestionTypeCount(type.id, e.target.value);
                        setValidationError(""); // Clear validation error when questions are updated
                      }}
                      min="0"
                      placeholder="Enter count"
                      className="countField"
                      style={{ 
                        WebkitAppearance: 'textfield',
                        MozAppearance: 'textfield',
                        appearance: 'textfield'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Yes/No Questions */}
            <div className="formSection">
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                    Do you need Bloom's level-specific number of questions?
                  </label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-btn${bloomsSpecific ? ' active' : ''}`}
                      onClick={() => handleBloomsSpecificToggle(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" fill="currentColor"/>
                      </svg>
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn${!bloomsSpecific ? ' active' : ''}`}
                      onClick={() => handleBloomsSpecificToggle(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="currentColor"/>
                      </svg>
                      No
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <label style={{ fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                    Do you need lesson-wise specific number of questions?
                  </label>
                  <div className="toggle-group">
                    <button
                      type="button"
                      className={`toggle-btn${lessonSpecific ? ' active' : ''}`}
                      onClick={() => handleLessonSpecificToggle(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" fill="currentColor"/>
                      </svg>
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn${!lessonSpecific ? ' active' : ''}`}
                      onClick={() => handleLessonSpecificToggle(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="currentColor"/>
                      </svg>
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloom's Level Inputs */}
            {bloomsSpecific && (
              <div className="formSection">
                  <h4>Bloom's Level Distribution</h4>
                {!hasSelectedQuestions() ? (
                  <div className="errorMessage" role="alert">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
                    </svg>
                    Please select the number of questions above before configuring Bloom's levels
                  </div>
                ) : (
                    <div className="distributionControls">
                      <div className="controlGroup">
                        <select
                          value={selectedQuestionType || ''}
                          onChange={e => setSelectedQuestionType(e.target.value)}
                          className="controlSelect"
                        >
                        <option value=''>Question Type</option>
                          {questionTypes.filter(type => questionTypeCounts[type.id] > 0).map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="controlGroup">
                        <select
                          value={selectedBloomsType || ''}
                          onChange={e => setSelectedBloomsType(e.target.value)}
                          className="controlSelect"
                        >
                        <option value=''>Bloom's Level</option>
                          {bloomsLevels.map(level => (
                            <option key={level} value={level.toLowerCase()}>{level}</option>
                          ))}
                        </select>
                      </div>
                      <div className="controlGroup">
                        <input
                          type="number"
                          min="1"
                          max={selectedQuestionType ? 
                            (questionTypeCounts[selectedQuestionType] - 
                             ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                              (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0))) : 0}
                          value={selectedQuestionType && selectedBloomsType ? (currentBlooms[selectedQuestionType]?.count || '') : ''}
                          onChange={e => {
                            if (!selectedQuestionType) return;
                            const maxAllowed = questionTypeCounts[selectedQuestionType] - 
                              ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                               (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0));
                            const value = Math.min(Number(e.target.value), maxAllowed);
                            setCurrentBlooms(prev => ({ 
                              ...prev, 
                              [selectedQuestionType]: { 
                                ...prev[selectedQuestionType], 
                                level: selectedBloomsType,
                                count: value 
                              } 
                            }));
                          }}
                        placeholder="Count"
                          className="controlInput"
                          disabled={!selectedQuestionType || !selectedBloomsType}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedQuestionType || !selectedBloomsType || !currentBlooms[selectedQuestionType]?.count) return;
                          
                          const newCount = Number(currentBlooms[selectedQuestionType].count);
                          const remaining = questionTypeCounts[selectedQuestionType] - 
                            ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                             (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0));
                          
                          if (newCount > remaining) {
                            alert(`Cannot add ${newCount} questions. Only ${remaining} questions remaining for this type.`);
                            return;
                          }

                          setBloomsPairs(prev => ({
                            ...prev,
                            [selectedQuestionType]: [...(prev[selectedQuestionType] || []), {
                              level: selectedBloomsType,
                              count: newCount
                            }]
                          }));

                          setCurrentBlooms(prev => ({
                            ...prev,
                            [selectedQuestionType]: { level: '', count: '' }
                          }));
                          setSelectedBloomsType('');
                        }}
                        disabled={!selectedQuestionType || !selectedBloomsType || !currentBlooms[selectedQuestionType]?.count}
                        className="addButton"
                      >
                        Add Distribution
                      </button>
                    </div>
                )}
              </div>
            )}

            {/* Lesson-wise Inputs */}
            {lessonSpecific && (
              <div className="formSection">
                  <h4>Lesson-wise Distribution</h4>
                {!hasSelectedQuestions() ? (
                  <div className="errorMessage" role="alert">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
                    </svg>
                    Please select the number of questions above before configuring lesson-wise distribution
                  </div>
                ) : lessons.length > 0 ? (
                    <div className="distributionControls">
                      <div className="controlGroup">
                        <select
                          value={selectedQuestionType || ''}
                          onChange={e => setSelectedQuestionType(e.target.value)}
                          className="controlSelect"
                        >
                        <option value=''>Question Type</option>
                          {questionTypes.filter(type => questionTypeCounts[type.id] > 0).map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="controlGroup">
                        <select
                          value={selectedLesson || ''}
                          onChange={e => setSelectedLesson(e.target.value)}
                          className="controlSelect"
                        >
                        <option value=''>Lesson</option>
                          {lessons.map(lesson => (
                            <option key={lesson} value={lesson}>{lesson}</option>
                          ))}
                        </select>
                      </div>
                      <div className="controlGroup">
                        <input
                          type="number"
                          min="1"
                          max={selectedQuestionType ? 
                            (questionTypeCounts[selectedQuestionType] - 
                             ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                              (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0))) : 0}
                          value={selectedQuestionType && selectedLesson ? (currentLessons[selectedQuestionType]?.count || '') : ''}
                          onChange={e => {
                            if (!selectedQuestionType) return;
                            const maxAllowed = questionTypeCounts[selectedQuestionType] - 
                              ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                               (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0));
                            const value = Math.min(Number(e.target.value), maxAllowed);
                            setCurrentLessons(prev => ({ 
                              ...prev, 
                              [selectedQuestionType]: { 
                                ...prev[selectedQuestionType], 
                                lesson: selectedLesson,
                                count: value 
                              } 
                            }));
                          }}
                        placeholder="Count"
                          className="controlInput"
                          disabled={!selectedQuestionType || !selectedLesson}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedQuestionType || !selectedLesson || !currentLessons[selectedQuestionType]?.count) return;
                          
                          const newCount = Number(currentLessons[selectedQuestionType].count);
                          const remaining = questionTypeCounts[selectedQuestionType] - 
                            ((bloomsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0) + 
                             (lessonsPairs[selectedQuestionType] || []).reduce((a, b) => a + Number(b.count), 0));
                          
                          if (newCount > remaining) {
                            alert(`Cannot add ${newCount} questions. Only ${remaining} questions remaining for this type.`);
                            return;
                          }

                          setLessonsPairs(prev => ({
                            ...prev,
                            [selectedQuestionType]: [...(prev[selectedQuestionType] || []), {
                              lesson: selectedLesson,
                              count: newCount
                            }]
                          }));

                          setCurrentLessons(prev => ({
                            ...prev,
                            [selectedQuestionType]: { lesson: '', count: '' }
                          }));
                          setSelectedLesson('');
                        }}
                        disabled={!selectedQuestionType || !selectedLesson || !currentLessons[selectedQuestionType]?.count}
                        className="addButton"
                      >
                        Add Distribution
                      </button>
                    </div>
                ) : (
                  <div className="errorMessage" role="alert">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                      <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
                    </svg>
                    No lessons available for this subject
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Summary Section */}
        {subject && (
          <div className="formSection">
            <h4>Summary</h4>
            <div className="summaryContainer">
              <div className="summaryTable">
                <table>
                  <thead>
                    <tr>
                      <th className="typeColumn">Question Type</th>
                      <th className="countColumn">Count</th>
                      {bloomsSpecific && <th className="bloomsColumn">Bloom's Level</th>}
                      {lessonSpecific && <th className="lessonColumn">Lesson</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {questionTypes.filter(type => questionTypeCounts[type.id] > 0).map(type => {
                      const bloomsForType = bloomsPairs[type.id] || [];
                      const lessonsForType = lessonsPairs[type.id] || [];
                      const maxRows = Math.max(1, bloomsForType.length, lessonsForType.length);
                      
                      return Array(maxRows).fill().map((_, index) => (
                        <tr key={`${type.id}-${index}`}>
                          {index === 0 ? (
                            <td rowSpan={maxRows} className="typeColumn">{type.label}</td>
                          ) : null}
                          {index === 0 ? (
                            <td rowSpan={maxRows} className="countColumn">{questionTypeCounts[type.id]}</td>
                          ) : null}
                          {bloomsSpecific && (
                            <td className="bloomsColumn">
                              {bloomsForType[index] ? (
                                <div className="distributionCell">
                                  <span>{bloomsForType[index].level.charAt(0).toUpperCase() + bloomsForType[index].level.slice(1)} ({bloomsForType[index].count})</span>
                                  <button
                                    className="removeButton bloomsRemove"
                                    onClick={() => {
                                      setBloomsPairs(prev => ({
                                        ...prev,
                                        [type.id]: prev[type.id].filter((_, i) => i !== index)
                                      }));
                                    }}
                                    title="Remove Bloom's level distribution"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="currentColor"/>
                                    </svg>
                                  </button>
                                </div>
                              ) : '-'}
                            </td>
                          )}
                          {lessonSpecific && (
                            <td className="lessonColumn">
                              {lessonsForType[index] ? (
                                <div className="distributionCell">
                                  <span>{lessonsForType[index].lesson} ({lessonsForType[index].count})</span>
                                  <button
                                    className="removeButton lessonRemove"
                                    onClick={() => {
                                      setLessonsPairs(prev => ({
                                        ...prev,
                                        [type.id]: prev[type.id].filter((_, i) => i !== index)
                                      }));
                                    }}
                                    title="Remove Lesson distribution"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" fill="currentColor"/>
                                    </svg>
                                  </button>
                                </div>
                              ) : '-'}
                            </td>
                          )}
                        </tr>
                      ));
                    })}
                    {getBriefSummary().length === 0 ? (
                      <tr>
                        <td colSpan={2 + (bloomsSpecific ? 1 : 0) + (lessonSpecific ? 1 : 0)} className="noSelection">
                          No selections made yet.
                        </td>
                      </tr>
                    ) : (
                      <tr className="totalRow">
                        <td className="totalLabel">Total Questions</td>
                        <td className="totalValue">{Object.values(questionTypeCounts).reduce((sum, count) => sum + count, 0)}</td>
                        {bloomsSpecific && <td></td>}
                        {lessonSpecific && <td></td>}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </form>
        <div className="formActions">
          <button type="button" onClick={handleReset} className="resetButton">
            Reset
          </button>
          <button type="submit" className="submitButton" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Question Paper"}
          </button>
        </div>

    </div>
  );
};

export default QuestionPaperGenerator;