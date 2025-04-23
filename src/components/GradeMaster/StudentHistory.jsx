import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentHistory = () => {
  const [answeredPapers, setAnsweredPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Retrieve user data from localStorage
  const userData = {
    id: localStorage.getItem("userId"),
    email: localStorage.getItem("userEmail"),
    role: localStorage.getItem("role"),
  };

  useEffect(() => {
    if (userData.id) {
      fetchAnsweredPapers(userData.id);
    }
  }, [userData.id]);

  const fetchAnsweredPapers = async (id) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/grade/question-papers/",
        {
          params: { user_id: id },
        }
      );

      setAnsweredPapers(response.data.answered_question_papers);
      setFilteredPapers(response.data.answered_question_papers); // Initialize filtered list
      setError("");
    } catch (err) {
      setError("Error fetching question papers. Please try again.");
      console.error(err);
    }
  };

  const handleFilterBySubject = (e) => {
    const selected = e.target.value;
    setSelectedSubject(selected);

    if (selected === "All Subjects") {
      setFilteredPapers(answeredPapers);
    } else {
      setFilteredPapers(
        answeredPapers.filter((paper) => paper.subject === selected)
      );
    }
  };

  return (
    <div className="student-history-page ">
      <header className="history-header1">
        <h1>Student History</h1>
        <div className="filter-section">
          <select
            id="subject-filter"
            value={selectedSubject}
            onChange={handleFilterBySubject}
            className="filter-dropdown"
          >
            <option value="All Subjects">All Subjects</option>
            <option value="English">English</option>
            <option value="Maths">Maths</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </header>

      <div className="my-correction-page">
        <div className="corrections-table-container">
          {filteredPapers.length > 0 ? (
            <table className="corrections-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Board</th>
                  <th>Subject</th>
                  <th>Total Marks</th>
                  <th>Upload Date</th>
                  <th>Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map((qp) => (
                  <tr key={qp.id}>
                    <td>
                      <button
                        className="view-button"
                        onClick={() =>
                          window.open(
                            `http://127.0.0.1:8000/media/question_papers/${qp.file.split("/").pop()}`,
                            "_blank"
                          )
                        }
                      >
                        {qp.title}
                      </button>
                    </td>
                    <td>{qp.board}</td>
                    <td>{qp.subject}</td>
                    <td>{qp.total_marks}</td>
                    <td>{qp.upload_date}</td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() =>
                          window.open(
                            `http://127.0.0.1:8000/media/answers/${qp.answer_file.split("/").pop()}`,
                            "_blank"
                          )
                        }
                      >
                        Download
                      </button>
                    </td>
                    <td>
                      {qp.result_status === "See Result" ? (
                        <button
                          className="view-button"
                          onClick={() =>
                            navigate("/grade-master/result", {
                              state: { questionPaperId: qp.id, feedbackId: qp.feedback_id },
                            })
                          }
                        >
                          See Result
                        </button>
                      ) : (
                        <span>{qp.result_status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No answered question papers found for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHistory;
