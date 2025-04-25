import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';

const ExternalSchedulingSection = ({ useExternalScheduling, externalSchedulingUrl, contactPhone, contactEmail, onChange }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Scheduling Preferences</h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          You can use our built-in appointment scheduling system or redirect clients to your own scheduling platform.
        </p>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="useExternalScheduling"
            name="useExternalScheduling"
            label="Use my own external scheduling system instead of the built-in scheduler"
            checked={useExternalScheduling}
            onChange={handleChange}
          />
        </Form.Group>

        {useExternalScheduling && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>External Scheduling URL</Form.Label>
              <Form.Control
                type="url"
                name="externalSchedulingUrl"
                value={externalSchedulingUrl}
                onChange={handleChange}
                placeholder="https://my-scheduling-site.com"
                isInvalid={useExternalScheduling && !externalSchedulingUrl}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a scheduling URL if using external scheduling
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Enter the full URL where clients can book appointments with you
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone (Optional)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactPhone"
                    value={contactPhone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Email (Optional)</Form.Label>
                  <Form.Control
                    type="email"
                    name="contactEmail"
                    value={contactEmail}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>
          </>
        )}

        <div className="alert alert-info mt-3">
          <strong>Note:</strong> When using external scheduling, the built-in appointment system will be disabled.
          Clients will be directed to your external scheduling URL or provided with your contact information.
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExternalSchedulingSection; 