import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, ListGroup, Badge } from 'react-bootstrap';

const CustomFieldsEditor = ({ customFields = [], onChange }) => {
  const [editMode, setEditMode] = useState(false);
  const [currentField, setCurrentField] = useState({
    name: '',
    description: '',
    required: false,
    type: 'Text',
    options: []
  });
  const [tempOption, setTempOption] = useState('');
  const [editIndex, setEditIndex] = useState(-1);

  const fieldTypes = [
    { value: 'Text', label: 'Text Field' },
    { value: 'Number', label: 'Number Field' },
    { value: 'Boolean', label: 'Yes/No Checkbox' },
    { value: 'Select', label: 'Selection (Dropdown)' }
  ];

  const handleAddOption = () => {
    if (tempOption && !currentField.options.includes(tempOption)) {
      setCurrentField({
        ...currentField,
        options: [...currentField.options, tempOption]
      });
      setTempOption('');
    }
  };

  const handleRemoveOption = (option) => {
    setCurrentField({
      ...currentField,
      options: currentField.options.filter(o => o !== option)
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentField({
      ...currentField,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddField = () => {
    // Validate required fields
    if (!currentField.name) {
      alert('Field name is required');
      return;
    }

    // For Select type, ensure there are options
    if (currentField.type === 'Select' && currentField.options.length === 0) {
      alert('Selection fields must have at least one option');
      return;
    }

    // Create a copy of the field to avoid side effects
    const fieldToAdd = { ...currentField };
    
    // Only include options for Select type
    if (fieldToAdd.type !== 'Select') {
      fieldToAdd.options = [];
    }

    if (editIndex >= 0) {
      // Update existing field
      const updatedFields = [...customFields];
      updatedFields[editIndex] = fieldToAdd;
      onChange(updatedFields);
    } else {
      // Add new field
      onChange([...customFields, fieldToAdd]);
    }

    // Reset form
    setCurrentField({
      name: '',
      description: '',
      required: false,
      type: 'Text',
      options: []
    });
    setEditMode(false);
    setEditIndex(-1);
  };

  const handleEditField = (index) => {
    setCurrentField({ ...customFields[index] });
    setEditMode(true);
    setEditIndex(index);
  };

  const handleRemoveField = (index) => {
    const updatedFields = customFields.filter((_, i) => i !== index);
    onChange(updatedFields);
  };

  const handleCancel = () => {
    setCurrentField({
      name: '',
      description: '',
      required: false,
      type: 'Text',
      options: []
    });
    setEditMode(false);
    setEditIndex(-1);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Custom Fields</h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Add custom fields to collect specific information from clients when they book this service.
        </p>

        {!editMode ? (
          <>
            <div className="mb-3">
              <Button 
                variant="primary" 
                onClick={() => setEditMode(true)}
              >
                Add Custom Field
              </Button>
            </div>

            {customFields.length > 0 ? (
              <ListGroup>
                {customFields.map((field, index) => (
                  <ListGroup.Item 
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="d-flex align-items-center">
                        <strong>{field.name}</strong>
                        {field.required && (
                          <Badge bg="danger" className="ms-2">Required</Badge>
                        )}
                        <Badge bg="secondary" className="ms-2">{field.type}</Badge>
                      </div>
                      {field.description && (
                        <div className="text-muted small">{field.description}</div>
                      )}
                      {field.type === 'Select' && field.options.length > 0 && (
                        <div className="small mt-1">
                          Options: {field.options.join(', ')}
                        </div>
                      )}
                    </div>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditField(index)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveField(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted">No custom fields added yet.</p>
            )}
          </>
        ) : (
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Name*</Form.Label>
                  <Form.Control 
                    type="text"
                    name="name"
                    value={currentField.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Pet Weight, Allergies, Previous Treatment"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Field Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={currentField.type}
                    onChange={handleInputChange}
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control 
                type="text"
                name="description"
                value={currentField.description}
                onChange={handleInputChange}
                placeholder="Describe what information you need from the client"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="fieldRequired"
                name="required"
                label="This field is required"
                checked={currentField.required}
                onChange={handleInputChange}
              />
            </Form.Group>

            {currentField.type === 'Select' && (
              <div className="mt-3 p-3 border rounded">
                <Form.Label>Options</Form.Label>
                <Row>
                  <Col md={9}>
                    <Form.Control 
                      type="text"
                      value={tempOption}
                      onChange={(e) => setTempOption(e.target.value)}
                      placeholder="Enter an option"
                    />
                  </Col>
                  <Col md={3}>
                    <Button 
                      variant="outline-primary" 
                      className="w-100"
                      onClick={handleAddOption}
                      disabled={!tempOption}
                    >
                      Add Option
                    </Button>
                  </Col>
                </Row>

                {currentField.options.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2">Current Options:</p>
                    <div className="d-flex flex-wrap gap-2">
                      {currentField.options.map((option, index) => (
                        <Badge 
                          key={index} 
                          bg="primary"
                          className="d-flex align-items-center"
                          style={{ padding: '6px 10px' }}
                        >
                          {option}
                          <span 
                            className="ms-2" 
                            onClick={() => handleRemoveOption(option)}
                            style={{ cursor: 'pointer' }}
                          >
                            ✕
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <Button 
                variant="primary" 
                onClick={handleAddField}
                className="me-2"
              >
                {editIndex >= 0 ? 'Update Field' : 'Add Field'}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default CustomFieldsEditor; 