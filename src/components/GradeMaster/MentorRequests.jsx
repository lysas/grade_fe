import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MentorRequests.css'; // Add styling if necessary

const MentorRequests = () => {
  const [mentorRequests, setMentorRequests] = useState([]);
  const [error, setError] = useState('');

  const userData = {
    id: localStorage.getItem('userId'),
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('role'),
  };

  useEffect(() => {
    const fetchMentorRequests = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/grade/mentor-requests/${userData.id}/`);
        setMentorRequests(response.data);
        console.log('Fetched Mentor Requests:', response.data);
      } catch (err) {
        setError('Error fetching mentor requests.');
        console.error('Error fetching mentor requests:', err);
      }
    };

    fetchMentorRequests();
  }, [userData.id]);

  return (
    <div className="mentor-requests-page">
      <h2>Mentorship Requests</h2>

      {error && <p className="error-message">{error}</p>}

      <table className="mentor-requests-table">
        <thead>
          <tr>
            <th>Mentor Name</th>
            <th>Status</th>
            <th>Requested At</th>
          </tr>
        </thead>
        <tbody>
          {mentorRequests.length === 0 ? (
            <tr>
              <td colSpan="3" className="no-data-message">No Mentorship Requests Found</td>
            </tr>
          ) : (
            mentorRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.men_email}</td> {/* Adjust field names based on serializer */}
                <td>{req.status}</td>
                <td>{new Date(req.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MentorRequests;
