import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import SimpleDocViewer from "./SimpleDocViewer";
import "./Correct.css";

const getFileUrl = (file, type) => {
  if (!file) return "";
  
  const basePath = "http://127.0.0.1:8000/media/";
  const fileName = file.split("/").pop();
  
  if (type === 'question_paper') {
    // Determine the folder based on the file path
    let folder = "";
    if (file.includes("/sample/")) {
      folder = "question_papers/sample/";
    } else if (file.includes("/previous_year/")) {
      folder = "question_papers/previous_year/";
    } else if (file.includes("/generated/")) {
      folder = "question_papers/generated/";
    } else if (file.includes("/qp_uploader/")) {
      folder = "question_papers/qp_uploader/";
    } else {
      folder = "question_papers/";
    }
    return `${basePath}${folder}${fileName}`;
  } else if (type === 'answer') {
    // For answer files, check if it's in a specific folder
    if (file.includes("/answer_uploads/")) {
      return `${basePath}answer_uploads/${fileName}`;
    }
    return `${basePath}answers/${fileName}`;
  }
  return "";
};

const Correct = () => {
  const location = useLocation();
  const { userData, answer } = location.state;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const marksDistribution = answer.question_marks || [];
    const totalQuestions = answer.total_question || 0;

    const questionsList = [];
    let questionNumber = 1;

    marksDistribution.forEach(({ count, marks }) => {
      for (let i = 0; i < count; i++) {
        if (questionNumber > totalQuestions) break;
        questionsList.push({
          questionNumber,
          feedback: "",
          marksObtained: "",
          marksOutOf: marks,
          complexity: "easy",
          saved: false,
        });
        questionNumber++;
      }
    });

    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/grade/get_feedback/${answer.answer_id}/`
        );
        const feedbackData = response.data;

        const updatedQuestions = questionsList.map((q) => {
          const feedback = feedbackData.find(
            (f) => f.question_number === q.questionNumber
          );
          if (feedback) {
            return {
              ...q,
              marksObtained: feedback.marks_obtained,
              feedback: feedback.feedback,
              complexity: feedback.complexity,
              saved: true,
            };
          }
          return q;
        });

        setQuestions(updatedQuestions);
        setError(null);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setError("Failed to load feedback data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [answer]);

  const handleFeedbackChange = (index, field, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === index) {
          if (field === "marksObtained" && value > q.marksOutOf) {
            return {
              ...q,
              [field]: value,
              error: "Marks obtained cannot exceed maximum marks.",
            };
          } else {
            return { ...q, [field]: value, error: "" };
          }
        }
        return q;
      })
    );
  };

  const handleBack = () => {
    navigate("/grade-master/evaluator");
  };

  const questionPaperUrl = getFileUrl(answer.question_paper_file, 'question_paper');
  const answerFileUrl = getFileUrl(answer.answer_file, 'answer');

  const handleSaveFeedback = async (index) => {
    const question = questions[index];

    if (!question.marksObtained) {
      alert("Marks Obtained is required.");
      return;
    }

    try {
      const payload = {
        answerUploadId: answer.answer_id,
        feedback: [
          {
            questionNumber: question.questionNumber,
            marksObtained: parseFloat(question.marksObtained),
            marksOutOf: question.marksOutOf,
            feedback: question.feedback,
            complexity: question.complexity,
          },
        ],
      };

      await axios.post(
        "http://127.0.0.1:8000/api/grade/save_feedback_for/",
        payload
      );

      setQuestions((prevQuestions) =>
        prevQuestions.map((q, i) => (i === index ? { ...q, saved: true } : q))
      );

      alert("Feedback saved successfully.");
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("An error occurred while saving feedback.");
    }
  };

  const handleEditFeedback = (index) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => (i === index ? { ...q, saved: false } : q))
    );
  };

  const handleSubmitAllFeedback = async () => {
    if (questions.some((q) => !q.saved)) {
      alert("All questions must have feedback saved before submitting.");
      return;
    }

    try {
      const payload = {
        answerUploadId: answer.answer_id,
        feedback: questions,
        email: userData.email,
      };

      await axios.post(
        "http://127.0.0.1:8000/api/grade/save_feedback/",
        payload
      );



      alert("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting feedback.");
    }
  };

  const totalMarksObtained = questions.reduce(
    (sum, q) => sum + (parseFloat(q.marksObtained) || 0),
    0
  );

  const totalMarks = questions.reduce(
    (sum, q) => sum + (parseFloat(q.marksOutOf) || 0),
    0
  );

  return (
    <div className="correct-page">
      <div className="container-cor">
        <div className="back-button-container">
          <button className="back-button-cor" onClick={handleBack}>
            Back to Evaluator
          </button>
        </div>

        <div className="file-viewer-container">
          <div className="file-viewer">
            <h3>Question Paper</h3>
            <div className="viewer-frame">
              {questionPaperUrl ? (
                <SimpleDocViewer 
                  fileUrl={questionPaperUrl}
                  fileType={questionPaperUrl.split('.').pop().toLowerCase()}
                />
              ) : (
                <div className="error-message">Question paper not available</div>
              )}
            </div>
          </div>

          <div className="file-viewer">
            <h3>Answer Sheet</h3>
            <div className="viewer-frame">
              {answerFileUrl ? (
                <SimpleDocViewer 
                  fileUrl={answerFileUrl}
                  fileType={answerFileUrl.split('.').pop().toLowerCase()}
                />
              ) : (
                <div className="error-message">Answer sheet not available</div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Loading feedback data...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="container-feed">
            <div className="feedback-header">
              <h2>Evaluate</h2>
              <div className="total-marks">
                Total Marks: {totalMarksObtained} / {totalMarks}
              </div>
            </div>

            <div className="feedback-container">
              <table className="feedback-table">
                <thead>
                  <tr>
                    <th>Q No</th>
                    <th>Max marks</th>
                    <th>Marks obtained</th>
                    <th>Question's Complexity</th>
                    <th>Comments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr key={q.questionNumber}>
                      <td className="marks-column">{q.questionNumber}</td>
                      <td className="marks-column">{q.marksOutOf}</td>
                      <td className="marks-column">
                        <input
                          type="number"
                          value={q.marksObtained}
                          style={{backgroundColor:"white",color:"black"}}
                          onChange={(e) =>
                            handleFeedbackChange(
                              index,
                              "marksObtained",
                              e.target.value
                            )
                          }
                          disabled={q.saved}
                        />
                        {q.error && <div className="err">{q.error}</div>}
                      </td>
                      <td className="complexity-column marks-column">
                        <select
                          value={q.complexity}
                          onChange={(e) =>
                            handleFeedbackChange(
                              index,
                              "complexity",
                              e.target.value
                            )
                          }
                          disabled={q.saved}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </td>
                      <td className="feedback-column">
                        <textarea
                          value={q.feedback}
                          onChange={(e) =>
                            handleFeedbackChange(
                              index,
                              "feedback",
                              e.target.value
                            )
                          }
                          disabled={q.saved}
                          style={{
                            backgroundColor: "white",
                            color: "black",
                            width: "100%",
                            minHeight: "60px",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc"
                          }}
                        />
                      </td>
                      <td>
                        {q.saved ? (
                          <div
                            className="ico"
                            onClick={() => handleEditFeedback(index)}
                          >
                            <p>Edit</p>
                            <FontAwesomeIcon icon={faEdit} title="Edit" />
                          </div>
                        ) : (
                          <div
                            className="ico"
                            onClick={() => handleSaveFeedback(index)}
                          >
                            <p>Save</p>
                            <FontAwesomeIcon icon={faSave} title="Save" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              className="submit-all-button"
              onClick={handleSubmitAllFeedback}
            >
              Submit All Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Correct;