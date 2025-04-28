import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ProgressBar, Form } from 'react-bootstrap';
import { 
  calculatePasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor,
  validatePasswordStrength 
} from '../../utils/passwordUtils';

const PasswordStrengthMeter = ({ password, showValidation = true }) => {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#dc3545');
  const [validation, setValidation] = useState({ isValid: false, errors: [] });
  
  useEffect(() => {
    if (password) {
      const score = calculatePasswordStrength(password);
      setStrength(score);
      setLabel(getPasswordStrengthLabel(score));
      setColor(getPasswordStrengthColor(score));
      
      // Calculate validation errors
      const validationResult = validatePasswordStrength(password);
      setValidation(validationResult);
    } else {
      setStrength(0);
      setLabel('');
      setColor('#dc3545');
      setValidation({ isValid: false, errors: [] });
    }
  }, [password]);
  
  return (
    <div className="password-strength-meter mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small>Password Strength</small>
        <small style={{ color }}>{label}</small>
      </div>
      
      <ProgressBar 
        now={strength} 
        variant={strength > 60 ? 'success' : strength > 30 ? 'warning' : 'danger'} 
        style={{ height: '8px' }}
      />
      
      {showValidation && password && !validation.isValid && (
        <Form.Text className="text-danger mt-2">
          <ul className="ps-3 mb-0">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Form.Text>
      )}
    </div>
  );
};

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string.isRequired,
  showValidation: PropTypes.bool
};

export default PasswordStrengthMeter; 