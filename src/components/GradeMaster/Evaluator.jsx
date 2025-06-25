import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Student.css";
import userProfile from "./userProfile.jpeg";
import { authService } from "../Authentication/authService";
import SimpleDocViewer from "./SimpleDocViewer";

const Evaluator = () => {
  const [answers, setAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [isEditing, setIsEditing] = useState(false);
  const user = authService.getCurrentUser();
  const [selectedRole, setSelectedRole] = useState(
    localStorage.getItem("activeRole")
  );
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  let allRoles = [];
  try {
    allRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  } catch (e) {
    allRoles = localStorage.getItem("roles")?.split(",") || [];
  }
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole"),
    is_premium: localStorage.getItem("is_premium"),
  };
  const [isAddingRole, setIsAddingRole] = useState(false);
  const userRoles = ["qp_uploader", "evaluator", "student", "mentor"];
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProfileCompleted = localStorage.getItem("is_profile_completed");
  const prof = isProfileCompleted === "true";
  const isPremium = userData.is_premium === "true";

  const handleRedirect = () => {
    localStorage.setItem("previousPage", window.location.pathname);
    navigate("/grade-master/profileSection");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/grade/evaluator_question/",
          {
            params: { user_id: userData.id },
          }
        );

        setAnswers(response.data);
        setFilteredAnswers(response.data);
      } catch (error) {
        console.error("Error fetching evaluator questions", error);
        setError("Error fetching evaluator questions.");
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);

    if (subject === "All Subjects") {
      setFilteredAnswers(answers);
    } else {
      const filtered = answers.filter((answer) => answer.subject === subject);
      setFilteredAnswers(filtered);
    }
  };

  const handleCorrect = (answer) => {
    navigate("/grade-master/correct", { state: { userData, answer } });
  };

  const handleMyEvaluations = () => {
    navigate("/grade-master/myCorrection", { state: { userData } });
  };

  const handleRoleChange = (newRole) => {
    localStorage.setItem("activeRole", newRole);
    setSelectedRole(newRole);
    setIsEditing(false);
    navigate(`/grade-master/${newRole}`);
    window.location.reload();
  };

  const handleNewRoleChange = (newRole) => {
    setSelectedNewRole(newRole);
  };

  const handleSubmitNewRole = async () => {
    if (!selectedNewRole) return;
  
    setIsSubmitting(true); // Show loading
  
    try {
      const response = await axios.post(
        "http://localhost:8000/api/add_role/",
        {
          user_id: userData.id,
          new_role: selectedNewRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Role added successfully!");
  
        // Update localStorage with new roles
        const updatedRoles = [...allRoles, selectedNewRole];
        localStorage.setItem("roles", JSON.stringify(updatedRoles));
        window.location.reload(); // Refresh UI
      } else {
        alert("Failed to add role.");
      }
    } catch (error) {
      console.error(
        "Error adding role",
        error.response ? error.response.data : error.message
      );
      alert("An error occurred while adding the role.");
    }
  
    setIsSubmitting(false); // Stop loading
  };
  

  // Get available roles that user doesn't have yet
  const availableRoles = userRoles.filter((role) => !allRoles.includes(role));

  const handleViewPaper = (file) => {
    const basePath = "http://127.0.0.1:8000/media/question_papers/";
    const fileName = file.split("/").pop();
    
    // Determine the folder based on the file path
    let folder = "";
    if (file.includes("/sample/")) {
      folder = "sample/";
    } else if (file.includes("/previous_year/")) {
      folder = "previous_year/";
    } else if (file.includes("/generated/")) {
      folder = "generated/";
    } else if (file.includes("/qp_uploader/")) {
      folder = "qp_uploader/";
    }
    
    window.open(`${basePath}${folder}${fileName}`, "_blank");
  };

  const handleDownloadAnswer = (file) => {
    const basePath = "http://127.0.0.1:8000/media/";
    const fileName = file.split("/").pop();
    
    // Determine the folder based on the file path
    let folder = "answers/";
    if (file.includes("/answer_uploads/")) {
      folder = "answer_uploads/";
    }
    
    window.open(`${basePath}${folder}${fileName}`, "_blank");
  };

  const closeViewer = () => {
    setShowViewer(false);
    setSelectedFile(null);
  };

  return (
    <div className="studentPage">
      <div className="profileSection">
        <div className="profileCard">
          <div className="profileHeader">
            <div className="profileImageContainer">
              <img src={userProfile} alt="Profile" className="profileImage" />
              {isPremium && <span className="premiumBadge">PREMIUM</span>}
            </div>
            <div className="profileInfo">
              <h2>Evaluator Dashboard</h2>
              <div className="profileDetail">
                <span className="profileLabel">ID:</span>
                <span>{userData.id}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Email:</span>
                <span>{userData.email}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Role:</span>
                <span>{selectedRole}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {error && <p className="errore">{error}</p>}
      <section className="paperSection">
        <div className="sectionHeader">
          <h3>My Evaluations</h3>
          <button className="resultButton" onClick={handleMyEvaluations}>
            View All Evaluations
          </button>
        </div>
      </section>

      <section className="paperSection">
        <div className="sectionHeader">
          <h3>Pending Evaluations</h3>
          <div className="filterContainer">
            <label htmlFor="subject-filter" className="filterLabel">
              Filter by Subject:
            </label>
            <select
              id="subject-filter"
              className="filterDropdown"
              value={selectedSubject}
              onChange={handleFilterChange}
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
        </div>

        <div className="tableContainer">
          <table className="studentTable">
            <thead>
              <tr>
                <th>Question Paper Title</th>
                <th>Total Marks</th>
                <th>Subject</th>
                <th>Board</th>
                <th>Download Answer</th>
                <th>Status</th>
                <th>Time Left</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnswers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="noDataMessage">
                    No Answer Sheets Found
                  </td>
                </tr>
              ) : (
                filteredAnswers.map((answer) => {
                  // Calculate remaining time (3 days from assigned_date)
                  let timeLeft = '';
                  if (answer.assigned_date) {
                    const assigned = new Date(answer.assigned_date.replace(' ', 'T'));
                    const now = new Date();
                    const deadline = new Date(assigned.getTime() + 3 * 24 * 60 * 60 * 1000);
                    const diff = deadline - now;
                    if (diff > 0) {
                      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
                      timeLeft = `${days}d ${hours}h ${minutes}m`;
                    } else {
                      timeLeft = 'Expired';
                    }
                  }
                  return (
                    <tr key={answer.id}>
                      <td>
                        <button
                          className="viewButton"
                          onClick={() => handleViewPaper(answer.question_paper_file)}
                        >
                          {answer.qp_title}
                        </button>
                      </td>
                      <td>{answer.total_marks}</td>
                      <td>{answer.subject}</td>
                      <td>{answer.board}</td>
                      <td>
                        <button
                          className="downloadButton"
                          onClick={() => handleDownloadAnswer(answer.answer_file)}
                        >
                          Download
                        </button>
                      </td>
                      <td>
                        <button
                          className="actionButton"
                          onClick={() => handleCorrect(answer)}
                        >
                          Correct
                        </button>
                      </td>
                      <td>{timeLeft}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showViewer && selectedFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Question Paper</h3>
              <button className="close-button" onClick={closeViewer}>×</button>
            </div>
            <div className="modal-body">
              <SimpleDocViewer 
                fileUrl={selectedFile.url}
                fileType={selectedFile.type}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Evaluator;