import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Notifications.css';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { authService } from "../Authentication/authService";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getCurrentUser();

  // Get user data from localStorage
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole"),
  };

  useEffect(() => {
    if (userData.email && userData.role) {
      setLoading(true);
      setError(null);
      axios
        .get(`http://localhost:8000/api/grade/notifications/?email=${userData.email}&role=${userData.role}`)
        .then((response) => {
          if (response.status === 200) {
            setNotifications(response.data);
          } else {
            setError('Failed to fetch notifications.');
          }
        })
        .catch((error) => {
          setError('Error fetching notifications: ' + error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('User data is missing or incorrect.');
      setLoading(false);
    }
  }, [userData.email, userData.role]);

  const handleAction = (notificationId, action) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (action === 'approve') {
      // Logic for Approve Request
      axios
        .post(`http://localhost:8000/api/grade/mentor-student/`, {
          mentor_email: userData.email, // Current user's email
          student_email: notification.sender_email, // Email of the student in the notification
        })
        .then((response) => {
          if (response.status === 201 || response.status === 200) {
            setNotifications((prevNotifications) =>
              prevNotifications.map((n) =>
                n.id === notificationId
                  ? { ...n, is_read: true, mentor_request: false, message: 'Request Approved' }
                  : n
              )
            );
            console.log('Mentor-student relationship approved:', response.data.message);
          }
          // Optional reload
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error approving mentor-student relationship:', error.message);
        });
    }
    axios
      .post(`http://localhost:8000/api/grade/notifications/${notificationId}/update/`, { action })
      .then((response) => {
        if (response.status === 200) {
          setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    is_read: true,
                    mentor_request: action !== 'read',
                    message: response.data.message,
                  }
                : notification
            )
          );
        }
        window.location.reload();
      })
      
      .catch((error) => {
        console.error('Error updating notification:', error.message);
      });
  };

  const handleMarkAsRead = (notificationId) => {
    handleAction(notificationId, 'read');
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
            >
              <p>
                <strong>From:</strong> {notification.sender_email} ({notification.sender_role})
              </p>

              {notification.is_mentor_request ? (
                <div className="mentor-request">
                  <p>
                    <strong>Mentor Request:</strong> {notification.message}
                  </p>
                  <div className="mentor-actions">
                    <FaCheck
                      className="action-icon approve"
                      onClick={() => handleAction(notification.id, 'approve')}
                
                      title="Approve Request"
                    />
                    <FaTimes
                      className="action-icon reject"
                      onClick={() => handleAction(notification.id, 'reject')}
                      title="Reject Request"
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="normal-notification"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <p>{notification.message}</p>
                </div>
              )}

              <small>{new Date(notification.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
