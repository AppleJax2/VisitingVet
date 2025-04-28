import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Table,
  Modal,
  Form,
  Breadcrumb
} from 'react-bootstrap';
import {
  CalendarEventFill,
  ClockFill,
  PersonFill,
  HospitalFill,
  FileEarmarkMedicalFill,
  Paperclip,
  PencilSquare,
  CheckCircleFill,
  XCircleFill,
  ArrowLeft,
  Upload,
  HourglassSplit,
  ExclamationTriangleFill,
  CheckLg,
  XLg
} from 'react-bootstrap-icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Select from 'react-select';

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Modal states
  const [showProviderResponseModal, setShowProviderResponseModal] = useState(false);
  const [showPetOwnerResponseModal, setShowPetOwnerResponseModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  
  // Form states for modals
  const [providerResponseData, setProviderResponseData] = useState({
    status: 'accepted',
    message: '',
    availableTimeSlots: [{ date: '', timeSlot: '' }]
  });
  const [petOwnerSelectedSlot, setPetOwnerSelectedSlot] = useState(null); // Store the {date, timeSlot} object
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', resultNotes: '' });
  const [attachmentData, setAttachmentData] = useState({ name: '', fileUrl: '' }); // Assuming URL for now

  const TIME_SLOTS = [
    { value: '8:00 AM', label: '8:00 AM' }, { value: '9:00 AM', label: '9:00 AM' }, 
    { value: '10:00 AM', label: '10:00 AM' }, { value: '11:00 AM', label: '11:00 AM' }, 
    { value: '12:00 PM', label: '12:00 PM' }, { value: '1:00 PM', label: '1:00 PM' }, 
    { value: '2:00 PM', label: '2:00 PM' }, { value: '3:00 PM', label: '3:00 PM' }, 
    { value: '4:00 PM', label: '4:00 PM' }, { value: '5:00 PM', label: '5:00 PM' }, 
    { value: '6:00 PM', label: '6:00 PM' }
  ];

  const fetchServiceRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/service-requests/${id}`);
      setServiceRequest(response.data.data);
    } catch (err) {
      console.error('Error fetching service request:', err);
      setError(err.response?.data?.message || 'Failed to load service request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequest();
  }, [id]);
  
  const handleProviderResponseSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      const filteredSlots = providerResponseData.availableTimeSlots.filter(slot => slot.date && slot.timeSlot);
      if (providerResponseData.status === 'accepted' && filteredSlots.length === 0) {
        setError('Please provide at least one available time slot when accepting.');
        setUpdating(false);
        return;
      }
      await axios.put(`/api/service-requests/${id}/provider-response`, {
        ...providerResponseData,
        availableTimeSlots: filteredSlots
      });
      setShowProviderResponseModal(false);
      fetchServiceRequest(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setUpdating(false);
    }
  };
  
  const handlePetOwnerResponseSubmit = async () => {
    if (!petOwnerSelectedSlot) {
        setError('Please select a time slot.');
        return;
    }
    setUpdating(true);
    setError('');
    try {
      await axios.put(`/api/service-requests/${id}/pet-owner-response`, {
        status: 'selected',
        selectedTimeSlot: petOwnerSelectedSlot
      });
      setShowPetOwnerResponseModal(false);
      fetchServiceRequest(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select time slot.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePetOwnerDecline = async () => {
    setUpdating(true);
    setError('');
    try {
      await axios.put(`/api/service-requests/${id}/pet-owner-response`, {
        status: 'declined',
      });
      setShowPetOwnerResponseModal(false);
      fetchServiceRequest(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline request.');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      await axios.put(`/api/service-requests/${id}/status`, statusUpdateData);
      setShowStatusUpdateModal(false);
      fetchServiceRequest(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleAttachmentSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    try {
      await axios.post(`/api/service-requests/${id}/attachments`, attachmentData);
      setShowAttachmentModal(false);
      fetchServiceRequest(); // Refresh data
      setAttachmentData({ name: '', fileUrl: '' }); // Reset form
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add attachment.');
    } finally {
      setUpdating(false);
    }
  };

  // Provider response form handlers
  const handleProviderSlotChange = (index, field, value) => {
    const updatedSlots = [...providerResponseData.availableTimeSlots];
    updatedSlots[index][field] = value;
    setProviderResponseData(prev => ({ ...prev, availableTimeSlots: updatedSlots }));
  };

  const addProviderSlot = () => {
    setProviderResponseData(prev => ({ 
      ...prev, 
      availableTimeSlots: [...prev.availableTimeSlots, { date: '', timeSlot: '' }] 
    }));
  };

  const removeProviderSlot = (index) => {
    if (providerResponseData.availableTimeSlots.length > 1) {
      const updatedSlots = providerResponseData.availableTimeSlots.filter((_, i) => i !== index);
      setProviderResponseData(prev => ({ ...prev, availableTimeSlots: updatedSlots }));
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'declined': return 'danger';
      case 'scheduled': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'light';
    }
  };
  
  const getUrgencyVariant = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'emergency': return 'danger';
      default: return 'light';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <HourglassSplit className="me-1" />;
      case 'accepted': return <CheckLg className="me-1" />;
      case 'declined': return <XLg className="me-1" />;
      case 'scheduled': return <CalendarEventFill className="me-1" />;
      case 'completed': return <CheckCircleFill className="me-1" />;
      case 'cancelled': return <XCircleFill className="me-1" />;
      default: return null;
    }
  };

  const openStatusModal = (targetStatus) => {
    setStatusUpdateData({ status: targetStatus, resultNotes: '' });
    setShowStatusUpdateModal(true);
  };
  
  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading service request...</p>
      </Container>
    );
  }
  
  if (error && !serviceRequest) { // Only show full page error if request failed to load initially
    return <Container><Alert variant="danger">{error}</Alert></Container>;
  }
  
  if (!serviceRequest) {
    return <Container><Alert variant="warning">Service request not found.</Alert></Container>;
  }
  
  const isClinic = user.role === 'Clinic';
  const isProvider = user.role === 'MVSProvider';
  const isPetOwner = user.role === 'PetOwner';
  const isAdmin = user.role === 'Admin';

  // Check if this user is one of the parties involved
  const isInvolved = 
    (isClinic && serviceRequest.clinic?._id === user._id) ||
    (isProvider && serviceRequest.provider?._id === user._id) ||
    (isPetOwner && serviceRequest.petOwner?._id === user._id) ||
    isAdmin;

  if (!isInvolved) {
    return (
      <Container>
        <Alert variant="danger">You are not authorized to view this service request.</Alert>
      </Container>
    );
  }

  const getDashboardPath = () => {
    if (user.role === 'PetOwner') return '/dashboard/pet-owner';
    if (user.role === 'MVSProvider') return '/dashboard/provider';
    if (user.role === 'Clinic') return '/dashboard/clinic';
    return '/dashboard'; // Fallback
  };
  
  const getServiceRequestsPath = () => {
    if (user.role === 'PetOwner') return '/dashboard/pet-owner/service-requests';
    if (user.role === 'MVSProvider') return '/dashboard/provider/service-requests';
    if (user.role === 'Clinic') return '/dashboard/clinic/service-requests';
    return '/service-requests'; // Fallback
  };

  return (
    <Container>
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: getDashboardPath() }}>Dashboard</Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: getServiceRequestsPath() }}>
          {user.role === 'PetOwner' ? 'Specialist Referrals' : 'Service Requests'}
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Request Details</Breadcrumb.Item>
      </Breadcrumb>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Service Request #{serviceRequest._id.substring(serviceRequest._id.length - 6)}</h4>
          <div>
            <Badge bg={getStatusVariant(serviceRequest.status)} className="me-2 p-2 fs-6 d-inline-flex align-items-center">
              {getStatusIcon(serviceRequest.status)}
              {serviceRequest.status.charAt(0).toUpperCase() + serviceRequest.status.slice(1)}
            </Badge>
            <Badge bg={getUrgencyVariant(serviceRequest.urgency)} className="p-2 fs-6 d-inline-flex align-items-center">
              <ExclamationTriangleFill className="me-1" />
              {serviceRequest.urgency.charAt(0).toUpperCase() + serviceRequest.urgency.slice(1)} Urgency
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h5><HospitalFill className="me-2" />Clinic Info</h5>
              <p className="mb-1"><strong>Name:</strong> {serviceRequest.clinic?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Email:</strong> {serviceRequest.clinic?.email || 'N/A'}</p>
              <p className="mb-3"><strong>Phone:</strong> {serviceRequest.clinic?.phone || 'N/A'}</p>
              
              <h5><PersonFill className="me-2" />Pet Owner Info</h5>
              <p className="mb-1"><strong>Name:</strong> {serviceRequest.petOwner?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Email:</strong> {serviceRequest.petOwner?.email || 'N/A'}</p>
              <p className="mb-3"><strong>Phone:</strong> {serviceRequest.petOwner?.phone || 'N/A'}</p>

              <h5><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-heart-pulse-fill me-2" viewBox="0 0 16 16"><path d="M1.475 9C2.702 10.84 4.779 12.871 8 15c3.221-2.129 5.298-4.16 6.525-6H12a.5.5 0 0 1-.464-.314l-1.457-3.642-1.598 5.593a.5.5 0 0 1-.945.049L5.889 6.568l-1.473 2.21A.5.5 0 0 1 4 9z"/><path d="M2 1a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm3.905-1 2.197-.803c.319-.117.681.01.85.308l1.5 2.156 1.5-2.156a.5.5 0 0 1 .85-.308l2.197.803c.404.147.632.56.52.992L13 14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1L1.475 1.992c-.112-.432.116-.845.52-.992z"/></svg>Pet Info</h5>
              <p className="mb-1"><strong>Name:</strong> {serviceRequest.pet?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Species:</strong> {serviceRequest.pet?.species || 'N/A'}</p>
              <p className="mb-3"><strong>Breed:</strong> {serviceRequest.pet?.breed || 'N/A'}</p>

              <h5><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-badge-fill me-2" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m5 2.755C12.146 12.825 10.623 12 8 12s-4.146.826-5 1.755V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1z"/></svg>Provider Info</h5>
              <p className="mb-1"><strong>Name:</strong> {serviceRequest.provider?.name || 'N/A'}</p>
              <p className="mb-1"><strong>Email:</strong> {serviceRequest.provider?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {serviceRequest.provider?.phone || 'N/A'}</p>
            </Col>
            
            <Col md={8}>
              <Card className="mb-3">
                <Card.Header>Requested Services</Card.Header>
                <ListGroup variant="flush">
                  {serviceRequest.requestedServices?.map((item, index) => (
                    <ListGroup.Item key={index}>
                      {item.service?.name || 'Unknown Service'} - ${item.service?.price?.toFixed(2) || 'N/A'}
                      {item.notes && <p className="text-muted small mb-0">Notes: {item.notes}</p>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>

              <Card className="mb-3">
                <Card.Header><FileEarmarkMedicalFill className="me-2" />Medical Notes</Card.Header>
                <Card.Body>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{serviceRequest.medicalNotes}</p>
                </Card.Body>
              </Card>
              
              <Card className="mb-3">
                 <Card.Header><CalendarEventFill className="me-2" />Preferred Dates by Clinic</Card.Header>
                 <ListGroup variant="flush">
                   {serviceRequest.preferredDates?.map((date, index) => (
                     <ListGroup.Item key={index}>
                       {format(new Date(date.date), 'MMMM d, yyyy')} at {date.timeSlot}
                     </ListGroup.Item>
                   ))}
                 </ListGroup>
              </Card>
              
              {/* Provider Response Section */}
              <Card className="mb-3">
                <Card.Header>Provider Response</Card.Header>
                <Card.Body>
                  {serviceRequest.providerResponse?.status ? (
                    <div>
                      <Badge bg={serviceRequest.providerResponse.status === 'accepted' ? 'success' : 'danger'} className="mb-2">
                        {serviceRequest.providerResponse.status.charAt(0).toUpperCase() + serviceRequest.providerResponse.status.slice(1)}
                      </Badge>
                      {serviceRequest.providerResponse.message && (
                        <p><strong>Message:</strong> {serviceRequest.providerResponse.message}</p>
                      )}
                      {serviceRequest.providerResponse.status === 'accepted' && serviceRequest.providerResponse.availableTimeSlots?.length > 0 && (
                        <div>
                          <strong>Available Time Slots:</strong>
                          <Table striped bordered hover size="sm" className="mt-2">
                            <thead><tr><th>Date</th><th>Time</th></tr></thead>
                            <tbody>
                              {serviceRequest.providerResponse.availableTimeSlots.map((slot, index) => (
                                <tr key={index}>
                                  <td>{format(new Date(slot.date), 'MMMM d, yyyy')}</td>
                                  <td>{slot.timeSlot}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ) : isProvider && serviceRequest.status === 'pending' ? (
                    <Button variant="primary" onClick={() => setShowProviderResponseModal(true)}>Respond to Request</Button>
                  ) : (
                    <p className="text-muted">No response from provider yet.</p>
                  )}
                </Card.Body>
              </Card>
              
              {/* Pet Owner Response Section */}
              <Card className="mb-3">
                <Card.Header>Pet Owner Response</Card.Header>
                <Card.Body>
                  {serviceRequest.petOwnerResponse?.status ? (
                     <div>
                      <Badge bg={serviceRequest.petOwnerResponse.status === 'selected' ? 'success' : 'danger'} className="mb-2">
                        {serviceRequest.petOwnerResponse.status === 'selected' ? 'Time Slot Selected' : 'Declined by Owner'}
                      </Badge>
                      {serviceRequest.petOwnerResponse.status === 'selected' && serviceRequest.petOwnerResponse.selectedTimeSlot && (
                        <p>
                          <strong>Selected Time:</strong> {format(new Date(serviceRequest.petOwnerResponse.selectedTimeSlot.date), 'MMMM d, yyyy')} at {serviceRequest.petOwnerResponse.selectedTimeSlot.timeSlot}
                        </p>
                      )}
                    </div>
                  ) : isPetOwner && serviceRequest.status === 'accepted' ? (
                     <Button variant="primary" onClick={() => setShowPetOwnerResponseModal(true)}>Select Time Slot</Button>
                  ) : (
                    <p className="text-muted">
                      {serviceRequest.status === 'accepted' 
                        ? 'Waiting for pet owner to select a time slot.'
                        : 'No response needed from pet owner yet.'
                      }
                    </p>
                  )}
                </Card.Body>
              </Card>

              {/* Scheduled Appointment Info */}
              {serviceRequest.status === 'scheduled' && serviceRequest.scheduledAppointment && (
                <Card className="mb-3 bg-light">
                  <Card.Header><CalendarEventFill className="me-2" />Scheduled Appointment</Card.Header>
                  <Card.Body>
                     <p>
                       <strong>Date & Time:</strong> {format(new Date(serviceRequest.scheduledAppointment.date), 'MMMM d, yyyy')} at {serviceRequest.scheduledAppointment.timeSlot}
                     </p>
                     <Button 
                       variant="outline-secondary" 
                       size="sm"
                       onClick={() => navigate(`/dashboard/${user.role === 'PetOwner' ? 'pet-owner' : user.role}/appointments/${serviceRequest.scheduledAppointment._id}`)}
                     >
                       View Appointment Details
                     </Button>
                  </Card.Body>
                </Card>
              )}
              
              {/* Result Notes */}
              {serviceRequest.status === 'completed' && serviceRequest.resultNotes && (
                 <Card className="mb-3">
                   <Card.Header><FileEarmarkMedicalFill className="me-2" />Result Notes</Card.Header>
                   <Card.Body>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{serviceRequest.resultNotes}</p>
                   </Card.Body>
                 </Card>
              )}

              {/* Attachments */}
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <span><Paperclip className="me-2" />Attachments</span>
                  <Button variant="outline-secondary" size="sm" onClick={() => setShowAttachmentModal(true)}>
                    <Upload className="me-1" /> Add Attachment
                  </Button>
                </Card.Header>
                 <ListGroup variant="flush">
                  {serviceRequest.attachments?.length > 0 ? (
                    serviceRequest.attachments.map((att, index) => (
                      <ListGroup.Item key={index} action href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                        {att.name}
                        <span className="text-muted small d-block">
                          Uploaded by {att.uploadedBy?.name || 'Unknown'} on {format(new Date(att.uploadedAt), 'MMM d, yyyy')}
                        </span>
                      </ListGroup.Item>
                    ))
                  ) : (
                     <ListGroup.Item className="text-muted">No attachments yet.</ListGroup.Item>
                  )}
                 </ListGroup>
              </Card>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="d-flex justify-content-between">
           <Button variant="outline-secondary" onClick={() => navigate(-1)}>
             <ArrowLeft className="me-1" /> Back
           </Button>
           <div>
            {/* Status Update Buttons - Logic depends on current status and user role */}
             {isProvider && serviceRequest.status === 'scheduled' && (
              <Button variant="success" className="me-2" onClick={() => openStatusModal('completed')}>Mark Completed</Button>
            )}
             {serviceRequest.status === 'scheduled' && (isClinic || isPetOwner) && (
              <Button variant="danger" className="me-2" onClick={() => openStatusModal('cancelled')}>Cancel Request</Button>
            )}
             {serviceRequest.status === 'accepted' && (isClinic || isPetOwner) && (
               <Button variant="danger" className="me-2" onClick={() => openStatusModal('cancelled')}>Cancel Request</Button>
             )}
             {/* Add other cancellation logic if needed for pending status by clinic */} 
           </div>
        </Card.Footer>
      </Card>
      
      {/* --- Modals --- */} 

      {/* Provider Response Modal */}
      <Modal show={showProviderResponseModal} onHide={() => setShowProviderResponseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Respond to Service Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleProviderResponseSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="providerResponseStatus">
              <Form.Label>Response</Form.Label>
              <Form.Select 
                value={providerResponseData.status}
                onChange={(e) => setProviderResponseData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="accepted">Accept Request</option>
                <option value="declined">Decline Request</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="providerResponseMessage">
              <Form.Label>Message (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={providerResponseData.message}
                onChange={(e) => setProviderResponseData(prev => ({ ...prev, message: e.target.value }))}
              />
            </Form.Group>
            {providerResponseData.status === 'accepted' && (
              <Form.Group>
                <Form.Label>Available Time Slots *</Form.Label>
                {providerResponseData.availableTimeSlots.map((slot, index) => (
                  <Row key={index} className="mb-2 align-items-center">
                    <Col md={5}>
                       <Form.Control 
                         type="date" 
                         value={slot.date} 
                         onChange={(e) => handleProviderSlotChange(index, 'date', e.target.value)} 
                         required={providerResponseData.status === 'accepted'}
                       />
                    </Col>
                    <Col md={5}>
                       <Select 
                         options={TIME_SLOTS} 
                         value={TIME_SLOTS.find(ts => ts.value === slot.timeSlot)} 
                         onChange={(opt) => handleProviderSlotChange(index, 'timeSlot', opt ? opt.value : '')} 
                         placeholder="Select Time..."
                         required={providerResponseData.status === 'accepted'}
                       />
                    </Col>
                    <Col md={2}>
                      {providerResponseData.availableTimeSlots.length > 1 && (
                        <Button variant="outline-danger" size="sm" onClick={() => removeProviderSlot(index)}>Remove</Button>
                      )}
                    </Col>
                  </Row>
                ))}
                <Button variant="outline-secondary" size="sm" onClick={addProviderSlot} className="mt-1">Add Another Slot</Button>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProviderResponseModal(false)} disabled={updating}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? <Spinner size="sm" /> : 'Submit Response'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Pet Owner Response Modal */}
      <Modal show={showPetOwnerResponseModal} onHide={() => setShowPetOwnerResponseModal(false)} size="lg">
         <Modal.Header closeButton>
            <Modal.Title>Select Appointment Time Slot</Modal.Title>
         </Modal.Header>
         <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p>Please select one of the time slots offered by the provider:</p>
            <Table striped bordered hover responsive="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {serviceRequest?.providerResponse?.availableTimeSlots?.map((slot, index) => (
                  <tr key={index} className={petOwnerSelectedSlot?.date === slot.date && petOwnerSelectedSlot?.timeSlot === slot.timeSlot ? 'table-primary' : ''}>
                    <td>{format(new Date(slot.date), 'MMMM d, yyyy')}</td>
                    <td>{slot.timeSlot}</td>
                    <td>
                      <Button 
                        variant={petOwnerSelectedSlot?.date === slot.date && petOwnerSelectedSlot?.timeSlot === slot.timeSlot ? 'success' : 'outline-primary'}
                        size="sm"
                        onClick={() => setPetOwnerSelectedSlot(slot)}
                      >
                        {petOwnerSelectedSlot?.date === slot.date && petOwnerSelectedSlot?.timeSlot === slot.timeSlot ? 'Selected' : 'Select'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
         </Modal.Body>
         <Modal.Footer className="justify-content-between">
           <Button variant="danger" onClick={handlePetOwnerDecline} disabled={updating}>
             Decline All Slots
           </Button>
           <div>
             <Button variant="secondary" onClick={() => setShowPetOwnerResponseModal(false)} className="me-2" disabled={updating}>Cancel</Button>
             <Button variant="primary" onClick={handlePetOwnerResponseSubmit} disabled={!petOwnerSelectedSlot || updating}>
                {updating ? <Spinner size="sm" /> : 'Confirm Selection'}
             </Button>
           </div>
         </Modal.Footer>
      </Modal>

      {/* Status Update Modal */}
      <Modal show={showStatusUpdateModal} onHide={() => setShowStatusUpdateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {statusUpdateData.status === 'completed' ? 'Mark Request Completed' : 'Cancel Request'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdateSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {statusUpdateData.status === 'completed' ? (
              <Form.Group controlId="resultNotes">
                <Form.Label>Result Notes {isProvider ? '*' : '(Optional)'}</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  value={statusUpdateData.resultNotes}
                  onChange={(e) => setStatusUpdateData(prev => ({ ...prev, resultNotes: e.target.value }))}
                  required={isProvider} // Provider must add notes
                  placeholder={isProvider ? "Enter details about the service outcome..." : "Optional notes..."}
                />
              </Form.Group>
            ) : (
              <p>Are you sure you want to cancel this service request? This action cannot be undone.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusUpdateModal(false)} disabled={updating}>Cancel</Button>
            <Button 
              variant={statusUpdateData.status === 'completed' ? 'success' : 'danger'} 
              type="submit" 
              disabled={updating}
            >
               {updating ? <Spinner size="sm" /> : 
                 (statusUpdateData.status === 'completed' ? 'Mark Completed' : 'Confirm Cancellation')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Attachment Modal */}
       <Modal show={showAttachmentModal} onHide={() => setShowAttachmentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Attachment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAttachmentSubmit}>
          <Modal.Body>
             {error && <Alert variant="danger">{error}</Alert>}
             <Form.Group className="mb-3" controlId="attachmentName">
                <Form.Label>Attachment Name *</Form.Label>
                <Form.Control 
                  type="text" 
                  value={attachmentData.name}
                  onChange={(e) => setAttachmentData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
             </Form.Group>
             <Form.Group className="mb-3" controlId="attachmentUrl">
                <Form.Label>File URL *</Form.Label>
                <Form.Control 
                  type="url" 
                  value={attachmentData.fileUrl}
                  onChange={(e) => setAttachmentData(prev => ({ ...prev, fileUrl: e.target.value }))}
                  required 
                  placeholder="https://example.com/path/to/file.pdf"
                />
                <Form.Text className="text-muted">
                  Currently, only links to externally hosted files are supported.
                </Form.Text>
             </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAttachmentModal(false)} disabled={updating}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={updating || !attachmentData.name || !attachmentData.fileUrl}>
               {updating ? <Spinner size="sm" /> : 'Add Attachment'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default ServiceRequestDetail; 