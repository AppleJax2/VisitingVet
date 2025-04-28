import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Form, Spinner, Row, Col, ListGroup, InputGroup } from 'react-bootstrap';
import { ShieldLock, QrCode, Check2Circle, ClipboardCheck, X, Eye, EyeSlash } from 'react-bootstrap-icons';
import { setupMFA, verifyAndEnableMFA, disableMFA } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminMFASetupPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1); // 1: intro, 2: setup, 3: verify
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user && user.role && user.role.name !== 'Admin') {
      navigate('/dashboard');
    }
    
    // Check if MFA is already enabled
    if (user && user.mfaEnabled) {
      setMfaEnabled(true);
    }
  }, [user, navigate]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await setupMFA();
      
      if (response && response.success) {
        setQrCode(response.qrCode);
        setSecret(response.secret);
        setBackupCodes(response.backupCodes);
        setStep(2);
      } else {
        setError('Failed to start MFA setup. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while setting up MFA.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await verifyAndEnableMFA(verificationCode);
      
      if (response && response.success) {
        setSuccess('MFA has been successfully enabled for your account.');
        setMfaEnabled(true);
        setStep(3);
      } else {
        setError('Failed to verify MFA. Please check your verification code and try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while verifying MFA.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (e) => {
    e.preventDefault();
    setIsDisabling(true);
    setError('');
    
    try {
      const response = await disableMFA(disableCode);
      
      if (response && response.success) {
        setSuccess('MFA has been successfully disabled for your account.');
        setMfaEnabled(false);
        setStep(1);
        setDisableCode('');
      } else {
        setError('Failed to disable MFA. Please check your verification code and try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while disabling MFA.');
    } finally {
      setIsDisabling(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        setError('Failed to copy to clipboard. Please copy manually.');
      }
    );
  };

  return (
    <Container>
      <h2 className="mb-4">
        <ShieldLock className="me-2" />
        Two-Factor Authentication (2FA)
      </h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Multi-Factor Authentication</h5>
        </Card.Header>
        <Card.Body>
          <p>
            Multi-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
            This helps protect your account even if your password is compromised.
          </p>
          
          {mfaEnabled ? (
            <div>
              <Alert variant="success">
                <Check2Circle className="me-2" />
                Two-factor authentication is currently <strong>enabled</strong> for your account.
              </Alert>
              
              <Card className="my-3">
                <Card.Header>Disable 2FA</Card.Header>
                <Card.Body>
                  <p>
                    To disable two-factor authentication, please enter the current verification code from your authenticator app.
                  </p>
                  
                  <Form onSubmit={handleDisableMFA}>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.trim())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required
                      />
                    </Form.Group>
                    
                    <Button 
                      type="submit" 
                      variant="danger" 
                      disabled={isDisabling || !disableCode || disableCode.length < 6}
                    >
                      {isDisabling ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Disabling...
                        </>
                      ) : (
                        <>
                          <X className="me-2" />
                          Disable 2FA
                        </>
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div>
              {step === 1 && (
                <div>
                  <Alert variant="warning">
                    Two-factor authentication is currently <strong>disabled</strong> for your account.
                  </Alert>
                  
                  <p>Follow these steps to enable 2FA:</p>
                  <ol>
                    <li>Install an authenticator app on your mobile device (Google Authenticator, Authy, etc.)</li>
                    <li>Scan the QR code or manually enter the secret key in your authenticator app</li>
                    <li>Enter the verification code from your authenticator app to complete setup</li>
                    <li>Save the backup codes in a secure location in case you lose access to your authenticator app</li>
                  </ol>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleStartSetup}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Setting up...
                      </>
                    ) : (
                      'Start Setup'
                    )}
                  </Button>
                </div>
              )}
              
              {step === 2 && (
                <div>
                  <h5>Step 1: Scan QR Code</h5>
                  <p>Scan this QR code with your authenticator app:</p>
                  
                  <div className="text-center mb-4">
                    <img src={qrCode} alt="QR Code" style={{ maxWidth: '200px', border: '1px solid #ddd' }} />
                  </div>
                  
                  <h5>Step 2: Or Manually Enter Secret Key</h5>
                  <p>If you can't scan the QR code, enter this secret key in your authenticator app:</p>
                  
                  <InputGroup className="mb-3">
                    <Form.Control
                      value={secret}
                      readOnly
                      type={showSecret ? 'text' : 'password'}
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeSlash /> : <Eye />}
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => copyToClipboard(secret)}
                    >
                      <ClipboardCheck /> {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </InputGroup>
                  
                  <h5>Step 3: Save Backup Codes</h5>
                  <p>Save these backup codes in a secure location. Each code can be used once if you lose access to your authenticator app:</p>
                  
                  <Card className="mb-4">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <div>Backup Codes</div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        {showBackupCodes ? <EyeSlash /> : <Eye />}
                      </Button>
                    </Card.Header>
                    {showBackupCodes && (
                      <ListGroup variant="flush">
                        <Row className="m-0">
                          {backupCodes.map((code, index) => (
                            <Col key={index} xs={6} md={4} className="p-0">
                              <ListGroup.Item>{code}</ListGroup.Item>
                            </Col>
                          ))}
                        </Row>
                      </ListGroup>
                    )}
                    {!showBackupCodes && (
                      <Card.Body className="text-center">
                        <p className="text-muted">Click the eye icon to view your backup codes</p>
                      </Card.Body>
                    )}
                    <Card.Footer>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => copyToClipboard(backupCodes.join('\n'))}
                      >
                        <ClipboardCheck className="me-1" /> 
                        {copied ? 'Copied!' : 'Copy All Codes'}
                      </Button>
                    </Card.Footer>
                  </Card>
                  
                  <h5>Step 4: Verify Setup</h5>
                  <p>Enter the verification code from your authenticator app to complete setup:</p>
                  
                  <Form onSubmit={handleVerify}>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.trim())}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        required
                      />
                    </Form.Group>
                    
                    <div className="d-flex">
                      <Button 
                        type="button" 
                        variant="outline-secondary" 
                        className="me-2"
                        onClick={() => setStep(1)}
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading || !verificationCode || verificationCode.length < 6}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Verifying...
                          </>
                        ) : (
                          'Verify and Enable'
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
              
              {step === 3 && (
                <div className="text-center p-4">
                  <div className="mb-4">
                    <Check2Circle size={64} className="text-success" />
                  </div>
                  <h4>Two-Factor Authentication Enabled</h4>
                  <p>Your account is now protected with an additional layer of security.</p>
                  <p>You will be asked for a verification code when signing in.</p>
                  
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminMFASetupPage; 