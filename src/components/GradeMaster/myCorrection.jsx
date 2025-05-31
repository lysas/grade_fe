import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import axios from 'axios';
import './Mycorrection.css';

const MyCorrection = () => {
  const [corrections, setCorrections] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData; // Retrieve evaluator data passed from Evaluator.js

  useEffect(() => {
    const fetchCorrections = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/grade/myCorrections/${userData.email}/`);
        setCorrections(response.data);
      } catch (error) {
        console.error('Error fetching corrected sheets', error);
        setError('Error fetching corrected sheets.');
      }
    };

    fetchCorrections();
  }, [userData.email]);

  const handleBack = () => {
    navigate('/grade-master/evaluator'); // Navigate back to the Evaluator page
  };
  const handleSeeResult = (f) => {
    navigate('/grade-master/result', { state: { feedbackId: f } });
  };

  const handleViewAnswer = (answerFile) => {
    const basePath = "http://127.0.0.1:8000/media/answer_uploads/";
    const fileName = answerFile.split("/").pop();
    window.open(`${basePath}/${fileName}`, "_blank");
  };

  return (
    <div className="my-correction-page">
      <header className="correction-header">
        <h1>My Corrections</h1>
        <button className="back-button" onClick={handleBack}>
          Back to Evaluator
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="corrections-table-container">
        <table className="corrections-table">
          <thead>
            <tr>
              <th>Question Paper Title</th>
              <th>Board</th>
              <th>Subject</th>
              <th>Total Marks</th>
              <th>Answer File</th>
              <th>Feedback</th>
              <th>Corrected On</th>
            </tr>
          </thead>
          <tbody>
            {corrections.length > 0 ? (
              corrections.map((correction, index) => (
                <tr key={index}>
                  <td>
                    <button
                      className="view-button"
                      onClick={() =>
                        window.open(
                          `http://127.0.0.1:8000/media/question_papers/${correction.question_file.split('/').pop()}`,
                          '_blank'
                        )
                      }
                    >
                      {correction.qp_title}
                    </button>
                  </td>
                  <td>{correction.board}</td>
                  <td>{correction.subject}</td>
                  <td>{correction.total_marks}</td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => handleViewAnswer(correction.answer_file)}
                    >
                      View Answer
                    </button>
                  </td>
                  <td>
                    <button 
                      className="view-button" 
                      onClick={() => handleSeeResult(correction.feedback)}
                    >
                      See Result
                    </button>
                  </td>
                  <td>{correction.corrected_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No corrections found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyCorrection;
