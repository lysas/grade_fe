import React, { useState } from "react";
import axios from "axios";
import "./Student.css"; // Import Student.css for shared styling
import "./Admin.css"; // Import Admin.css for admin-specific styling
import userProfile from "./userProfile.jpeg";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPlus, faFileUpload, faList } from "@fortawesome/free-solid-svg-icons";
import { authService } from "../Authentication/authService";

const Admin = () => {
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("fullPaper");
  const [file, setFile] = useState(null);
  const [testTitle, setTestTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [questions, setQuestions] = useState([{ count: "", marks: "" }]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const user = authService.getCurrentUser();
  const [selectedRole, setSelectedRole] = useState(localStorage.getItem("activeRole"));
  let allRoles = [];
  try {
    allRoles = JSON.parse(localStorage.getItem("roles") || "[]");
  } catch (e) {
    allRoles = localStorage.getItem("roles")?.split(",") || [];
  }
  const handleFileChange = (e) => setFile(e.target.files[0]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const userRoles = ['qp_uploader', 'evaluator', 'student', 'mentor'];
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isProfileCompleted = localStorage.getItem("is_profile_completed") === "true";

  const handleRedirect = () => {
    localStorage.setItem("previousPage", window.location.pathname);
    navigate("/grade-master/profileSection");
  };

  const handleAddQuestion = () => 
    setQuestions([...questions, { count: "", marks: "" }]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole"),
    is_premium: localStorage.getItem("is_premium"),
  };

  const isPremium = userData.is_premium === "true";

  const handleRoleChange = (newRole) => {
    localStorage.setItem("activeRole", newRole);
    setSelectedRole(newRole);
    setIsEditing(false);
    navigate(`/grade-master/${newRole}`);
    window.location.reload();
  };

  const handleUpload = async () => {
    if (!file || !testTitle || !subject || questions.some((q) => !q.count || !q.marks)) {
      setError("Please fill all fields and provide valid input.");
      return;
    }

    const totalMarks = calculateTotalMarks();
    const totalQuestions = calculateTotalQuestions();

    const formattedQuestions = questions.map((q) => ({
      count: parseInt(q.count),
      marks: parseInt(q.marks),
      total: parseInt(q.count) * parseInt(q.marks),
    }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", localStorage.getItem("userEmail"));
    formData.append("test_title", testTitle);
    formData.append("board", selectedBoard);
    formData.append("subject", subject);
    formData.append("questions", JSON.stringify(formattedQuestions));
    formData.append("total_marks", totalMarks);
    formData.append("total_questions", totalQuestions);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/grade/upload/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Question paper uploaded successfully!");
      resetForm();
    } catch (err) {
      setError("Error uploading question paper.");
      console.error(err);
    }
  };

  const handleMyUploads = () => navigate("/grade-master/uploadHistory");

  const calculateTotalMarks = () =>
    questions.reduce(
      (total, q) => total + (parseInt(q.count) || 0) * (parseInt(q.marks) || 0),
      0
    );

  const calculateTotalQuestions = () =>
    questions.reduce((total, q) => total + (parseInt(q.count) || 0), 0);

  const resetForm = () => {
    setFile(null);
    setTestTitle("");
    setSubject("");
    setSelectedBoard("CBSE");
    setQuestions([{ count: "", marks: "" }]);
    setError("");
  };

  const toggleUploadType = (type) => {
    setUploadType(type);
    resetForm();
  };

  const handleEachQuestion = () => navigate("/grade-master/upload-each-question");

  const availableRoles = userRoles.filter((role) => !allRoles.includes(role));

  const handleNewRoleChange = (newRole) => setSelectedNewRole(newRole);
  
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
      <div className="profileSection">
        <div className="profileCard">
          <div className="profileHeader">
            <div className="profileImageContainer">
              <img src={userProfile} alt="Profile" className="profileImage" />
              {isPremium && <span className="premiumBadge">PREMIUM</span>}
            </div>
            <div className="profileInfo">
              <h2>QP Uploader Dashboard</h2>
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
    onClick={() => navigate("/grade-master/statadmin")}
    className="statsButton"
  >
    <i className="fas fa-chart-line"></i> Statistics
  </button>

            {!isProfileCompleted && (
              <button onClick={handleRedirect} className="completeProfileBtn">
                Complete Your Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="uploadTypeTabs">
        <button 
          className={`uploadTypeTab ${uploadType === 'fullPaper' ? 'active' : ''}`}
          onClick={() => toggleUploadType('fullPaper')}
        >
          <FontAwesomeIcon icon={faFileUpload} /> Full Paper Upload
        </button>
        <button 
          className={`uploadTypeTab ${uploadType === 'individualQuestions' ? 'active' : ''}`}
          onClick={handleEachQuestion}
        >
          <FontAwesomeIcon icon={faList} /> Individual Questions
        </button>
      </div>

      {uploadType === 'fullPaper' && (
        <section className="paperSection">
          <div className="sectionHeader">
            <h3>Upload Question Paper</h3>
            <button className="historyButton" onClick={handleMyUploads}>
              My Uploads
            </button>
          </div>

          <div className="uploadFormContainer">
            <div className="formGroup">
              <input
                type="text"
                className="formInput"
                placeholder="Enter Test Title"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>

            <div className="selectGroup">
              <div className="formGroup">
                <select
                  className="formInput"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="" disabled>Select Subject</option>
                  <option value="English">English</option>
                  <option value="Maths">Maths</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="formGroup">
                <select
                  className="formInput"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="Stateboard">Stateboard</option>
                </select>
              </div>
            </div>

            <div className="summaryBox">
              <div className="summaryItem">
                <strong>Total Marks:</strong> {calculateTotalMarks()}
              </div>
              <div className="summaryItem">
                <strong>Total Questions:</strong> {calculateTotalQuestions()}
              </div>
            </div>

            <div className="questionSection">
              <div className="questionHeaders">
                <span className="headerCell">No. of Questions</span>
                <span className="headerCell">Marks per Question</span>
                <span className="headerCell">Total Marks</span>
                <span className="headerCell">Action</span>
              </div>
              
              {questions.map((q, index) => (
                <div className="questionRow" key={index}>
                  <input
                    type="number"
                    className="questionInput"
                    placeholder="Count"
                    value={q.count}
                    onChange={(e) => handleQuestionChange(index, "count", e.target.value)}
                  />
                  <span className="operatorSymbol">×</span>
                  <input
                    type="number"
                    className="questionInput"
                    placeholder="Marks"
                    value={q.marks}
                    onChange={(e) => handleQuestionChange(index, "marks", e.target.value)}
                  />
                  <span className="operatorSymbol">=</span>
                  <span className="rowTotal">
                    {parseInt(q.count || 0) * parseInt(q.marks || 0)}
                  </span>
                  <button
                    className="removeButton"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ))}
              
              <button className="addQuestionButton" onClick={handleAddQuestion}>
                <FontAwesomeIcon icon={faPlus} /> Add Question Type
              </button>
            </div>

            <div className="fileUploadSection">
              <div className="fileInputContainer">
                <input
                  type="file"
                  className="fileInput"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <div className="fileInputLabel">
                  {file ? file.name : "Choose a PDF file"}
                </div>
              </div>
            </div>
            
            <button
              className="uploadButton"
              onClick={handleUpload}
              disabled={
                !file ||
                !testTitle ||
                !subject ||
                questions.some((q) => !q.count || !q.marks)
              }
            >
              Upload Question Paper
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin;