import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { authService } from "../Authentication/authService";
import userProfile from "./userProfile.jpeg";

// Import both CSS files
import "./Student.css";
import "./Mentor.css";

const Mentor = () => {
  const [students, setStudents] = useState([]);
  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [filteredAcceptedStudents, setFilteredAcceptedStudents] = useState([]);
  const [searchAcceptedEmail, setSearchAcceptedEmail] = useState("");
  const [nonAcceptedEmail, setNonAcceptedEmail] = useState("");
  const [answeredPapers, setAnsweredPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [error, setError] = useState("");
  const user = authService.getCurrentUser();
  const [searchActive, setSearchActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
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
    role: localStorage.getItem("activeRole"),
  };
  const [isAddingRole, setIsAddingRole] = useState(false);
  const userRoles = ["qp_uploader", "evaluator", "student", "mentor"];
  const [selectedNewRole, setSelectedNewRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePapers, setAvailablePapers] = useState([]);
  const [studentStats, setStudentStats] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const isProfileCompleted = localStorage.getItem("is_profile_completed");
  const prof = isProfileCompleted === "true";
  
  const handleRedirect = () => {
    localStorage.setItem("previousPage", window.location.pathname);
    navigate("/grade-master/profileSection");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, acceptedStudentsResponse] = await Promise.all([
          axios.get("http://localhost:8000/api/grade/get-students/"),
          axios.get("http://localhost:8000/api/grade/get-accepted-students/", {
            params: { mentor_email: userData.email },
          }),
        ]);

        setStudents(studentsResponse.data);
        setAcceptedStudents(acceptedStudentsResponse.data);
        setFilteredAcceptedStudents(acceptedStudentsResponse.data);
      } catch (err) {
        setError("Error fetching data. Please try again.");
        console.error(err);
      }
    };

    fetchData();
  }, [userData.email]);

  const handleSearchAcceptedEmail = (e) => {
    const inputValue = e.target.value;
    setSearchAcceptedEmail(inputValue);

    const filtered = acceptedStudents.filter((student) =>
      student.email.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredAcceptedStudents(filtered);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    const student = students.find(
      (s) => s.email.toLowerCase() === nonAcceptedEmail.toLowerCase()
    );

    if (!student) {
      alert("Invalid student email address.");
      return;
    }

    if (
      acceptedStudents.some(
        (s) => s.email.toLowerCase() === nonAcceptedEmail.toLowerCase()
      )
    ) {
      alert("Student is already accepted.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/grade/send-request/", {
        student_id: student.id,
        mentor_id: userData.id,
        mentor_request: true,
        message: "Mentor Request",
      });
      alert("Request sent successfully!");
      setNonAcceptedEmail("");
    } catch (error) {
      alert("Failed to send request. " + error.response?.data?.message || "");
    }
  };

  const handleRoleChange = (newRole) => {
    localStorage.setItem("activeRole", newRole);
    setSelectedRole(newRole);
    setIsEditing(false);
    navigate(`/grade-master/${newRole}`);
    window.location.reload();
  };

  const applyFilters = () => {
    console.log('Applying filters');
    console.log('Current answeredPapers:', answeredPapers);
    console.log('Current selectedSubject:', selectedSubject);

    if (!answeredPapers) {
      setFilteredPapers([]);
      return;
    }

    let filtered = [...answeredPapers];
    
    if (selectedSubject !== "All Subjects") {
      filtered = filtered.filter(qp => 
        qp.subject && qp.subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase()
      );
    }
    
    console.log('Filtered papers:', filtered);
    setFilteredPapers(filtered);
  };

  const handleFilterBySubject = (e) => {
    const selected = e.target.value;
    setSelectedSubject(selected);
  };

  useEffect(() => {
    console.log('Filter effect triggered');
    console.log('Current filteredPapers:', filteredPapers);
    console.log('Current selectedSubject:', selectedSubject);
    applyFilters();
  }, [selectedSubject, answeredPapers]);

  const handleMonitorStudent = async (id) => {
    console.log('Starting handleMonitorStudent with ID:', id);
    try {
      const response = await axios.get("http://localhost:8000/api/grade/question-papers/", {
        params: { user_id: id },
      });

      console.log('Full API Response:', JSON.stringify(response.data, null, 2));

      if (response.data) {
        // Create a Set to track unique paper IDs
        const uniquePaperIds = new Set();
        
        // Helper function to add papers without duplicates
        const addUniquePapers = (papers) => {
          return papers.filter(paper => {
            if (uniquePaperIds.has(paper.id)) {
              return false;
            }
            uniquePaperIds.add(paper.id);
            return true;
          });
        };

        // Get all answered papers from different categories without duplicates
        const allAnsweredPapers = addUniquePapers([
          ...(response.data.all?.answered_question_papers || []),
          ...(response.data.sample?.answered_question_papers || []),
          ...(response.data.previous_year?.answered_question_papers || []),
          ...(response.data.generated?.answered_question_papers || [])
        ]);

        // Log each paper's full data
        console.log('Detailed paper data:', allAnsweredPapers.map(paper => ({
          id: paper.id,
          answer_id: paper.answer_id,
          answer_file: paper.answer_file,
          title: paper.title,
          question_paper_type: paper.question_paper_type,
          result_status: paper.result_status,
          feedback_id: paper.feedback_id,
          full_paper: paper
        })));

        // Reset the Set for available papers
        uniquePaperIds.clear();

        // Get all available papers from different categories without duplicates
        const allAvailablePapers = addUniquePapers([
          ...(response.data.all?.available_question_papers || []),
          ...(response.data.sample?.available_question_papers || []),
          ...(response.data.previous_year?.available_question_papers || []),
          ...(response.data.generated?.available_question_papers || [])
        ]);

        console.log('Combined unique answered papers:', JSON.stringify(allAnsweredPapers, null, 2));
        
        // Sort papers by upload date
        const sortedAnsweredPapers = allAnsweredPapers.sort(
          (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
        );

        // Update states one by one
        setAnsweredPapers(sortedAnsweredPapers);
        setFilteredPapers(sortedAnsweredPapers);
        setAvailablePapers(allAvailablePapers);
        setStudentStats({
          available: allAvailablePapers,
          answered: sortedAnsweredPapers,
        });
        setSearchActive(true);
        setError("");
      } else {
        setError("No data received from the server.");
      }
    } catch (err) {
      console.error("Error in handleMonitorStudent:", err);
      setError("Error fetching student data. Please try again.");
      setSearchActive(false);
    }
  };

  const calculateSubjectDistribution = (papers) => {
    const subjectCounts = {};
    papers.forEach((paper) => {
      subjectCounts[paper.subject] = (subjectCounts[paper.subject] || 0) + 1;
    });
    return subjectCounts;
  };

  const chartData = (labels, data) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#4A90E2",
          "#50E3C2",
          "#9013FE",
          "#F5A623",
          "#F8E71C",
          "#B8E986",
          "#D0021B",
        ],
        hoverBackgroundColor: [
          "#1C68D0",
          "#2EBB97",
          "#6C10D1",
          "#D98618",
          "#D7CB00",
          "#92D367",
          "#A80014",
        ],
      },
    ],
  });

  const renderStatistics = () => {
    if (!studentStats) return null;

    const availableSubjectData = calculateSubjectDistribution(
      studentStats.available
    );
    const answeredSubjectData = calculateSubjectDistribution(
      studentStats.answered
    );

    const availableQPData = chartData(
      ["Available QP", "Answered QP"],
      [studentStats.available.length, studentStats.answered.length]
    );

    const availableSubjectChartData = chartData(
      Object.keys(availableSubjectData),
      Object.values(availableSubjectData)
    );

    const answeredSubjectChartData = chartData(
      Object.keys(answeredSubjectData),
      Object.values(answeredSubjectData)
    );

    return (
      <div className="statistics-section-stat">
        <h2>Student Performance Statistics</h2>
        <div className="chart-container">
          <div className="chart-box">
            <h3>Available vs Answered Question Papers</h3>
            {studentStats.available.length + studentStats.answered.length >
            0 ? (
              <Pie data={availableQPData} />
            ) : (
              <p className="no-data-message">No data available.</p>
            )}
          </div>

          <div className="chart-box">
            <h3>Subject-Wise Available Question Papers</h3>
            {Object.entries(availableSubjectData).length > 0 ? (
              <Pie
                data={availableSubjectChartData}
                options={{ plugins: { legend: { display: true } } }}
              />
            ) : (
              <p className="no-data-message">No data available.</p>
            )}
          </div>

          <div className="chart-box">
            <h3>Subject-Wise Answered Question Papers</h3>
            {Object.entries(answeredSubjectData).length > 0 ? (
              <Pie
                data={answeredSubjectChartData}
                options={{ plugins: { legend: { display: true } } }}
              />
            ) : (
              <p className="no-data-message">No data available.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

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

  // Add a new useEffect to monitor state changes
  useEffect(() => {
    console.log('State changed:');
    console.log('searchActive:', searchActive);
    console.log('filteredPapers:', filteredPapers);
    console.log('answeredPapers:', answeredPapers);
    console.log('availablePapers:', availablePapers);
    console.log('studentStats:', studentStats);
  }, [searchActive, filteredPapers, answeredPapers, availablePapers, studentStats]);

  const handleViewPaper = (file, questionPaperType) => {
    const basePath = "http://127.0.0.1:8000/media/question_papers/";
    let folder;
    
    switch (questionPaperType) {
      case "sample":
        folder = "sample";
        break;
      case "previous_year":
        folder = "previous_year";
        break;
      case "generated":
        folder = "generated";
        break;
      default:
        folder = "qp_uploader";
    }
    
    const fileName = file.split("/").pop();
    window.open(`${basePath}${folder}/${fileName}`, "_blank");
  };

  const handleViewAnswer = (answerFile) => {
    const basePath = "http://127.0.0.1:8000/media/answer_uploads/";
    const fileName = answerFile.split("/").pop();
    window.open(`${basePath}/${fileName}`, "_blank");
  };

  const handleViewGradingResult = async (answerId) => {
    if (!answerId) {
      console.error('No answer ID provided');
      alert('Error: No answer ID found');
      return;
    }

    try {
      console.log('Fetching grading result for answer ID:', answerId);
      const response = await axios.get(`http://localhost:8000/api/grade/grading-result/${answerId}/`);
      console.log('Grading result response:', response.data);
      
      const result = response.data;
      
      if (result.graded) {
        navigate('/grade-master/grading-result', {
          state: {
            resultData: result.result_data,
            gradingId: result.grading_id,
            answerId: answerId,
            questionPaper: result.question_paper,
            questionPaperType: result.question_paper_type,
          }
        });
      } else {
        alert('Grading result is not available yet. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching grading result:', error);
      alert('Error fetching grading result. Please try again later.');
    }
  };

  return (
    <div className="studentPage">
      <div className="profileSection">
        <div className="profileCard">
          <div className="profileHeader">
            <div className="profileImageContainer">
              <img src={userProfile} alt="Profile" className="profileImage" />
            </div>
            <div className="profileInfo">
              <h2>Mentor Dashboard</h2>
              <div className="profileDetail">
                <span className="profileLabel">ID:</span>
                <span>{userData.id}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Email:</span>
                <span>{userData.email}</span>
              </div>
              <div className="profileDetail">
                <span className="profileLabel">Current Role:</span>
                <span className="roleValue">{selectedRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {!searchActive ? (
        <div>
          <section className="paperSection">
            <div className="sectionHeader">
              <h3>Accepted Students</h3>
              <div className="filterContainer">
                <label htmlFor="search-accepted" className="filterLabel">
                  Search by Email:
                </label>
                <input
                  type="text"
                  id="search-accepted"
                  value={searchAcceptedEmail}
                  onChange={handleSearchAcceptedEmail}
                  placeholder="Search by email"
                  className="filterDropdown"
                />
              </div>
            </div>

            <div className="tableContainer">
              <table className="studentTable">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcceptedStudents.length > 0 ? (
                    filteredAcceptedStudents.map((student) => (
                      <tr key={student.id}>
                        <td>{student.email}</td>
                        <td>
                          <button
                            className="actionButton"
                            onClick={() => handleMonitorStudent(student.id)}
                          >
                            Monitor
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="noDataMessage">
                        No accepted students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="paperSection">
            <div className="sectionHeader">
              <h3>Send Monitoring Request</h3>
            </div>
            <div className="tableContainer">
              <form onSubmit={handleSendRequest} className="profileActions">
                <input
                  type="email"
                  value={nonAcceptedEmail}
                  onChange={(e) => setNonAcceptedEmail(e.target.value)}
                  placeholder="Enter student email"
                  className="roleSelect"
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="submitRoleBtn">
                  Send Request
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : (
        <div>
          <section className="paperSection">
            <div className="sectionHeader">
              <h3>Answered Question Papers</h3>
              <div className="filterContainer">
                <label htmlFor="subject-filter" className="filterLabel">
                  Filter by Subject:
                </label>
                <select
                  id="subject-filter"
                  className="filterDropdown"
                  value={selectedSubject}
                  onChange={handleFilterBySubject}
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
                  {filteredPapers && filteredPapers.length > 0 ? (
                    filteredPapers.map((qp) => (
                      <tr key={qp.id}>
                        <td>
                          <button
                            className="viewButton"
                            onClick={() => handleViewPaper(qp.file, qp.question_paper_type)}
                          >
                            {qp.title || qp.file_name || 'Untitled Paper'}
                          </button>
                        </td>
                        <td>{qp.board || 'N/A'}</td>
                        <td>{qp.subject || 'N/A'}</td>
                        <td>{qp.total_marks || 'N/A'}</td>
                        <td>{qp.upload_date || 'N/A'}</td>
                        <td>
                          {qp.answer_file ? (
                            <button
                              className="downloadButton"
                              onClick={() => handleViewAnswer(qp.answer_file)}
                            >
                              Download
                            </button>
                          ) : (
                            <span>No answer uploaded</span>
                          )}
                        </td>
                        <td>
                          <div className="result-buttons">
                            {qp.result_status === "See Result" && qp.feedback_id && (
                              <button
                                className="resultButton"
                                onClick={() =>
                                  navigate("/grade-master/result", {
                                    state: {
                                      questionPaperId: qp.id,
                                      feedbackId: qp.feedback_id,
                                    },
                                  })
                                }
                              >
                                Manual Grading
                              </button>
                            )}
                            {qp.answer_file && (
                              <button
                                className="resultButton"
                                onClick={() => handleViewGradingResult(qp.answer_id)}
                                style={{ marginLeft: '8px' }}
                              >
                                AI Grading
                              </button>
                            )}
                            {!qp.result_status && !qp.answer_file && (
                              <span className="pendingStatus">Pending</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="noDataMessage">
                        No answered question papers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {renderStatistics()}

          <button
            className="search-again-button"
            onClick={() => {
              setSearchActive(false);
              setAnsweredPapers([]);
              setFilteredPapers([]);
              setStudentStats(null);
              setSelectedStudentId(null);
            }}
          >
            Back to Accepted Students
          </button>
        </div>
      )}
    </div>
  );
};

export default Mentor;