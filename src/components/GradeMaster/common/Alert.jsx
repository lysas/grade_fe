import React from 'react';
import './Alert.css';

const Alert = ({ 
  isOpen, 
  message, 
  onClose, 
  primaryButtonText = 'Confirm',
  secondaryButtonText = 'Cancel',
  onPrimaryClick,
  onSecondaryClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="alertOverlay">
      <div className="alertBox">
        <p>{message}</p>
        <div className="alertActions">
          <button 
            className="customButton primary" 
            onClick={onPrimaryClick}
          >
            {primaryButtonText}
          </button>
          <button 
            className="customButton gray" 
            onClick={onSecondaryClick || onClose}
          >
            {secondaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert; 