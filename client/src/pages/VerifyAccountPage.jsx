import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';
// import './AuthPages.css';

function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const msg = searchParams.get('message');

    if (success === 'true') {
      setStatus('success');
      setMessage(msg || 'Your account has been successfully verified! You can now log in.');
    } else if (success === 'false') {
      setStatus('error');
      setMessage(msg || 'Account verification failed. The link may be invalid or expired.');
    } else {
      // Handle cases where parameters might be missing or invalid, maybe show a generic message or error
      setStatus('error');
      setMessage('Invalid verification attempt.');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Verifying...</span>
            </Spinner>
            <p className="mt-3">Verifying your account...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <CheckCircleFill size={60} className="text-success mb-3" />
            <h2 className="h4">Verification Successful!</h2>
            <Alert variant="success" className="mt-3">{message}</Alert>
            <Link to="/login" className="btn btn-primary mt-3">
              Proceed to Login
            </Link>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <XCircleFill size={60} className="text-danger mb-3" />
            <h2 className="h4">Verification Failed</h2>
            <Alert variant="danger" className="mt-3">{message}</Alert>
            <Link to="/register" className="btn btn-secondary mt-3 me-2">
              Register Again
            </Link>
            <Link to="/contact-support" className="btn btn-outline-secondary mt-3">
              Contact Support
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              {renderContent()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VerifyAccountPage; 