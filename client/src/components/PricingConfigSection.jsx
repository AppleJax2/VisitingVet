import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';

const PricingConfigSection = ({ 
  hasPublicPricing, 
  hasDifferentPricing, 
  price, 
  b2bPrice,
  b2cPrice,
  priceType,
  onChange
}) => {
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'b2bPrice' || name === 'b2cPrice' ? parseFloat(value) || '' : value)
    });
  };

  const priceTypes = [
    { value: 'Flat', label: 'Flat Fee' },
    { value: 'Hourly', label: 'Hourly Rate' },
    { value: 'Range', label: 'Price Range' },
    { value: 'Contact', label: 'Contact for Pricing' },
  ];

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Pricing Configuration</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="hasPublicPricing"
            name="hasPublicPricing"
            label="Display pricing publicly"
            checked={hasPublicPricing}
            onChange={handleChange}
          />
          <Form.Text className="text-muted">
            If unchecked, clients will see "Contact for pricing" instead of actual prices
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Price Type</Form.Label>
          <div>
            {priceTypes.map((type) => (
              <Form.Check
                key={type.value}
                inline
                type="radio"
                id={`priceType-${type.value}`}
                name="priceType"
                value={type.value}
                label={type.label}
                checked={priceType === type.value}
                onChange={handleChange}
              />
            ))}
          </div>
        </Form.Group>

        {priceType !== 'Contact' && (
          <>
            {!hasDifferentPricing ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Standard Price {priceType === 'Hourly' ? '(per hour)' : ''}
                    {priceType === 'Range' ? '(starting at)' : ''}
                  </Form.Label>
                  <Row>
                    <Col md={6}>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={price || ''}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="hasDifferentPricing"
                    name="hasDifferentPricing"
                    label="Set different prices for businesses vs. individuals"
                    checked={hasDifferentPricing}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Enable if you want to set different prices for veterinary clinics (B2B) and pet owners (B2C)
                  </Form.Text>
                </Form.Group>
              </>
            ) : (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Business Price (B2B) {priceType === 'Hourly' ? '(per hour)' : ''}
                        {priceType === 'Range' ? '(starting at)' : ''}
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="b2bPrice"
                          value={b2bPrice || ''}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                      <Form.Text className="text-muted">
                        Price for veterinary clinics and other businesses
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Individual Price (B2C) {priceType === 'Hourly' ? '(per hour)' : ''}
                        {priceType === 'Range' ? '(starting at)' : ''}
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="b2cPrice"
                          value={b2cPrice || ''}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </div>
                      <Form.Text className="text-muted">
                        Price for individual pet owners
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="hasDifferentPricing"
                    name="hasDifferentPricing"
                    label="Set different prices for businesses vs. individuals"
                    checked={hasDifferentPricing}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Disable to revert to a single price for all clients
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </>
        )}
        
        <div className="alert alert-info">
          <strong>Pricing Visibility:</strong> {hasPublicPricing 
            ? "Your prices will be visible to all users." 
            : "Your prices will be hidden. Clients will see 'Contact for pricing' instead."}
          {hasDifferentPricing && hasPublicPricing && 
            " Clients will see the price relevant to their account type (business or individual)."}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PricingConfigSection; 