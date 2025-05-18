import React from 'react';
import './Label.css';

const Label = ({ htmlFor, children, required = false }) => {
  return (
    <label htmlFor={htmlFor} className="common-label">
      {children}
      {required && <span className="required-mark">*</span>}
    </label>
  );
};

export default Label; 