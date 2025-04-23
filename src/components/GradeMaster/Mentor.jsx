// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Mentor.css";
// import userProfile from "./userProfile.jpeg";
// import { Pie } from "react-chartjs-2";
// import "chart.js/auto";
// import { authService } from "../Authentication/authService";

// const Mentor = () => {
//   const [students, setStudents] = useState([]);
//   const [acceptedStudents, setAcceptedStudents] = useState([]);
//   const [filteredAcceptedStudents, setFilteredAcceptedStudents] = useState([]);
//   const [searchAcceptedEmail, setSearchAcceptedEmail] = useState("");
//   const [nonAcceptedEmail, setNonAcceptedEmail] = useState("");
//   const [answeredPapers, setAnsweredPapers] = useState([]);
//   const [filteredPapers, setFilteredPapers] = useState([]);
//   const [error, setError] = useState("");
//   const user = authService.getCurrentUser();
//   const [searchActive, setSearchActive] = useState(false);
//   const [selectedSubject, setSelectedSubject] = useState("All Subjects");
//   const navigate = useNavigate();
//   const [isEditing, setIsEditing] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(
//     localStorage.getItem("activeRole")
//   );
//   const allRoles = user?.roles || [];
//   const userData = {
//     id: user?.id,
//     email: user?.email,
//     role: localStorage.getItem("activeRole"),
//   };
//   const [isAddingRole, setIsAddingRole] = useState(false);
//   const userRoles = ["qp_uploader", "evaluator", "student", "mentor"];
//   const [selectedNewRole, setSelectedNewRole] = useState(""); // Store new role selection
//   const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
//   const [availablePapers, setAvailablePapers] = useState([]);
//   const [studentStats, setStudentStats] = useState(null);
//   const [selectedStudentId, setSelectedStudentId] = useState(null);

