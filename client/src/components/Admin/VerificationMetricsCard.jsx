import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { ClockHistory, CheckCircleFill, XCircleFill, HourglassSplit } from 'react-bootstrap-icons';
import apiClient from '../../services/api';
import logger from '../../utils/logger';

function VerificationMetricsCard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError('');
      try {
        logger.info('Fetching verification metrics...');
        const response = await apiClient.get('/admin/verifications/metrics');
        if (response.data.success) {
          setMetrics(response.data.metrics);
        } else {
          throw new Error(response.data.error || 'Failed to load metrics');
        }
      } catch (err) {
        logger.error('Failed to fetch verification metrics:', err);
        setError(err.response?.data?.error || err.message || 'Could not load verification metrics.');
        setMetrics(null);
      }
      setLoading(false);
    };

    fetchMetrics();
    // Optional: Add a timer to refetch periodically
    // const intervalId = setInterval(fetchMetrics, 60000); // Refetch every minute
    // return () => clearInterval(intervalId);

  }, []);

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading Metrics...</div>;
    }
    if (error) {
      return <Alert variant="warning" className="m-3">{error}</Alert>;
    }
    if (!metrics) {
      return <Alert variant="secondary" className="m-3">Metrics data not available.</Alert>;
    }

    return (
      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
          <span><HourglassSplit className="me-2" /> Pending Requests</span>
          <Badge bg="warning" text="dark" pill>
            {metrics.pending ?? 'N/A'}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item>
            <Row>
                <Col xs={12} md={6} className="mb-2 mb-md-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <span><CheckCircleFill className="me-2 text-success" /> Approved (Today)</span>
                        <Badge bg="success" pill>{metrics.approved?.today ?? 'N/A'}</Badge>
                    </div>
                     <div className="d-flex justify-content-between align-items-center mt-1">
                        <span><CheckCircleFill className="me-2 text-success" /> Approved (7d)</span>
                        <Badge bg="success" pill>{metrics.approved?.last7Days ?? 'N/A'}</Badge>
                    </div>
                     <div className="d-flex justify-content-between align-items-center mt-1">
                        <span><CheckCircleFill className="me-2 text-success" /> Approved (30d)</span>
                        <Badge bg="success" pill>{metrics.approved?.last30Days ?? 'N/A'}</Badge>
                    </div>
                </Col>
                <Col xs={12} md={6}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span><XCircleFill className="me-2 text-danger" /> Rejected (Today)</span>
                        <Badge bg="danger" pill>{metrics.rejected?.today ?? 'N/A'}</Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                        <span><XCircleFill className="me-2 text-danger" /> Rejected (7d)</span>
                        <Badge bg="danger" pill>{metrics.rejected?.last7Days ?? 'N/A'}</Badge>
                    </div>
                     <div className="d-flex justify-content-between align-items-center mt-1">
                        <span><XCircleFill className="me-2 text-danger" /> Rejected (30d)</span>
                        <Badge bg="danger" pill>{metrics.rejected?.last30Days ?? 'N/A'}</Badge>
                    </div>
                </Col>
            </Row>
        </ListGroup.Item>
        {/* Add Avg Processing Time later if implemented */}
      </ListGroup>
    );
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title as="h6" className="mb-0">
            <ClockHistory className="me-2"/> Verification Metrics
        </Card.Title>
      </Card.Header>
      {renderContent()}
    </Card>
  );
}

export default VerificationMetricsCard; 