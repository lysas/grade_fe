import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon
}) => {
  const buttonClass = `customButton ${variant} ${className} ${disabled ? 'disabled' : ''}`;
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  );
};

export default Button; 