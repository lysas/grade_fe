import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon,
  isLoading = false,
  fullWidth = false
}) => {
  const buttonClass = `btn-common ${variant} ${className} ${disabled ? 'disabled' : ''} ${fullWidth ? 'full-width' : ''}`;
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        children // Only show loading text
      ) : variant === "icon" ? (
        <>
          {icon && <span className="button-icon">{icon}</span>}
        </>
      ) : (
        <>
          {icon && <span className="button-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button; 