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

  // Get user data from localStorage with better error handling
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole"),
    roles: user?.roles || [],
    is_allowed: user?.is_allowed,
    is_profile_completed: user?.is_profile_completed,
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userData.email) {
        setError('User email is missing');
        setLoading(false);
        return;
      }

      if (!userData.roles || userData.roles.length === 0) {
        setError('No roles found for the user');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Create an array of promises for each role
        const notificationPromises = userData.roles.map(role =>
          axios.get(`http://localhost:8000/api/grade/notifications/?email=${userData.email}&role=${role}`)
        );

        // Fetch notifications for all roles
        const responses = await Promise.all(notificationPromises);
        
        // Combine notifications from all roles
        const allNotifications = responses.flatMap(response => 
          response.status === 200 ? response.data : []
        );
        
        // Sort notifications by created_at in descending order (newest first)
        const sortedNotifications = allNotifications.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setNotifications(sortedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Error fetching notifications: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userData.email, userData.roles]);

  const handleAction = async (notificationId, action) => {
    try {
      const notification = notifications.find((n) => n.id === notificationId);
      
      if (action === 'approve') {
        // Logic for Approve Request
        const response = await axios.post(`http://localhost:8000/api/grade/mentor-student/`, {
          mentor_email: userData.email,
          student_email: notification.sender_email,
        });

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
      }

      const updateResponse = await axios.post(
        `http://localhost:8000/api/grade/notifications/${notificationId}/update/`,
        { action }
      );

      if (updateResponse.status === 200) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                  mentor_request: action !== 'read',
                  message: updateResponse.data.message,
                }
              : notification
          )
        );
      }
      
      // Refresh the page after successful action
      window.location.reload();
    } catch (error) {
      console.error('Error handling notification action:', error);
      setError('Error processing notification: ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkAsRead = (notificationId) => {
    handleAction(notificationId, 'read');
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-message">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">Error: {error}</div>
      </div>
    );
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
              <p>
                <strong>Role:</strong> {notification.role}
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
