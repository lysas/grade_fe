import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Main.css"; // Import CSS for styling

const Main = () => {
  const [adminRequests, setAdminRequests] = useState([]);
  const [evaluatorRequests, setEvaluatorRequests] = useState([]);

  useEffect(() => {
    // Fetch requests from the backend
    axios
      .get("http://127.0.0.1:8000/api/grade/main-requests/") 
      .then((response) => {
        const data = response.data;
        const admin = data.filter((request) => request.role === "admin");
        const evaluator = data.filter((request) => request.role === "evaluator");
        setAdminRequests(admin);
        setEvaluatorRequests(evaluator);
      })
      .catch((error) => {
        console.error("Error fetching requests:", error);
      });
  }, []);

  const handleAction = (id, action) => {
    const url = `http://127.0.0.1:8000/api/grade/accept_main_request/${id}/${action}/`; // Update with your backend URL
  
    axios
      .post(url)
      .then((response) => {
        console.log(response.data.message);
        // Remove the request from the respective list
        setAdminRequests((prev) => prev.filter((req) => req.id !== id));
        setEvaluatorRequests((prev) => prev.filter((req) => req.id !== id));
      })
      .catch((error) => {
        console.error(`Error performing ${action} action:`, error);
      });
  };
  

  const renderTable = (requests, role) => (
    <div className={`main-request-section main-request-section-${role}`}>
      <h2 className={`main-request-title main-request-title-${role}`}>
        {role === "admin" ? "Admin Requests" : "Evaluator Requests"}
      </h2>
      <div className="main-request-table-wrapper">
        <table className={`main-request-table main-request-table-${role}`}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              {/* <th>Board</th>
              <th>Subject</th> */}
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.email}</td>
                  <td>{request.role}</td>
                  {/* <td>{request.board}</td>
                  <td>{request.subject}</td> */}
                  <td>
                    <button
                      className="view-button"
                      onClick={() =>
                        window.open(
                          `http://127.0.0.1:8000/media/resumes/${request.resume.split('/').pop()}`,
                          '_blank'
                        )
                      }
                    >
                      View Resume
                    </button>
                  </td>
                  <td>
                    <button
                      className="main-request-btn accept-btn"
                      onClick={() => handleAction(request.id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="main-request-btn reject-btn"
                      onClick={() => handleAction(request.id, "reject")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-requests-row">
                  No requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="main-request-container">
      {renderTable(adminRequests, "admin")}
      {renderTable(evaluatorRequests, "evaluator")}
    </div>
  );
};

export default Main;
