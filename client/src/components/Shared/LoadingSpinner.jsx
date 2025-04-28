import React from 'react';
import { Spinner } from 'react-bootstrap';

// Basic Loading Spinner component using Bootstrap Spinner
function LoadingSpinner({ animation = 'border', role = 'status', size = 'md', message = 'Loading...' }) {
  return (
    <div className="text-center loading-spinner-component">
      <Spinner animation={animation} role={role} size={size} aria-label={message}>
        <span className="visually-hidden">{message}</span>
      </Spinner>
      {/* Optionally display a message below the spinner */} 
      {/* {message && <p className="mt-2">{message}</p>} */} 
    </div>
  );
}

export default LoadingSpinner; 