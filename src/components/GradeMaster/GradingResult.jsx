import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GradingResult.css';
import Table from './common/Table'; // Import the Table component

// Placeholder for MAX_FEEDBACK_LENGTH if needed for truncating feedback text
const MAX_FEEDBACK_LENGTH = 100; // Adjust as needed

const GradingResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    resultData, 
    questionPaper, 
    questionPaperType, // Destructure questionPaperTitle
    questionPaperBoard, // Destructure questionPaperBoard
    questionPaperTotalMarks, // Destructure questionPaperTotalMarks
    questionPaperTotalQuestions // Destructure questionPaperTotalQuestions
  } = location.state || {}; // Get questionPaper details
  const [gradedResults, setGradedResults] = useState(null); // State to hold graded results with expanded state

  // Debug: Log the location state and resultData
  // console.log('GradingResult location.state:', location.state);
  // console.log('GradingResult resultData:', resultData);
  // console.log('GradingResult questionPaper:', questionPaper);

  useEffect(() => {
    if (resultData && resultData.results) {
      // Initialize expanded state for each feedback item
      const initialGradedResults = resultData.results.map(item => ({
        ...item,
        expanded: false,
      }));
      setGradedResults({ ...resultData, results: initialGradedResults });
    } else if (!resultData) {
         // Set gradedResults to null if resultData is not available to show the error message
        setGradedResults(null);
    }
  }, [resultData]);

  if (!gradedResults) {
    return (
      <div className="gr-page">
        <div className="gr-error-container">
          <h2>No Grading Result Found</h2>
          <p>The grading result data is not available.</p>
          <button onClick={() => navigate(-1)} className="gr-back-button">
            <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Function to toggle the expanded state of a feedback item
  const handleReadMoreToggle = (index) => {
    // console.log('Read More/Less button clicked for index:', index);
    setGradedResults(prevState => {
      const updatedResults = prevState.results.map((item, idx) =>
        idx === index ? { ...item, expanded: !item.expanded } : item
      );
      // console.log('Updated results state:', updatedResults);
      return { ...prevState, results: updatedResults };
    });
  };

  // Define columns for the detailed feedback table
  const feedbackColumns = [
    { header: 'Question No', accessor: 'question_number' },
    { header: 'Marks Obtained', accessor: 'obtained_marks' },
    { header: 'Out of', accessor: 'allocated_marks' },
    { header: 'Feedback', accessor: 'feedback' },
  ];

  // Render cell content, including the Read More/Less functionality for feedback and fallbacks
  const renderFeedbackCell = (column, item, index, handleToggle) => {
      const value = item[column.accessor];

      if (column.accessor === 'feedback') {
          // Use summary instead of feedback
          const summary = item.summary || 'No summary available';
          return (
            <div className="gr-feedback-cell">
               {/* Show full summary if expanded, otherwise truncate */}
               {item.expanded ? summary : 
                (summary && summary.length > MAX_FEEDBACK_LENGTH
                  ? `${summary.slice(0, MAX_FEEDBACK_LENGTH)}...`
                  : summary)
               }
               {/* Show Read More/Less button if summary is long */}
               {summary && summary.length > MAX_FEEDBACK_LENGTH && (
                  <button
                    className="gr-read-more-btn"
                    onClick={() => handleToggle(index)}
                  >
                    {item.expanded ? "Read Less" : "Read More"}
                  </button>
                )}
            </div>
          );
      } else if (column.accessor === 'question_number') {
          return item.question_number || (index + 1);
      } else if (column.accessor === 'obtained_marks') {
          return item.obtained_marks || '-';
      } else if (column.accessor === 'allocated_marks') {
          return item.allocated_marks || '-';
      }
      
      return value; // Default rendering for other columns if any were added
  };

  // Extract relevant data for overview
  // Use destructured variables directly, with fallback to questionPaper object if needed
  const displayQuestionPaperTitle = questionPaperType || questionPaper?.title || 'N/A';
  const displayQuestionPaperBoard = questionPaperBoard || questionPaper?.board || 'N/A';
  const displayTotalQuestions = questionPaperTotalQuestions || gradedResults.results?.length || 'N/A';
  const displayTotalMarksPaper = questionPaperTotalMarks || questionPaper?.total_marks || 'N/A';


  return (
    <div className="gr-page">
      <div className="gr-main-content-container">
        <div className="gr-header">
          <h2 className="gr-title">Grading Result Details</h2>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/grade-master/full-grading-details', { state: { resultData: gradedResults } })}
              className="gr-detailed-grading-button"
              style={{ marginLeft: '10px' }}
            >
              Detailed Grading
            </button>
          </div>
        </div>

        <div className="gr-container">
          {/* Total Marks */}
          <div className="gr-total">
            <h3>Total Marks: {gradedResults.total_score} / {gradedResults.max_possible_score}</h3>
          </div>

          {/* Feedback Overview Section */}
          <h3 className="gr-section-title">Feedback Overview</h3>
          <div className="gr-summary">
            <span className="gr-label">Question Paper Title:</span> {displayQuestionPaperTitle}
            <br/>
            <span className="gr-label">Board:</span> {displayQuestionPaperBoard}
            <br/>
            <span className="gr-label">Total Questions:</span> {displayTotalQuestions}
            <br/>
          </div>

          {/* Detailed Feedback Table */}
          <div className="gr-detailed-feedback">
            <h3 className="gr-section-title">Detailed Feedback</h3>
            <Table
              columns={feedbackColumns}
              data={gradedResults.results}
              emptyMessage="No detailed feedback available."
              renderCell={(column, row, index) => renderFeedbackCell(column, row, index, handleReadMoreToggle)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingResult; 