import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import userProfile from "./userProfile.jpeg";
import { authService } from "../Authentication/authService";

// Scoped CSS using CSS modules
import  "./Student.css";

const Student = () => {
  const [answeredPapers, setAnsweredPapers] = useState([]);
  const [availablePapers, setAvailablePapers] = useState([]);
  const [filteredAnsweredPapers, setFilteredAnsweredPapers] = useState([]);
  const [filteredAvailablePapers, setFilteredAvailablePapers] = useState([]);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const user = authService.getCurrentUser();
  const [selectedRole, setSelectedRole] = useState(
     localStorage.getItem("activeRole") 
  );
  let allRoles = [];
  try {
    allRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  } catch (e) {
    allRoles = localStorage.getItem("roles")?.split(",") || [];
  }
  
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole") ,
    is_premium: localStorage.getItem("is_premium"),
  };
  const [isAddingRole, setIsAddingRole] = useState(false);
  const userRoles = ["qp_uploader", "evaluator", "student", "mentor"];
  const [selectedNewRole, setSelectedNewRole] = useState(""); // Store new role selection
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const isPremium = userData.is_premium === "true";
  const isProfileCompleted = localStorage.getItem("is_profile_completed");
  const prof = isProfileCompleted === "true";
  
  const handleRedirect = () => {
    // Save the current page before redirecting
    localStorage.setItem("previousPage", window.location.pathname);
    navigate("/grade-master/profileSection");
  };

  const canAccessQuestionPaper = (answeredPapers, paperIndex) => {
    if (isPremium) return true;

    if (answeredPapers.length === 0 && paperIndex === 0) return true;

    const today = new Date();
    const firstAnsweredDate =
      answeredPapers.length > 0
        ? new Date(answeredPapers[0].upload_date)
        : null;

    if (firstAnsweredDate) {
      const differenceInDays = Math.floor(
        (today - firstAnsweredDate) / (1000 * 60 * 60 * 24)
      );
      return differenceInDays >= 30 && paperIndex === 0;
    }

    return paperIndex === 0;
  };

  useEffect(() => {
    const fetchQuestionPapers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/grade/question-papers/",
          {
            params: { user_id: userData.id },
          }
        );

        const sortedAnsweredPapers =
          response.data.answered_question_papers.sort(
            (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
          );

        setAnsweredPapers(sortedAnsweredPapers);
        setAvailablePapers(response.data.available_question_papers);
        setFilteredAnsweredPapers(sortedAnsweredPapers);
        setFilteredAvailablePapers(response.data.available_question_papers);
      } catch (err) {
        setError("Error fetching question papers.");
        console.error("Error fetching question papers:", err);
      }
    };

    fetchQuestionPapers();
  }, [userData.id]);

  const handleUpload = (qp, index) => {
    if (!canAccessQuestionPaper(answeredPapers, index)) {
      setShowPremiumAlert(true);
      setTimeout(() => setShowPremiumAlert(false), 10000);
      return;
    }

    navigate("/grade-master/upload-answer", {
      state: {
        questionPaper: qp,
        userId: userData.id,
        userEmail: userData.email,
      },
    });
  };

  const handleViewPaper = (file, index) => {
    if (!canAccessQuestionPaper(answeredPapers, index)) {
      setShowPremiumAlert(true);
      setTimeout(() => setShowPremiumAlert(false), 3000);
      return;
    }
    window.open(
      `http://127.0.0.1:8000/media/question_papers/${file.split("/").pop()}`,
      "_blank"
    );
  };

  const handleSeeResult = (qpId, f) => {
    navigate("/grade-master/result", {
      state: { questionPaperId: qpId, feedbackId: f },
    });
  };

  const handleFilterChange = (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);

    if (subject === "All Subjects") {
      setFilteredAnsweredPapers(answeredPapers);
      setFilteredAvailablePapers(availablePapers);
    } else {
      setFilteredAnsweredPapers(
        answeredPapers.filter((qp) => qp.subject === subject)
      );
      setFilteredAvailablePapers(
        availablePapers.filter((qp) => qp.subject === subject)
      );
    }
  };
  
  const handleCancel = () => {
    setShowPremiumAlert(false); // Close the alert
  };
  
  const handleRoleChange = (newRole) => {
    localStorage.setItem("activeRole", newRole);
    setSelectedRole(newRole);
    setIsEditing(false);
    navigate(`/grade-master/${newRole}`); // Redirect to the respective role page
    window.location.reload(); // Ensure role-based content reloads
  };
  
  // Get available roles that user doesn't have yet
  const availableRoles = userRoles.filter((role) => !allRoles.includes(role));

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
  
  return (
    <div className="studentPage">
      {showPremiumAlert && (
        <div className="alertOverlay">
          <div className="alertBox">
            <p>
              You can access one question paper per month with the free plan.
              Upgrade to premium for unlimited access to more question papers.
            </p>
            <div className="alertActions">
              <button className="upgradeButton">Upgrade</button>
              <button onClick={handleCancel} className="cancelButton">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
  
      <div className="profileSection">
        <div className="profileCard">
          <div className="profileHeader">
            <div className="profileImageContainer">
              <img src={userProfile} alt="Profile" className="profileImage" />
              {isPremium && <span className="premiumBadge">PREMIUM</span>}
            </div>
            <div className="profileInfo">
              <h2>Student Dashboard</h2>
              <div className="profileDetail">
                <span className="profileLabel">ID:</span>
                <span>{userData.id}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Email:</span>
                <span>{userData.email}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Board:</span>
                <span>CBSE</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Account:</span>
                <span className={isPremium ? "premiumText" : "freeText"}>
                  {isPremium ? "Premium" : "Free"}
                </span>
              </div>
            </div>
          </div>
  
          <div className="profileActions">
            <div className="roleManager">
              <div className="roleControl">
                <span className="roleLabel">Current Role:</span>
                {isEditing ? (
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    className="roleSelect"
                  >
                    {allRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <span className="roleValue">{selectedRole}</span>
                    <button onClick={() => setIsEditing(true)} className="changeRoleBtn">
                      Change Role
                    </button>
                  </>
                )}
              </div>
  
              <div className="addRoleSection">
                {isAddingRole ? (
                  <div className="addRoleControls">
                    <select onChange={(e) => handleNewRoleChange(e.target.value)} className="newRoleSelect">
                      <option value="">Select Role</option>
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
  
                    {selectedNewRole && (
                      <button
                        onClick={handleSubmitNewRole}
                        disabled={isSubmitting}
                        className={`submitRoleBtn ${isSubmitting ? "submitting" : ""}`}
                      >
                        {isSubmitting ? "Adding..." : "Submit"}
                      </button>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setIsAddingRole(true)} className="addRoleBtn">
                    Add Role
                  </button>
                )}
              </div>
            </div>
            <button 
    onClick={() => navigate("/grade-master/statstudent")}
    className="statsButton"
  >
    <i className="fas fa-chart-line"></i> Statistics
  </button>
            <button 
    onClick={() => navigate("/grade-master/notifications")}
    className="notificationButton"
  >
    <i className="fas fa-bell"></i> Notifications
  </button>

  
            {!prof && (
              <button onClick={handleRedirect} className="completeProfileBtn">
                Complete Your Profile
              </button>
            )}
          </div>
        </div>
      </div>
  
      {error && <p className="error">{error}</p>}
  
      <section className="paperSection">
        <div className="sectionHeader">
          <h3>Available Question Papers</h3>
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
                <th>File(Click on the File)</th>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAvailablePapers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="noDataMessage">
                    No Question Papers Found
                  </td>
                </tr>
              ) : (
                filteredAvailablePapers.map((qp, index) => {
                  const isDisabled = !canAccessQuestionPaper(answeredPapers, index);
                  return (
                    <tr key={qp.id} className={isDisabled ? "disabledRow" : ""}>
                      <td>
                        <button
                          className={`viewButton ${isDisabled ? "disabled" : ""}`}
                          onClick={() => handleViewPaper(qp.file, index)}
                        >
                          {qp.title}
                        </button>
                      </td>
                      <td>{qp.subject}</td>
                      <td>{qp.total_marks}</td>
                      <td>{qp.upload_date}</td>
                      <td>
                        <button
                          className={`actionButton ${isDisabled ? "disabled" : ""}`}
                          onClick={() => handleUpload(qp, index)}
                        >
                          Upload
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
  
      <section className="paperSection">
        <div className="sectionHeader">
          <h3>Answered Question Papers</h3>
        </div>
  
        <div className="tableContainer">
          <table className="studentTable">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Upload Date</th>
                <th>My Answer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnsweredPapers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="noDataMessage">
                    No Question Papers Found
                  </td>
                </tr>
              ) : (
                filteredAnsweredPapers.map((qp) => (
                  <tr key={qp.id}>
                    <td>
                      <button
                        className="viewButton"
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
                    <td>{qp.subject}</td>
                    <td>{qp.total_marks}</td>
                    <td>{qp.upload_date}</td>
                    <td>
                      <button
                        className="downloadButton"
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
                          className="resultButton"
                          onClick={() => handleSeeResult(qp.id, qp.feedback_id)}
                        >
                          See Result
                        </button>
                      ) : (
                        <span className="pendingStatus">{qp.result_status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
  
};

export default Student;