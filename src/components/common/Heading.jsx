import React from 'react';
import './Heading.css';

const Heading = ({ children, className = '' }) => {
  return (
    <h1 className={`common-heading ${className}`}>
      {children}
    </h1>
  );
};

export default Heading; 