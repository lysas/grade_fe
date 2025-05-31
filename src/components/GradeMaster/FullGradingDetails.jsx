import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FullGradingDetails.css';

const FullGradingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultData } = location.state || {};

  // Log the received data for debugging
  console.log('FullGradingDetails received resultData:', resultData);

  if (!resultData) {
    return (
      <div className="full-gr-page">
        <div className="full-gr-error-container">
          <h2>No Grading Result Data Available</h2>
          <p>Could not load detailed grading information.</p>
          <button onClick={() => navigate(-1)} className="full-gr-back-button">
            <i className="fas fa-arrow-left"></i> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render text content with proper line breaks
  const renderText = (text) => {
    if (!text) return <p>N/A</p>;
    return (
      <div className="full-gr-text">
        {text.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    );
  };

  // Render tables
  const renderTables = (tables) => {
    if (!tables || !Array.isArray(tables) || tables.length === 0) return <p>N/A</p>;
    return (
      <div className="full-gr-tables">
        {tables.map((table, tableIndex) => (
          <table key={tableIndex} className="full-gr-table">
            <thead>
              <tr>
                {table.heading.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {table.heading.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    );
  };

  // Render equations
  const renderEquations = (equations) => {
    if (!equations || !Array.isArray(equations) || equations.length === 0) return <p>N/A</p>;
    return (
      <div className="full-gr-equations">
        {equations.map((eq, index) => {
          let step, equation;
          
          if (typeof eq === 'object' && eq !== null) {
            step = eq.step || index + 1;
            equation = eq.equation || '';
          } else {
            step = index + 1;
            equation = String(eq);
          }
          
          return (
            <div key={index} className="full-gr-equation-step">
              <span className="full-gr-step-number">Step {step}:</span>
              <span className="full-gr-equation">{equation}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render answer based on type (text, tables, equations)
  const renderAnswer = (answer) => {
    if (!answer) return <p>N/A</p>;
    
    if (typeof answer === 'string') {
      return renderText(answer);
    }

    const hasText = answer.text !== undefined;
    const hasTables = answer.tables && Array.isArray(answer.tables);
    const hasEquations = answer.equations && Array.isArray(answer.equations);
    const hasDiagram = answer.diagram;
    
    // Debug log for diagram data
    console.log('Diagram data:', answer.diagram);
    
    if (!hasText && !hasTables && !hasEquations && !hasDiagram) return <p>N/A</p>;

    return (
      <div className="full-gr-answer-content">
        {hasText && renderText(answer.text)}
        {hasTables && renderTables(answer.tables)}
        {hasEquations && renderEquations(answer.equations)}
        {hasDiagram && (
          <div className="full-gr-diagram">
            {Object.entries(answer.diagram).map(([key, imagePath]) => {
              // Debug log for each diagram
              console.log('Processing diagram:', key, imagePath);
              
              let cleanImagePath = imagePath;
              if (typeof imagePath === 'string') {
                // If it's a base64 image, use it directly
                if (imagePath.startsWith('data:image')) {
                  cleanImagePath = imagePath;
                } else {
                  // Clean up the image path
                  const mediaPathMatch = imagePath.match(/media\/output\/[^\\]+\/images\/[^\\]+$/);
                  if (mediaPathMatch) {
                    cleanImagePath = `http://localhost:8000/${mediaPathMatch[0]}`;
                  } else if (!imagePath.startsWith('http')) {
                    cleanImagePath = `http://localhost:8000/media/${imagePath}`;
                  }
                }
              }
              
              // Debug log for final image path
              console.log('Final image path:', cleanImagePath);
              
              return (
                <div key={key} className="full-gr-diagram-container">
                  <h6>Diagram {key}:</h6>
                  <img 
                    src={cleanImagePath}
                    alt={`Diagram ${key}`}
                    className="full-gr-diagram-image"
                    onError={(e) => {
                      console.error('Image failed to load:', cleanImagePath);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="full-gr-page">
      <div className="full-gr-header">
        <h2 className="full-gr-title">Full Grading Details</h2>

      </div>
      
      <div className="full-gr-container">
        <div className="full-gr-summary">
          <h3>Overall Score: {resultData.total_score} / {resultData.max_possible_score}</h3>
        </div>

        <div className="full-gr-question-details">
          {resultData.results && resultData.results.map((questionResult, index) => (
            <div key={index} className="full-gr-question-card">
              <div className="full-gr-question-header">
                <h4>Question {questionResult.question_number}</h4>
                <span className="full-gr-score">Marks: {questionResult.obtained_marks} / {questionResult.allocated_marks}</span>
              </div>
              
              <div className="full-gr-content-section">
                <h5>Expected Answer:</h5>
                {renderAnswer(questionResult.expected_answer)}
              </div>

              <div className="full-gr-content-section">
                <h5>Student Answer:</h5>
                {renderAnswer(questionResult.student_answer)}
              </div>

              <div className="full-gr-content-section feedback">
                <div className="full-gr-feedback">
                  <h5>Feedback:</h5>
                  {questionResult.criteria_breakdown && questionResult.criteria_breakdown.map((criterion, idx) => (
                    <div key={idx} className="full-gr-criterion">
                      <div className="full-gr-criterion-header">
                        <span>{criterion.criterion}</span>
                        <span>{criterion.obtained_marks} / {criterion.allocated_marks}</span>
                      </div>
                      <div className="full-gr-criterion-feedback">
                        {renderText(criterion.feedback)}
                      </div>
                      {criterion.mistakes_found && criterion.mistakes_found.length > 0 && (
                        <div className="full-gr-mistakes">
                          <h6>Mistakes Found:</h6>
                          <ul>
                            {criterion.mistakes_found.map((mistake, mIndex) => (
                              <li key={mIndex}>{mistake}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {questionResult.diagram_comparison && questionResult.diagram_comparison !== "null" && (
                  <div className="full-gr-diagram-comparison">
                    <h5>Diagram Comparison:</h5>
                    {renderText(questionResult.diagram_comparison)}
                  </div>
                )}
              </div>

              {questionResult.summary && (
                <div className="full-gr-content-section">
                  <h5>Summary:</h5>
                  {renderText(questionResult.summary)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullGradingDetails; 