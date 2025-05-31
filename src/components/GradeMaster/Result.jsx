import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./Result.css";
import Table from './common/Table'; // Import the Table component

const MAX_FEEDBACK_LENGTH = 50; // Maximum characters to display before truncation

const Result = () => {
  const { state } = useLocation();
  const { 
    feedbackId, 
    questionPaperTitle, 
    questionPaperBoard, 
    questionPaperTotalMarks, 
    questionPaperTotalQuestions,
    questionPaperType
  } = state;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/grade/question-feedback/${feedbackId}/`
        );

        const responseData = response.data;
        console.log('Feedback details:', responseData.feedback_details);

        // Initialize the expanded state for each feedback item
        const feedbackDetailsWithState = responseData.feedback_details.map((item) => ({
          ...item,
          expanded: false
        }));

        setResult({ 
          ...responseData, 
          feedback_details: feedbackDetailsWithState
        });
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.response?.data?.error || "Failed to fetch the result.");
      } finally {
        setLoading(false);
      }
    };

    if (feedbackId) {
      fetchResult();
    } else {
      setError("No feedback ID provided");
      setLoading(false);
    }
  }, [feedbackId]);

  const handleReadMoreToggle = (index) => {
    setResult((prevState) => {
      const updatedFeedbackDetails = prevState.feedback_details.map((item, idx) =>
        idx === index ? { ...item, expanded: !item.expanded } : item
      );
      return { ...prevState, feedback_details: updatedFeedbackDetails };
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

  // Calculate total marks from feedback details
  const totalMarksObtainedSum = result?.feedback_details?.reduce((sum, item) => sum + parseFloat(item.marksObtained || item.marks_obtained || 0), 0).toFixed(2);
  const totalMarksOutOfSum = result?.feedback_details?.reduce((sum, item) => sum + parseFloat(item.marksOutOf || item.marks_out_of || 0), 0).toFixed(2);

  // Define columns for the detailed feedback table
  const feedbackColumns = [
    { header: 'Question No', accessor: 'questionNumber' },
    { header: 'Marks Obtained', accessor: 'marksObtained' },
    { header: 'Out of', accessor: 'marksOutOf' },
    { header: 'Feedback', accessor: 'feedback' },
    { header: 'Complexity', accessor: 'complexity' },
  ];

  // Render cell content, including the Read More/Less functionality for feedback
  const renderFeedbackCell = (column, item, index, handleToggle) => {
      const value = item[column.accessor];

      if (column.accessor === 'feedback') {
           return (
            <div className="feedback-cell">
               {/* Show full feedback if expanded, otherwise truncate */}
               {item.expanded ? value : 
                (value && value.length > MAX_FEEDBACK_LENGTH
                  ? `${value.slice(0, MAX_FEEDBACK_LENGTH)}...`
                  : value)
               }
               {/* Show Read More/Less button if feedback is long */}
               {value && value.length > MAX_FEEDBACK_LENGTH && (
                  <button
                    className="read-more-btn"
                    onClick={() => handleToggle(index)}
                  >
                    {item.expanded ? "Read Less" : "Read More"}
                  </button>
                )}
            </div>
           );
      } else if (column.accessor === 'questionNumber') {
          return item.questionNumber || item.question_number || (index + 1);
      } else if (column.accessor === 'marksObtained') {
          return item.marksObtained || item.marks_obtained || '-';
      } else if (column.accessor === 'marksOutOf') {
          return item.marksOutOf || item.marks_out_of || '-';
      } else if (column.accessor === 'complexity') {
          return item.complexity || '-';
      }
      
      return value; // Default rendering
  };

  return (
    <div className="result-page">
      <div className="result-main-content-container">
        <h2 className="result-title">Result Details</h2>

        <div className="result-total">
          <h3>Total Marks: {totalMarksObtainedSum} / {questionPaperTotalMarks || totalMarksOutOfSum}</h3>
        </div>

        {result ? (
          <div className="result-container">
            <h3 className="result-section-title">Feedback Overview</h3>
            <div className="result-summary">
              <div>
                <span className="label">Question Paper Title:</span> {questionPaperTitle || questionPaperType || 'N/A'}
              </div>
              <div>
                <span className="label">Board:</span> {questionPaperBoard || 'N/A'}
              </div>
              <div>
                <span className="label">Total Questions:</span> {questionPaperTotalQuestions || (result?.feedback_details?.length || 'N/A')}
              </div>
              <div>
                <span className="label">Total Marks:</span> {questionPaperTotalMarks || totalMarksOutOfSum || 'N/A'}
              </div>
            </div>

            <h3 className="result-section-title">Detailed Feedback</h3>
            <Table
              columns={feedbackColumns}
              data={result.feedback_details}
              emptyMessage="No detailed feedback available."
              renderCell={(column, row, index) => renderFeedbackCell(column, row, index, handleReadMoreToggle)}
            />
          </div>
        ) : (
          <p className="error">
            No result found for the provided Feedback ID: <strong>{feedbackId}</strong>.
          </p>
        )}
      </div>
    </div>
  );
};

export default Result;
