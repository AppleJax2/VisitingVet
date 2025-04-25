import React, { useState } from 'react';
import { Form, Card, Row, Col, Badge } from 'react-bootstrap';

const ANIMAL_TYPES = [
  { value: 'Small Animal', examples: 'Dogs, Cats, Rabbits, Ferrets' },
  { value: 'Large Animal', examples: 'Cattle, Sheep, Pigs' },
  { value: 'Equine', examples: 'Horses, Ponies, Donkeys' },
  { value: 'Farm Animal', examples: 'Goats, Chickens, Ducks, Alpacas' },
  { value: 'Exotic', examples: 'Reptiles, Birds, Rodents' },
  { value: 'Avian', examples: 'Pet Birds, Poultry' },
  { value: 'Other', examples: 'Any other animals not listed' }
];

const SPECIALTY_SERVICES = [
  'Farrier Services',
  'Dental Care',
  'Equine Massage',
  'Large Animal Nutrition',
  'Farm Animal Surgery',
  'Mobile Ultrasound',
  'Mobile X-Ray',
  'Geriatric Care',
  'Reproductive Services',
  'Behavioral Consultation',
  'Euthanasia Services',
  'Holistic/Alternative Medicine'
];

const AnimalTypeSelection = ({ selectedTypes = [], specialtyServices = [], onChange }) => {
  const [customSpecialty, setCustomSpecialty] = useState('');

  const handleTypeChange = (type) => {
    let newTypes;
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter(t => t !== type);
    } else {
      newTypes = [...selectedTypes, type];
    }
    onChange({ animalTypes: newTypes });
  };

  const handleSpecialtyChange = (specialty) => {
    let newSpecialties;
    if (specialtyServices.includes(specialty)) {
      newSpecialties = specialtyServices.filter(s => s !== specialty);
    } else {
      newSpecialties = [...specialtyServices, specialty];
    }
    onChange({ specialtyServices: newSpecialties });
  };

  const handleAddCustomSpecialty = () => {
    if (customSpecialty && !specialtyServices.includes(customSpecialty)) {
      const newSpecialties = [...specialtyServices, customSpecialty];
      onChange({ specialtyServices: newSpecialties });
      setCustomSpecialty('');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Animal Types & Specialty Services</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-4">
          <Form.Label>What types of animals do you work with?</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {ANIMAL_TYPES.map((type) => (
              <Badge
                key={type.value}
                bg={selectedTypes.includes(type.value) ? 'primary' : 'light'}
                text={selectedTypes.includes(type.value) ? 'white' : 'dark'}
                style={{ cursor: 'pointer', padding: '8px 12px', fontSize: '14px' }}
                onClick={() => handleTypeChange(type.value)}
              >
                {type.value}
              </Badge>
            ))}
          </div>
          {selectedTypes.length === 0 && (
            <div className="text-danger mt-2">
              Please select at least one animal type
            </div>
          )}
          <div className="mt-3">
            {ANIMAL_TYPES.filter(type => selectedTypes.includes(type.value)).map(type => (
              <div key={type.value} className="text-muted small">
                <strong>{type.value}:</strong> {type.examples}
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Specialty Services</Form.Label>
          <p className="text-muted small mb-3">
            Select any specialty services you offer. This helps pet owners find the right provider for their specific needs.
          </p>
          
          <Row className="mb-3">
            {SPECIALTY_SERVICES.map((specialty) => (
              <Col md={6} key={specialty}>
                <Form.Check
                  type="checkbox"
                  id={`specialty-${specialty}`}
                  label={specialty}
                  checked={specialtyServices.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="mb-2"
                />
              </Col>
            ))}
          </Row>
          
          <Form.Label>Add Custom Specialty Service</Form.Label>
          <Row>
            <Col md={9}>
              <Form.Control
                type="text"
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                placeholder="Enter a custom specialty service you offer"
              />
            </Col>
            <Col md={3}>
              <button 
                type="button" 
                className="btn btn-outline-primary w-100"
                onClick={handleAddCustomSpecialty}
                disabled={!customSpecialty}
              >
                Add
              </button>
            </Col>
          </Row>
          
          {specialtyServices.length > 0 && (
            <div className="mt-3">
              <div className="d-flex flex-wrap gap-2">
                {specialtyServices.map((specialty) => (
                  <Badge 
                    key={specialty} 
                    bg="success"
                    className="d-flex align-items-center"
                    style={{ padding: '6px 10px' }}
                  >
                    {specialty}
                    <span 
                      className="ms-2 cursor-pointer" 
                      onClick={() => handleSpecialtyChange(specialty)}
                      style={{ cursor: 'pointer' }}
                    >
                      ✕
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default AnimalTypeSelection; 