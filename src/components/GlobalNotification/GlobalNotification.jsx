import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import './GlobalNotification.css';

const GlobalNotification = () => {
  const {
    notifications,
    showNotifications,
    setShowNotifications,
    markAsRead,
    removeNotification
  } = useNotifications();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewResult = async (notification) => {
    if (notification.answerId) {
      try {
        // First, fetch the answer details
        const response = await fetch(`http://localhost:8000/api/grade/answer-ocr-data/${notification.answerId}/`);
        const data = await response.json();

        if (data) {
          // Mark notification as read
          markAsRead(notification.id);
          setShowNotifications(false);

          // Navigate to upload answer page with all necessary state
          navigate('/grade-master/upload-answer', {
            state: {
              answerId: notification.answerId,
              showResult: true,
              jsonData: data.json_data,
              questionPaper: data.question_paper,
              questionPaperType: data.question_paper_type,
              userEmail: data.user_email,
              userId: data.user_id
            }
          });
        }
      } catch (error) {
        console.error('Error fetching answer details:', error);
        // If there's an error, just navigate to the student page
        navigate('/grade-master/student');
      }
    }
  };

  return (
    <>
      <div className="notification-bell" onClick={() => setShowNotifications(true)}>
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      <div className={`notification-center ${showNotifications ? 'show' : ''}`}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <button onClick={() => setShowNotifications(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="notification-list">
          {notifications.length === 0 ? (
            <p className="no-notifications">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`notification-item ${notification.type}`}>
                <div className="notification-content">
                  <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  <span>{notification.message}</span>
                </div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
                <div className="notification-actions">
                  {notification.answerId && (
                    <button 
                      className="view-result-button"
                      onClick={() => handleViewResult(notification)}
                    >
                      View Result
                    </button>
                  )}
                  <button 
                    className="remove-notification-button"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default GlobalNotification; 