//   const isProfileCompleted = localStorage.getItem("is_profile_completed");
//   const prof = isProfileCompleted === "true";
//   const handleRedirect = () => {
//     // Save the current page before redirecting
//     localStorage.setItem("previousPage", window.location.pathname);
//     navigate("/grade-master/profileSection");
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [studentsResponse, acceptedStudentsResponse] = await Promise.all([
//           axios.get("http://localhost:8000/api/grade/get-students/"),
//           axios.get("http://localhost:8000/api/grade/get-accepted-students/", {
//             params: { mentor_email: userData.email },
//           }),
//         ]);

//         setStudents(studentsResponse.data);
//         setAcceptedStudents(acceptedStudentsResponse.data);
//         setFilteredAcceptedStudents(acceptedStudentsResponse.data);
//       } catch (err) {
//         setError("Error fetching data. Please try again.");
//         console.error(err);
//       }
//     };

//     fetchData();
//   }, [userData.email]);

//   const handleSearchAcceptedEmail = (e) => {
//     const inputValue = e.target.value;
//     setSearchAcceptedEmail(inputValue);

//     const filtered = acceptedStudents.filter((student) =>
//       student.email.toLowerCase().includes(inputValue.toLowerCase())
//     );
//     setFilteredAcceptedStudents(filtered);
//   };

//   const handleSendRequest = async (e) => {
//     e.preventDefault();
//     const student = students.find(
//       (s) => s.email.toLowerCase() === nonAcceptedEmail.toLowerCase()
//     );

//     if (!student) {
//       alert("Invalid student email address.");
//       return;
//     }

//     if (
//       acceptedStudents.some(
//         (s) => s.email.toLowerCase() === nonAcceptedEmail.toLowerCase()
//       )
//     ) {
//       alert("Student is already accepted.");
//       return;
//     }

//     try {
//       await axios.post("http://localhost:8000/api/grade/send-request/", {
//         student_id: student.id,
//         mentor_id: userData.id,
//         mentor_request: true,
//         message: "Mentor Request",
//       });
//       alert("Request sent successfully!");
//       setNonAcceptedEmail("");
//     } catch (error) {
//       alert("Failed to send request. " + error.response?.data?.message || "");
//     }
//   };
//   const handleRoleChange = (newRole) => {
//     localStorage.setItem("activeRole", newRole);
//     setSelectedRole(newRole);
//     setIsEditing(false);
//     navigate(`/grade-master/${newRole}`); // Redirect to the respective role page
//     window.location.reload(); // Ensure role-based content reloads
//   };

//   const handleMonitorStudent = async (id) => {
//     setSelectedStudentId(id);
//     try {
//       const [papersResponse, statsResponse] = await Promise.all([
//         axios.get("http://localhost:8000/api/grade/question-papers/", {
//           params: { user_id: id },
//         }),
//         axios.get("http://localhost:8000/api/grade/question-papers/", {
//           params: { user_id: id },
//         }),
//       ]);

//       setAnsweredPapers(papersResponse.data.answered_question_papers);
//       setFilteredPapers(papersResponse.data.answered_question_papers);
//       setAvailablePapers(papersResponse.data.available_question_papers);
//       setStudentStats({
//         available: papersResponse.data.available_question_papers,
//         answered: papersResponse.data.answered_question_papers,
//       });
//       setSearchActive(true);
//       setError("");
//     } catch (err) {
//       setError("Error fetching student data. Please try again.");
//       console.error(err);
//     }
//   };
//   const calculateSubjectDistribution = (papers) => {
//     const subjectCounts = {};
//     papers.forEach((paper) => {
//       subjectCounts[paper.subject] = (subjectCounts[paper.subject] || 0) + 1;
//     });
//     return subjectCounts;
//   };

//   const chartData = (labels, data) => ({
//     labels,
//     datasets: [
//       {
//         data,
//         backgroundColor: [
//           "#4A90E2",
//           "#50E3C2",
//           "#9013FE",
//           "#F5A623",
//           "#F8E71C",
//           "#B8E986",
//           "#D0021B",
//         ],
//         hoverBackgroundColor: [
//           "#1C68D0",
//           "#2EBB97",
//           "#6C10D1",
//           "#D98618",
//           "#D7CB00",
//           "#92D367",
//           "#A80014",
//         ],
//       },
//     ],
//   });
//   const renderStatistics = () => {
//     if (!studentStats) return null;

//     const availableSubjectData = calculateSubjectDistribution(
//       studentStats.available
//     );
//     const answeredSubjectData = calculateSubjectDistribution(
//       studentStats.answered
//     );

//     const availableQPData = chartData(
//       ["Available QP", "Answered QP"],
//       [studentStats.available.length, studentStats.answered.length]
//     );

//     const availableSubjectChartData = chartData(
//       Object.keys(availableSubjectData),
//       Object.values(availableSubjectData)
//     );

//     const answeredSubjectChartData = chartData(
//       Object.keys(answeredSubjectData),
//       Object.values(answeredSubjectData)
//     );

//     return (
//       <div className="statistics-section-stat">
//         <h2>Student Performance Statistics</h2>
//         <div className="chart-container">
//           <div className="chart-box">
//             <h3>Available vs Answered Question Papers</h3>
//             {studentStats.available.length + studentStats.answered.length >
//             0 ? (
//               <Pie data={availableQPData} />
//             ) : (
//               <p className="no-data-message">No data available.</p>
//             )}
//           </div>

//           <div className="chart-box">
//             <h3>Subject-Wise Available Question Papers</h3>
//             {Object.entries(availableSubjectData).length > 0 ? (
//               <Pie
//                 data={availableSubjectChartData}
//                 options={{ plugins: { legend: { display: true } } }}
//               />
//             ) : (
//               <p className="no-data-message">No data available.</p>
//             )}
//           </div>

//           <div className="chart-box">
//             <h3>Subject-Wise Answered Question Papers</h3>
//             {Object.entries(answeredSubjectData).length > 0 ? (
//               <Pie
//                 data={answeredSubjectChartData}
//                 options={{ plugins: { legend: { display: true } } }}
//               />
//             ) : (
//               <p className="no-data-message">No data available.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };
//   const handleFilterBySubject = (e) => {
//     const selected = e.target.value;
//     setSelectedSubject(selected);
//     setFilteredPapers(
//       selected === "All Subjects"
//         ? answeredPapers
//         : answeredPapers.filter((qp) => qp.subject === selected)
//     );
//   };
//   // Get available roles that user doesn't have yet
//   const availableRoles = userRoles.filter((role) => !allRoles.includes(role));

//   const handleNewRoleChange = (newRole) => {
//     setSelectedNewRole(newRole);
//   };

//   const handleSubmitNewRole = async () => {
//     if (!selectedNewRole) return;

//     setIsSubmitting(true); // Show loading

//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/add_role/",
//         {
//           user_id: userData.id, // Ensure user ID is being sent correctly
//           new_role: selectedNewRole,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json", // Ensure JSON format
//           },
//         }
//       );

//       if (response.status === 200 || response.status === 201) {
//         alert("Role added successfully!");

//         // Update localStorage with new roles
//         const updatedRoles = [...allRoles, selectedNewRole];
//         localStorage.setItem("all_roles", updatedRoles.join(","));
//         window.location.reload(); // Refresh UI
//       } else {
//         alert("Failed to add role.");
//       }
//     } catch (error) {
//       console.error(
//         "Error adding role",
//         error.response ? error.response.data : error.message
//       );
//       alert("An error occurred while adding the role.");
//     }

//     setIsSubmitting(false); // Stop loading
//   };

//   return (
//     <div className="mentor-page">
//       <div className="profile-section">
//         <div className="profile-container">
//           <img src={userProfile} alt="Profile" className="profile-photo" />
//           <div className="profile-details">
//             <h2>Mentor Profile</h2>
//             <p>
//               <strong>ID:</strong> {userData.id}
//             </p>
//             <p>
//               <strong>Email:</strong> {userData.email}
//             </p>
//             <p>
//               <strong style={{ marginRight: "10px" }}>Role:</strong>
//               {isEditing ? (
//                 <select
//                   value={selectedRole}
//                   onChange={(e) => handleRoleChange(e.target.value)}
//                   onBlur={() => setIsEditing(false)} // Hide dropdown when losing focus
//                   style={{
//                     width: "120px", // Ensures dropdown width matches text
//                     padding: "6px 10px",
//                     fontSize: "14px",
//                     borderRadius: "6px",
//                     border: "1px solid #ccc",
//                     background: "#f8f8f8",
//                     cursor: "pointer",
//                     textAlign: "center",
//                     marginRight: "10px",
//                     marginLeft: "10px",
//                   }}
//                 >
//                   {allRoles.map((role) => (
//                     <option key={role} value={role}>
//                       {role.charAt(0).toUpperCase() + role.slice(1)}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <>
//                   <span style={{ marginRight: "10px" }}>{selectedRole}</span>
//                   <button
//                     onClick={() => setIsEditing(true)}
//                     style={{
//                       padding: "5px 10px",
//                       fontSize: "14px",
//                       borderRadius: "6px",
//                       border: "none",
//                       background: "#007bff",
//                       color: "white",
//                       cursor: "pointer",
//                       transition: "0.3s",
//                     }}
//                     onMouseOver={(e) => (e.target.style.background = "#0056b3")}
//                     onMouseOut={(e) => (e.target.style.background = "#007bff")}
//                   >
//                     Change Role
//                   </button>
//                 </>
//               )}
//               {isAddingRole ? (
//                 <>
//                   <select
//                     onChange={(e) => handleNewRoleChange(e.target.value)}
//                     style={{
//                       width: "120px",
//                       padding: "6px 10px",
//                       fontSize: "14px",
//                       borderRadius: "6px",
//                       border: "1px solid #ccc",
//                       background: "#f8f8f8",
//                       cursor: "pointer",
//                       textAlign: "center",
//                     }}
//                   >
//                     <option value="">Select Role</option>
//                     {availableRoles.map((role) => (
//                       <option key={role} value={role}>
//                         {role.charAt(0).toUpperCase() + role.slice(1)}
//                       </option>
//                     ))}
//                   </select>

//                   {selectedNewRole && (
//                     <button
//                       // ✅ Ensuring onClick is present
//                       disabled={isSubmitting}
//                       style={{
//                         marginLeft: "10px",
//                         padding: "5px 10px",
//                         fontSize: "14px",
//                         borderRadius: "6px",
//                         border: "none",
//                         background: isSubmitting ? "#ccc" : "#28a745",
//                         color: "white",
//                         cursor: isSubmitting ? "not-allowed" : "pointer",
//                         transition: "0.3s",
//                       }}
//                     >
//                       {isSubmitting ? "Adding..." : "Submit"}
//                     </button>
//                   )}
//                 </>
//               ) : (
//                 <button
//                   onClick={() => setIsAddingRole(true)}
//                   style={{
//                     padding: "5px 10px",
//                     fontSize: "14px",
//                     borderRadius: "6px",
//                     border: "none",
//                     background: "#28a745",
//                     color: "white",
//                     cursor: "pointer",
//                     transition: "0.3s",
//                     marginLeft: "6px",
//                   }}
//                 >
//                   Add Role
//                 </button>
//               )}
//             </p>
//             {!prof && (
//               <button
//                 onClick={handleRedirect}
//                 style={{
//                   marginLeft: "10px",
//                   padding: "5px 10px",
//                   fontSize: "14px",
//                   borderRadius: "6px",
//                   border: "none",
//                   background: "blue",
//                   color: "white",
//                   cursor: isSubmitting ? "not-allowed" : "pointer",
//                   transition: "0.3s",
//                 }}
//               >
//                 Complete Your Profile
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {!searchActive ? (
//         <div>
//           <div className="section-container">
//             <h3>Accepted Students</h3>
//             <div className="search-section">
//               <input
//                 type="text"
//                 value={searchAcceptedEmail}
//                 onChange={handleSearchAcceptedEmail}
//                 placeholder="Search Accepted Students by Email"
//                 className="search-input"
//               />
//             </div>

//             {filteredAcceptedStudents.length > 0 ? (
//               <table className="mentor-table">
//                 <thead>
//                   <tr>
//                     <th>Email</th>
//                     <th>Monitor</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredAcceptedStudents.map((student) => (
//                     <tr key={student.id}>
//                       <td>{student.email}</td>
//                       <td>
//                         <button
//                           className="view-button"
//                           onClick={() => handleMonitorStudent(student.id)}
//                         >
//                           Monitor
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             ) : (
//               <p>No accepted students found.</p>
//             )}
//           </div>

//           <div className="section-container">
//             <h3>Send Monitoring Request</h3>
//             <form onSubmit={handleSendRequest} className="request-form1">
//               <input
//                 type="email"
//                 value={nonAcceptedEmail}
//                 onChange={(e) => setNonAcceptedEmail(e.target.value)}
//                 placeholder="Enter Student Email"
//                 className="search-input1"
//                 required
//               />
//               <button type="submit" className="view-button1">
//                 Send Request
//               </button>
//             </form>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <h3>Answered Question Papers</h3>
//           <div className="filter-section2">
//             <label htmlFor="subject-filter">Filter by Subject:</label>
//             <select
//               id="subject-filter"
//               value={selectedSubject}
//               onChange={handleFilterBySubject}
//               className="filter-dropdown"
//             >
//               <option value="All Subjects">All Subjects</option>
//               <option value="English">English</option>
//               <option value="Maths">Maths</option>
//               <option value="Physics">Physics</option>
//               <option value="Chemistry">Chemistry</option>
//               <option value="Biology">Biology</option>
//               <option value="Computer Science">Computer Science</option>
//             </select>
//           </div>

//           {filteredPapers.length > 0 ? (
//             <table className="mentor-table">
//               <thead>
//                 <tr>
//                   <th>File Name</th>
//                   <th>Board</th>
//                   <th>Subject</th>
//                   <th>Total Marks</th>
//                   <th>Upload Date</th>
//                   <th>Answer</th>
//                   <th>Result</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredPapers.map((qp) => (
//                   <tr key={qp.id}>
//                     <td>
//                       <button
//                         className="view-button"
//                         onClick={() =>
//                           window.open(
//                             `http://127.0.0.1:8000/media/question_papers/${qp.file
//                               .split("/")
//                               .pop()}`,
//                             "_blank"
//                           )
//                         }
//                       >
//                         {qp.title}
//                       </button>
//                     </td>
//                     <td>{qp.board}</td>
//                     <td>{qp.subject}</td>
//                     <td>{qp.total_marks}</td>
//                     <td>{qp.upload_date}</td>
//                     <td>
//                       <button
//                         className="view-button"
//                         onClick={() =>
//                           window.open(
//                             `http://127.0.0.1:8000/media/answers/${qp.answer_file
//                               .split("/")
//                               .pop()}`,
//                             "_blank"
//                           )
//                         }
//                       >
//                         Download
//                       </button>
//                     </td>
//                     <td>
//                       {qp.result_status === "See Result" ? (
//                         <button
//                           className="view-button"
//                           onClick={() =>
//                             navigate("/grade-master/result", {
//                               state: {
//                                 questionPaperId: qp.id,
//                                 feedbackId: qp.feedback_id,
//                               },
//                             })
//                           }
//                         >
//                           See Result
//                         </button>
//                       ) : (
//                         <span>{qp.result_status}</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No answered question papers found.</p>
//           )}
//           {renderStatistics()}

//           <button
//             className="search-again-button"
//             onClick={() => {
//               setSearchActive(false);
//               setAnsweredPapers([]);
//               setStudentStats(null);
//               setSelectedStudentId(null);
//             }}
//           >
//             Back to Accepted Students
//           </button>
//         </div>
//       )}

//       {error && <p className="error-message">{error}</p>}
//     </div>
//   );
// };

// export default Mentor;

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

  const handleMonitorStudent = async (id) => {
    setSelectedStudentId(id);
    try {
      const [papersResponse, statsResponse] = await Promise.all([
        axios.get("http://localhost:8000/api/grade/question-papers/", {
          params: { user_id: id },
        }),
        axios.get("http://localhost:8000/api/grade/question-papers/", {
          params: { user_id: id },
        }),
      ]);

      setAnsweredPapers(papersResponse.data.answered_question_papers);
      setFilteredPapers(papersResponse.data.answered_question_papers);
      setAvailablePapers(papersResponse.data.available_question_papers);
      setStudentStats({
        available: papersResponse.data.available_question_papers,
        answered: papersResponse.data.answered_question_papers,
      });
      setSearchActive(true);
      setError("");
    } catch (err) {
      setError("Error fetching student data. Please try again.");
      console.error(err);
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

  const handleFilterBySubject = (e) => {
    const selected = e.target.value;
    setSelectedSubject(selected);
    setFilteredPapers(
      selected === "All Subjects"
        ? answeredPapers
        : answeredPapers.filter((qp) => qp.subject === selected)
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
                    <button
                      onClick={() => setIsEditing(true)}
                      className="changeRoleBtn"
                    >
                      Change Role
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="profileActions">
            <div className="roleManager">
              <div className="addRoleSection">
                {isAddingRole ? (
                  <div className="addRoleControls">
                    <select
                      onChange={(e) => handleNewRoleChange(e.target.value)}
                      className="newRoleSelect"
                    >
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
                  <button
                    onClick={() => setIsAddingRole(true)}
                    className="addRoleBtn"
                  >
                    Add Role
                  </button>
                )}
              </div>
            </div>

            {!prof && (
              <button onClick={handleRedirect} className="completeProfileBtn">
                Complete Your Profile
              </button>
            )}
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
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map((qp) => (
                      <tr key={qp.id}>
                        <td>
                          <button
                            className="viewButton"
                            onClick={() =>
                              window.open(
                                `http://127.0.0.1:8000/media/question_papers/${qp.file
                                  .split("/")
                                  .pop()}`,
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
                            className="downloadButton"
                            onClick={() =>
                              window.open(
                                `http://127.0.0.1:8000/media/answers/${qp.answer_file
                                  .split("/")
                                  .pop()}`,
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
                              onClick={() =>
                                navigate("/grade-master/result", {
                                  state: {
                                    questionPaperId: qp.id,
                                    feedbackId: qp.feedback_id,
                                  },
                                })
                              }
                            >
                              See Result
                            </button>
                          ) : (
                            <span className="pendingStatus">{qp.result_status}</span>
                          )}
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