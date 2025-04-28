import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../services/apiClient'; // Assuming axios instance setup
import { toast } from 'react-hot-toast'; // Assuming toast notifications
import logger from '../../utils/logger'; // Assuming logger utility
import PasswordStrengthMeter from '../../components/Shared/PasswordStrengthMeter';
import { validatePasswordStrength } from '../../utils/passwordUtils';

// Basic styling (replace with your UI library components or CSS modules)
const styles = {
  container: { padding: '2rem', maxWidth: '400px', margin: 'auto' },
  input: { display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' },
  button: { padding: '0.75rem 1.5rem', cursor: 'pointer' },
  error: { color: 'red', marginBottom: '1rem' },
  success: { color: 'green', marginBottom: '1rem' }
};

function AdminResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(!!resetToken); // Start in reset mode if token exists

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!email) {
      setError('Please enter your admin email address.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.post('/admin/auth/request-password-reset', { email });
      setSuccessMessage(response.data.message || 'If an admin account with this email exists, a password reset link has been sent.');
      setEmail(''); // Clear email field on success
      logger.info(`Admin password reset requested for: ${email}`);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to request password reset.';
      setError(message);
      logger.error('Admin password reset request failed:', err);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.put(`/admin/auth/reset-password/${resetToken}`, { password });
      setSuccessMessage(response.data.message || 'Password reset successful. You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
      setIsTokenValid(false); // Prevent reuse/resubmit
      logger.info(`Admin password successfully reset using token: ${resetToken.substring(0, 6)}...`);
      // Redirect to login after a short delay?
      setTimeout(() => navigate('/admin'), 3000);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to reset password. The link may be invalid or expired.';
      setError(message);
      logger.error('Admin password reset failed:', err);
    }
    setIsLoading(false);
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-center">
        <Card style={{ maxWidth: '500px', width: '100%' }}>
          <Card.Header as="h4" className="text-center bg-primary text-white">
            {isTokenValid ? 'Reset Admin Password' : 'Request Admin Password Reset'}
          </Card.Header>
          <Card.Body className="p-4">
            {isTokenValid ? (
              <Form onSubmit={handleResetPassword}>
                <p className="text-muted mb-4">Enter your new password below.</p>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <PasswordStrengthMeter password={password} />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    isInvalid={confirmPassword && password !== confirmPassword}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <Form.Control.Feedback type="invalid">
                      Passwords do not match
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </div>
              </Form>
            ) : (
              <Form onSubmit={handleRequestReset}>
                <p className="text-muted mb-4">
                  Enter your admin email address below. If an account exists, 
                  we will send you a link to reset your password.
                </p>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                
                <Form.Group className="mb-4" controlId="email">
                  <Form.Label>Admin Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default AdminResetPasswordPage; 