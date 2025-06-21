import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faMeh, faFrown } from '@fortawesome/free-regular-svg-icons';
import './Feebpop.css'
 
const FeedbackPopup = ({ onClose }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef(null);
 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
 
  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
  };
 
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
 
  const handleSubmit = async () => {
    if (!selectedEmoji && !comment.trim()) {
      // Don't submit if neither emoji nor comment is provided
      onClose();
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        emoji_rating: selectedEmoji,
        comment: comment.trim()
      };

      console.log('Submitting feedback:', feedbackData);

      // Get the base URL - use window.location for development
      const baseURL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : window.location.origin;
      const apiUrl = `${baseURL}/api/feedback/`;
      
      console.log('API URL:', apiUrl);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(feedbackData),
        credentials: 'include', // Include cookies for authentication
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Feedback submitted successfully:', result);
        // You could show a success message here
      } else {
        const errorText = await response.text();
        console.error('Failed to submit feedback:', response.status, response.statusText);
        console.error('Error response:', errorText);
        // You could show an error message here
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      console.error('Error details:', error.message);
      // You could show an error message here
    } finally {
      setIsSubmitting(false);
      // Reset state
      setSelectedEmoji(null);
      setComment('');
      // Close the popup
      onClose();
    }
  };
 
  return (
    <div className="feedback-overlay">
      <div className="feedback-popup" ref={popupRef}>
        <div className="emoji-container">
          <FontAwesomeIcon
            icon={faFrown}
            className={`emoji ${selectedEmoji === 'bad' ? 'selected' : ''}`}
            onClick={() => handleEmojiClick('bad')}
            data-testid="bad-emoji"
          />
          <FontAwesomeIcon
            icon={faMeh}
            className={`emoji ${selectedEmoji === 'neutral' ? 'selected' : ''}`}
            onClick={() => handleEmojiClick('neutral')}
            data-testid="neutral-emoji"
          />
          <FontAwesomeIcon
            icon={faSmile}
            className={`emoji ${selectedEmoji === 'good' ? 'selected' : ''}`}
            onClick={() => handleEmojiClick('good')}
            data-testid="good-emoji"
          />
        </div>
        <textarea
          placeholder="Enter your feedback here..."
          value={comment}
          onChange={handleCommentChange}
        />
        <button 
          className="submit-buttonf" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
};
 
export default FeedbackPopup;