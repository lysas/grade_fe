import React from 'react';

const TextArea = ({
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
  readOnly = false,
  ...props
}) => {
  const textareaClass = `textarea-common ${error ? 'error' : ''} ${className}`;
  
  return (
    <div className="textarea-wrapper">
      {label && (
        <label htmlFor={id} className="textarea-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      <textarea
        className={textareaClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        readOnly={readOnly}
        style={{ color: '#222', backgroundColor: '#FAFAFA', ...(props.style || {}) }}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TextArea; 