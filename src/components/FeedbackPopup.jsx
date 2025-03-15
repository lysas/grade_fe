import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faMeh, faFrown } from '@fortawesome/free-regular-svg-icons';
import './Feebpop.css'
const FeedbackPopup = ({ onClose }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [comment, setComment] = useState('');

  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log('Selected Emoji:', selectedEmoji);
    console.log('Comment:', comment);
    // Reset state
    setSelectedEmoji(null);
    setComment('');
    // Close the popup
    onClose();
  };

  return (
    <div className="feedback-popup">
      <div className="emoji-container">
        <FontAwesomeIcon
          icon={faFrown}
          className={`emoji ${selectedEmoji === 'bad' && 'selected'}`}
          onClick={() => handleEmojiClick('bad')}
          data-testid="bad-emoji" // Add this line
        />
        <FontAwesomeIcon
          icon={faMeh}
          className={`emoji ${selectedEmoji === 'neutral' && 'selected'}`}
          onClick={() => handleEmojiClick('neutral')}
          data-testid="neutral-emoji" // Add this line
        />
        <FontAwesomeIcon
          icon={faSmile}
          className={`emoji ${selectedEmoji === 'good' && 'selected'}`}
          onClick={() => handleEmojiClick('good')}
          data-testid="good-emoji" // Add this line
        />

      </div>
      <textarea
        placeholder="Enter your feedback here..."
        value={comment}
        onChange={handleCommentChange}
      />
      <button className="submit-button" onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default FeedbackPopup;
