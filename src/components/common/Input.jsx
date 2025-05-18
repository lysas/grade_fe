import React from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  ...props
}) => {
  const inputClass = `input-common ${error ? 'error' : ''} ${className}`;
  
  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input; 