import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Result.css";

const MAX_FEEDBACK_LENGTH = 50; // Maximum characters to display before truncation

const Result = () => {
  const { state } = useLocation();
  const { feedbackId } = state; // Directly passed feedback_id from navigation
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/grade/question-feedback/${feedbackId}/`
        );

        // Ensure final_result is parsed to an array if it's a JSON string
        const responseData = response.data;
        if (responseData.final_result && typeof responseData.final_result === "string") {
          responseData.final_result = JSON.parse(responseData.final_result);
        }

        // Initialize the expanded state for each feedback item
        const finalResultWithState = responseData.final_result.map((item) => ({
          ...item,
          expanded: false,
        }));

        setResult({ ...responseData, final_result: finalResultWithState });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch the result.");
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) fetchResult();
  }, [feedbackId]);

  const handleReadMoreToggle = (index) => {
    setResult((prevState) => {
      const updatedFinalResult = prevState.final_result.map((item, idx) =>
        idx === index ? { ...item, expanded: !item.expanded } : item
      );
      return { ...prevState, final_result: updatedFinalResult };
    });
  };

  if (loading) {
    return <p className="loading">Loading result...</p>;
  }

  if (error) {
    return (
      <p className="error">
        {error} (Feedback ID: <strong>{feedbackId}</strong>)
      </p>
    );
  }

  const totalMarksObtained = result?.final_result
    ?.reduce((sum, item) => sum + parseFloat(item.marksObtained || 0), 0)
    .toFixed(2);

  const totalMarksOutOf = result?.final_result
    ?.reduce((sum, item) => sum + parseFloat(item.marksOutOf || 0), 0)
    .toFixed(2);

  return (
    <div className="result-page">
      <h2 className="result-title">Result Details</h2>

      <div className="result-total">
        <h3>Total Marks: {totalMarksObtained} / {totalMarksOutOf}</h3>
      </div>

      {result ? (
        <div className="result-container">
          <h3 className="result-section-title">Feedback Overview</h3>
          <div className="result-summary">
            <div>
              <span className="label">Question Paper Title:</span> {result.question_paper_title}
            </div>
            <div>
              <span className="label">Board:</span> {result.board}
            </div>
            <div>
              <span className="label">Total Questions:</span> {result.total_questions}
            </div>
            <div>
              <span className="label">Total Marks:</span> {result.total_marks}
            </div>
          </div>

          <h3 className="result-section-title">Detailed Feedback</h3>
          <div className="result-table-container">
            <table className="result-table">
              <thead>
                <tr>
                  <th>Question No</th>
                  <th>Marks Obtained</th>
                  <th>Out of</th>
                  <th>Feedback</th>
                  <th>Complexity</th>
                </tr>
              </thead>
              <tbody>
                {result.final_result.map((item, index) => (
                  <tr key={index}>
                    <td>{item.questionNumber}</td>
                    <td>{item.marksObtained}</td>
                    <td>{item.marksOutOf}</td>
                    <td className="feedback-cell">
                      {item.feedback.length > MAX_FEEDBACK_LENGTH && !item.expanded
                        ? `${item.feedback.slice(0, MAX_FEEDBACK_LENGTH)}...`
                        : item.feedback}
                      {item.feedback.length > MAX_FEEDBACK_LENGTH && (
                        <button
                          className="read-more-btn"
                          onClick={() => handleReadMoreToggle(index)}
                        >
                          {item.expanded ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </td>
                    <td>{item.complexity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="error">
          No result found for the provided Feedback ID: <strong>{feedbackId}</strong>.
        </p>
      )}
    </div>
  );
};

export default Result;
