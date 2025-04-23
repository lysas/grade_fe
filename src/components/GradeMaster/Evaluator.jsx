// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Evaluator.css";
// import userProfile from "./userProfile.jpeg"; // Assuming the image is in the same directory
// import { authService } from "../Authentication/authService";
// const Evaluator = () => {
//   const [answers, setAnswers] = useState([]);
//   const [filteredAnswers, setFilteredAnswers] = useState([]); // For filtered data
//   const [error, setError] = useState("");
//   const [selectedSubject, setSelectedSubject] = useState("All Subjects"); // Default filter option
//   const [isEditing, setIsEditing] = useState(false);
//   const user = authService.getCurrentUser();
//   const [selectedRole, setSelectedRole] = useState(
//        localStorage.getItem("activeRole") 
//     );
//   const navigate = useNavigate();

//   const allRoles = user?.roles; // Get all roles from localStorage
//   const userData = {
//     id: user?.id,
//     email: user?.email,
//     role: localStorage.getItem("activeRole") ,
//     is_premium: localStorage.getItem("is_premium"),
//   };
//   const [isAddingRole, setIsAddingRole] = useState(false);
//   const userRoles = ["qp_uploader", "evaluator", "student", "mentor"];
//   const [selectedNewRole, setSelectedNewRole] = useState(""); // Store new role selection
//   const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
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
//         const response = await axios.get(
//           "http://localhost:8000/api/grade/evaluator_question/",
//           {
//             params: { user_id: userData.id },
//           }
//         );

//         setAnswers(response.data);
//         setFilteredAnswers(response.data); // Initialize filtered data
//       } catch (error) {
//         console.error("Error fetching evaluator questions", error);
//         setError("Error fetching evaluator questions.");
//       }
//     };

//     fetchData();
//   }, []);

//   const handleFilterChange = (e) => {
//     const subject = e.target.value;
//     setSelectedSubject(subject);

//     if (subject === "All Subjects") {
//       setFilteredAnswers(answers); // Show all if "All Subjects" is selected
//     } else {
//       const filtered = answers.filter((answer) => answer.subject === subject);
//       setFilteredAnswers(filtered);
//     }
//   };

//   const handleCorrect = (answer) => {
//     navigate("/grade-master/correct", { state: { userData, answer } });
//   };

//   const handleMyEvaluations = () => {
//     navigate("/grade-master/myCorrection", { state: { userData } });
//   };
//   const handleRoleChange = (newRole) => {
//     localStorage.setItem("activeRole", newRole);
//     setSelectedRole(newRole);
//     setIsEditing(false);
//     navigate(`/grade-master/${newRole}`); // Redirect to the respective role page
//     window.location.reload(); // Ensure role-based content reloads
//   };
//   const addNewRole = (newRole) => {
//     if (!userRoles.includes(newRole)) {
//       const updatedRoles = [...userRoles, newRole];
//       localStorage.setItem("user_roles", updatedRoles.join(",")); // Save new role in localStorage
//       setIsAddingRole(false);
//       window.location.reload(); // Refresh UI
//     }
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
//     <div className="evaluator-page">
//       <div className="profile-section">
//         <div className="profile-container">
//           <img src={userProfile} alt="Profile" className="profile-photo" />
//           <div className="profile-details">
//             <h2>Evaluator Profile</h2>
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
//                       onClick={handleSubmitNewRole} // ✅ Ensuring onClick is present
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

//       {error && <p className="error">{error}</p>}

//       <div className="answers-section">
//         <div className="filter-container">
//           <label htmlFor="subject-filter" className="filter-label">
//             Filter by Subject:
//           </label>
//           <select
//             id="subject-filter"
//             className="filter-dropdown"
//             value={selectedSubject}
//             onChange={handleFilterChange}
//           >
//             <option value="All Subjects">All Subjects</option>
//             <option value="English">English</option>
//             <option value="Maths">Maths</option>
//             <option value="Physics">Physics</option>
//             <option value="Chemistry">Chemistry</option>
//             <option value="Biology">Biology</option>
//             <option value="Computer Science">Computer Science</option>
//           </select>
//         </div>
//         <div className="answers-section">
//           <div className="his" style={{ gap: "160px" }}>
//             <h3 className="answers-title">Pending Evaluations</h3>
//             <button
//               className="my-evaluations-button"
//               onClick={handleMyEvaluations}
//             >
//               My Evaluations
//             </button>
//           </div>
//         </div>

//         <table className="answers-table">
//           <thead>
//             <tr>
//               <th>Question Paper Title</th>
//               <th>Total Marks</th>
//               <th>Subject</th>
//               <th>Board</th>
//               <th>Download Answer</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredAnswers.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="no-data-message">
//                   No Answer Sheets Found
//                 </td>
//               </tr>
//             ) : (
//               filteredAnswers.map((answer) => (
//                 <tr key={answer.id}>
//                   <td>
//                     <button
//                       className="view-button"
//                       onClick={() =>
//                         window.open(
//                           `http://127.0.0.1:8000/media/question_papers/${answer.question_paper_file
//                             .split("/")
//                             .pop()}`,
//                           "_blank"
//                         )
//                       }
//                     >
//                       {answer.qp_title}
//                     </button>
//                   </td>
//                   <td>{answer.total_marks}</td>
//                   <td>{answer.subject}</td>
//                   <td>{answer.board}</td>
//                   <td>
//                     <button
//                       className="view-button"
//                       onClick={() =>
//                         window.open(
//                           `http://127.0.0.1:8000/media/answers/${answer.answer_file
//                             .split("/")
//                             .pop()}`,
//                           "_blank"
//                         )
//                       }
//                     >
//                       Download
//                     </button>
//                   </td>
//                   <td>
//                     <button
//                       className="view-button"
//                       onClick={() => handleCorrect(answer)}
//                     >
//                       Correct
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Evaluator;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Student.css"; // Import Student.css instead of Evaluator.css
import userProfile from "./userProfile.jpeg";
import { authService } from "../Authentication/authService";

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
    onClick={() => navigate("/grade-master/statevaluator")}
    className="statsButton"
  >
    <i className="fas fa-chart-line"></i> Statistics
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
                filteredAnswers.map((answer) => (
                  <tr key={answer.id}>
                    <td>
                      <button
                        className="viewButton"
                        onClick={() =>
                          window.open(
                            `http://127.0.0.1:8000/media/question_papers/${answer.question_paper_file
                              .split("/")
                              .pop()}`,
                            "_blank"
                          )
                        }
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
                        onClick={() =>
                          window.open(
                            `http://127.0.0.1:8000/media/answers/${answer.answer_file
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
                      <button
                        className="actionButton"
                        onClick={() => handleCorrect(answer)}
                      >
                        Correct
                      </button>
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

export default Evaluator;