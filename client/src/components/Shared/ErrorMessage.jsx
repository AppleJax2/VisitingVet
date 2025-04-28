import React from 'react';
import { Alert } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

// Basic Error Message component using Bootstrap Alert
function ErrorMessage({ message, title = 'Error', variant = 'danger' }) {
  if (!message) {
    return null; // Don't render if no message
  }

  return (
    <Alert variant={variant} className="d-flex align-items-center error-message-component">
      <ExclamationTriangleFill className="me-2" />
      <div>
        {title && <Alert.Heading as="h6">{title}</Alert.Heading>}
        <p className="mb-0">{message}</p>
      </div>
    </Alert>
  );
}

export default ErrorMessage; 