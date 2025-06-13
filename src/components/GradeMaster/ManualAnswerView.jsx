import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import './ManualAnswerView.css';

const ManualAnswerView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answerData, testTitle } = location.state || {};

  useEffect(() => {
    console.log('Answer Data:', answerData);
    console.log('Test Title:', testTitle);
  }, [answerData, testTitle]);

  if (!answerData) {
    return (
      <div className="manual-answer-view">
        <div className="container">
          <div className="alert alert-warning">
            No answer data available. Please go back and try again.
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderAnswer = (data) => {
    console.log('Rendering answer for:', data);
    
    // Handle programming questions
    if (data.question_type === 'programming') {
      let answerData;
      try {
        answerData = typeof data.answer_text === 'string' ? JSON.parse(data.answer_text) : data.answer_text;
      } catch (e) {
        console.error('Error parsing programming answer:', e);
        answerData = { code: data.answer_text || '', language: 'python' };
      }

      return (
        <div className="programming-answer">
          <div className="language-info">
            <span className="badge bg-primary">
              <i className="fas fa-code me-1"></i>
              {answerData?.language || 'Python'}
            </span>
          </div>
          <div className="code-editor">
            <Editor
              height="300px"
              language={answerData?.language?.toLowerCase() || 'python'}
              theme="vs-dark"
              value={answerData?.code || ''}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                lineNumbers: 'on',
              }}
            />
          </div>
          {answerData?.output && (
            <div className="output-section mt-3">
              <h6>Output:</h6>
              <pre className="output-content">
                {answerData.output}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // Handle matching questions
    if (data.question_type === 'matching') {
      let answerData;
      try {
        // First try parsing as JSON
        answerData = typeof data.answer_text === 'string' ? JSON.parse(data.answer_text) : data.answer_text;
      } catch (e) {
        console.error('Error parsing matching answer:', e);
        try {
          // If JSON parsing fails, try to parse the string representation of the array
          const cleanedStr = data.answer_text.replace(/'/g, '"');
          answerData = JSON.parse(cleanedStr);
        } catch (e2) {
          console.error('Error parsing cleaned matching answer:', e2);
          answerData = [];
        }
      }

      return (
        <div className="matching-answer">
          <div className="matching-pairs">
            {Array.isArray(answerData) ? answerData.map((pair, index) => (
              <div key={index} className="matching-pair">
                <div className="row">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-light">Left {index + 1}</span>
                      <input
                        type="text"
                        className="form-control"
                        value={pair.left || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text bg-light">Right {index + 1}</span>
                      <input
                        type="text"
                        className="form-control"
                        value={pair.right || 'Not answered'}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="alert alert-warning">
                Invalid matching answer format
              </div>
            )}
          </div>
        </div>
      );
    }

    // Handle other question types
    return (
      <div className="answer-text">
        {data.answer_text || 'No answer provided'}
      </div>
    );
  };

  return (
    <div className="manual-answer-view">
      <div className="container">
        <div className="answer-header">
          <h2>{testTitle || 'Test Answers'}</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="answers-container">
          {Object.entries(answerData).map(([questionId, data], index) => {
            console.log('Processing question:', questionId, data);
            return (
              <div key={questionId} className="answer-card">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="badge bg-primary rounded-pill">Q{index + 1}</span>
                  <span className="badge bg-secondary rounded-pill">
                    {formatQuestionType(data.question_type)}
                  </span>
                </div>
                <div className="question-text mb-3">
                  {data.question_text}
                </div>
                <div className="answer-content">
                  <div className="answer-label">Student's Answer:</div>
                  {renderAnswer(data)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const getQuestionTypeBadgeClass = (type) => {
  switch (type) {
    case 'programming':
      return 'bg-primary';
    case 'matching':
      return 'bg-info';
    case 'mcq':
      return 'bg-success';
    case 'true_false':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

const formatQuestionType = (type) => {
  if (!type) return 'Unknown Type';
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default ManualAnswerView; 