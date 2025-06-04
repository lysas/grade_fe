import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./UploadHistory.css"; // Assuming you'll add CSS for table styling

const UploadHistory = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState("");

  // Fetch upload history data for the logged-in admin
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const email = localStorage.getItem("userEmail"); // Assuming the email is stored in localStorage
        const response = await axios.get(
          `http://localhost:8000/api/grade/uploadHistory/${email}/`
        );

        setUploads(response.data); // Assuming the response contains an array of uploads
      } catch (error) {
        setError("Error fetching upload history.");
        console.error("Error fetching upload history:", error);
      }
    };

    fetchUploads();
  }, []);



  return (
    <div className="upload-history-page">
      <header className="history-header">
        <h1>Upload History</h1>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="upload-history-table">
        <table>
          <thead>
            <tr>
              <th>Test Title</th>
              <th>Board</th>
              <th>Subject</th>
              <th>Total Marks</th>
              <th>Total Questions</th>
              <th>Question Paper</th>
              <th>Uploaded On</th>
            </tr>
          </thead>
          <tbody>
            {uploads.length > 0 ? (
              uploads.map((upload, index) => (
                <tr key={index}>
                  <td>{upload.test_title}</td>
                  <td>{upload.board}</td>
                  <td>{upload.subject}</td>
                  <td>{upload.total_marks}</td>
                  <td>{upload.total_questions} </td>

                  <td>
                    <button
                      className="view-button"
                      onClick={() => {
                        if (upload.file_name) {
                          const fileName = upload.file_name.split("/").pop();
                          window.open(
                            `http://127.0.0.1:8000/media/question_papers/sample/${fileName}`,
                            "_blank"
                          );
                        } else {
                          alert("No file available for download");
                        }
                      }}
                    >
                      Download
                    </button>
                  </td>
                  <td>{upload.upload_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No uploads found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadHistory;
