import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Save,
  ImageIcon,
  XCircle,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import "./QuestionPaperGen.css";

// Custom MathJax component
const MathJaxRenderer = ({ math }) => {
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (containerRef.current && window.MathJax) {
      // For MathJax 3.x
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

const QuestionBank = () => {
  const initialQuestionState = {
    id: Date.now(),
    subject: "",
    topic: "",
    examType: "CBSE",
    complexity: "easy",
    type: "multiple-choice",
    questionText: "",
    questionImage: null,
    options: ["", ""],
    correctAnswer: "",
    explanation: "",
    explanationImage: null,
    marks: 1,
  };

  const [questions, setQuestions] = useState([initialQuestionState]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageScale, setImageScale] = useState(1);

  // Add MathJax script to the page
  useEffect(() => {
    if (!window.MathJax) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      script.id = "MathJax-script";
      
      // Configure MathJax
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
        // Cleanup
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

  const examTypes = ["CBSE", "ICSE", "State Board", "JEE", "NEET"];
  const complexityLevels = ["easy", "medium", "hard"];
  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "short-answer", label: "Short Answer" },
    { value: "long-answer", label: "Long Answer" },
  ];

  const ImageModal = ({ image, onClose }) => (
    <div className="qpg-image-modal" onClick={onClose}>
      <img
        src={image}
        alt="Full size preview"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `scale(${imageScale})` }}
      />
      <button className="qpg-image-modal-close" onClick={onClose}>
        <X size={24} />
      </button>
      <div className="qpg-image-controls" onClick={(e) => e.stopPropagation()}>
        <button
          className="qpg-zoom-button"
          onClick={() => setImageScale((prev) => Math.min(prev + 0.25, 3))}
        >
          <ZoomIn size={20} />
        </button>
        <button
          className="qpg-zoom-button"
          onClick={() => setImageScale((prev) => Math.max(prev - 0.25, 0.5))}
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  );

  const handleImageUpload = (questionId, imageType, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === questionId) {
              return {
                ...q,
                [imageType === "question"
                  ? "questionImage"
                  : "explanationImage"]: reader.result,
              };
            }
            return q;
          })
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...initialQuestionState, id: Date.now() },
    ]);
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const addOption = (questionId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, ""] };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options.length > 2) {
          return {
            ...q,
            options: q.options.filter((_, index) => index !== optionIndex),
          };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (questionId) => {
    const questionToSubmit = questions.find((q) => q.id === questionId);
    try {
      const response = await fetch(
        "http://localhost:8000/api/grade/questions/sample/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionToSubmit),
        }
      );

      if (response.ok) {
        // Remove the submitted question from the state if it's not the last one
        if (questions.length > 1) {
          removeQuestion(questionId);
        } else {
          // Reset the question if it's the last one
          setQuestions([{ ...initialQuestionState, id: Date.now() }]);
        }
        alert("Question saved successfully!");
      } else {
        alert("Failed to save question. Please try again.");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Error saving question. Please try again.");
    }
  };

  return (
    <div className="qpg-question-bank-container">
      {questions.map((question, index) => (
        <div key={question.id} className="qpg-question-card">
          <div className="qpg-question-header">
            <h3 className="qpg-question-title">Question {index + 1}</h3>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(question.id)}
                className="qpg-remove-question-btn"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <div className="qpg-question-form">
            <div className="qpg-form-row">
              <div className="qpg-form-group">
                <label>Exam Type</label>
                <select
                  value={question.examType}
                  onChange={(e) =>
                    updateQuestion(question.id, "examType", e.target.value)
                  }
                  className="qpg-form-select"
                >
                  {examTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qpg-form-group">
                <label>Subject</label>
                <select
                  value={question.subject}
                  onChange={(e) =>
                    updateQuestion(question.id, "subject", e.target.value)
                  }
                  className="qpg-form-select"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="English">English</option>
                  <option value="Maths">Maths</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              <div className="qpg-form-group">
                <label>Topic</label>
                <input
                  type="text"
                  value={question.topic}
                  onChange={(e) =>
                    updateQuestion(question.id, "topic", e.target.value)
                  }
                  placeholder="Enter topic"
                  className="qpg-form-control"
                />
              </div>
            </div>

            <div className="qpg-form-row">
              <div className="qpg-form-group">
                <label>Question Type</label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(question.id, "type", e.target.value)
                  }
                  className="qpg-form-select"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qpg-form-group">
                <label>Complexity Level</label>
                <select
                  value={question.complexity}
                  onChange={(e) =>
                    updateQuestion(question.id, "complexity", e.target.value)
                  }
                  className="qpg-form-select"
                >
                  {complexityLevels.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qpg-form-group">
                <label>Marks</label>
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) =>
                    updateQuestion(
                      question.id,
                      "marks",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="qpg-form-control qpg-marks-input"
                  min="1"
                />
              </div>
            </div>

            <div className="qpg-form-group">
              <label>Question Text</label>

              {/* Textarea for input */}
              <textarea
                value={question.questionText}
                onChange={(e) =>
                  updateQuestion(question.id, "questionText", e.target.value)
                }
                className="qpg-form-control"
                rows="3"
                placeholder="Enter question text (which can contain equations in LaTeX format eg: $x^2 + y^2 = z^2$)"
              />

              {/* Live MathJax Preview */}
              <div className="mt-2 p-2 border rounded bg-light text-black">
                <MathJaxRenderer math={question.questionText} />
              </div>
            </div>

            <div className="qpg-image-upload-section">
              <label>Question Image (optional)</label>
              <div className="qpg-upload-container1">
                <label className="qpg-upload-btn">
                  <ImageIcon size={20} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="qpg-d-none"
                    onChange={(e) =>
                      handleImageUpload(question.id, "question", e)
                    }
                  />
                </label>
                {question.questionImage && (
                  <div className="qpg-image-preview">
                    <img
                      src={question.questionImage}
                      alt="Question preview"
                      onClick={() => {
                        setSelectedImage(question.questionImage);
                        setImageScale(1);
                      }}
                    />
                    <button
                      onClick={() =>
                        updateQuestion(question.id, "questionImage", null)
                      }
                      className="qpg-remove-image-btn"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {question.type === "multiple-choice" && (
              <>
                <div className="qpg-options-section">
                  <label>Options</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="qpg-option-row">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === option}
                        onChange={() =>
                          updateQuestion(question.id, "correctAnswer", option)
                        }
                        className="qpg-form-check-input"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) =>
                          updateOption(question.id, optionIndex, e.target.value)
                        }
                        className="qpg-form-control"
                      />
                      {question.options.length > 2 && (
                        <button
                          onClick={() => removeOption(question.id, optionIndex)}
                          className="qpg-remove-option-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(question.id)}
                    className="qpg-add-option-btn"
                  >
                    <PlusCircle size={16} />
                    Add Option
                  </button>
                </div>
                <div className="qpg-selected-answer-section">
                  <label className="qpg-selected-answer-label">
                    Selected Answer
                  </label>
                  <div className="qpg-selected-answer-display">
                    {question.correctAnswer || "No option selected"}
                  </div>
                </div>
              </>
            )}

            <div className="qpg-form-group">
              <label>Explanation/Solution</label>
              <textarea
                value={question.explanation}
                onChange={(e) =>
                  updateQuestion(question.id, "explanation", e.target.value)
                }
                className="qpg-form-control"
                rows="3"
                placeholder="Provide explanation or solution steps..."
              />
              
              {/* Preview for explanation with MathJax */}
              <div className="mt-2 p-2 border rounded bg-light text-black">
                <MathJaxRenderer math={question.explanation} />
              </div>
            </div>

            <div className="qpg-image-upload-section">
              <label>Solution Image (optional)</label>
              <div className="qpg-upload-container1">
                <label className="qpg-upload-btn">
                  <ImageIcon size={20} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="qpg-d-none"
                    onChange={(e) =>
                      handleImageUpload(question.id, "explanation", e)
                    }
                  />
                </label>
                {question.explanationImage && (
                  <div className="qpg-image-preview">
                    <img
                      src={question.explanationImage}
                      alt="Explanation preview"
                      onClick={() => {
                        setSelectedImage(question.explanationImage);
                        setImageScale(1);
                      }}
                    />
                    <button
                      onClick={() =>
                        updateQuestion(question.id, "explanationImage", null)
                      }
                      className="qpg-remove-image-btn"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="qpg-question-actions-row">
              <button
                onClick={() => handleSubmit(question.id)}
                className="qpg-submit-btn"
              >
                <Save size={20} />
                Save Question
              </button>

              <button onClick={addQuestion} className="qpg-add-question-btn">
                <PlusCircle size={20} />
                Add Another Question
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default QuestionBank;