import React from 'react';
import './Select.css';

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  multiple = false,
  ...props
}) => {
  const selectClass = `select-common ${error ? 'error' : ''} ${className}`;
  
  return (
    <div className="select-wrapper">
      {label && (
        <label htmlFor={id} className="select-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <select
        className={selectClass}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        multiple={multiple}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Select; 