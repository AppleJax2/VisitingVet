import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Calendar2Check, PlusCircle, 
  GeoAlt, Clock, Stars, Bell, FileEarmarkText
} from 'react-bootstrap-icons';
import { 
  fetchPetOwnerDashboardData, 
  fetchUserReminders, 
  fetchUserPets, 
  fetchUpcomingAppointments,
  fetchTopRatedVets
} from '../../services/api';
import AppointmentDetailModal from '../AppointmentDetailModal';
import { CWidgetStatsF } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilDog, cilList, cilMedicalCross, cilSearch, cilCalendar } from '@coreui/icons';

const PetOwnerDashboard = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [topVets, setTopVets] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    pets: true,
    reminders: true,
    topVets: true
  });
  const [error, setError] = useState(null);
  
  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load all required data for the dashboard
        const appointmentsPromise = fetchUpcomingAppointments();
        const petsPromise = fetchUserPets();
        const remindersPromise = fetchUserReminders();
        const topVetsPromise = fetchTopRatedVets(user?.location);
        
        // Wait for all data to load
        const [appointmentsData, petsData, remindersData, topVetsData] = await Promise.all([
          appointmentsPromise,
          petsPromise,
          remindersPromise,
          topVetsPromise
        ]);
        
        // Update state with the fetched data
        setUpcomingAppointments(appointmentsData.appointments || []);
        setPets(petsData.pets || []);
        setReminders(remindersData.reminders || []);
        setTopVets(topVetsData.vets || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load some dashboard data. Please try refreshing the page.');
      } finally {
        setLoading({
          appointments: false,
          pets: false,
          reminders: false,
          topVets: false
        });
      }
    };
    
    loadDashboardData();
  }, [user?._id, user?.location]);

  // Reload data if an appointment is updated via the modal
  const handleAppointmentUpdate = (updatedAppointment) => {
     loadDashboardData(); // Simple reload for now
  };
  
  // Modal handlers
  const handleShowDetails = (id) => {
      setSelectedAppointmentId(id);
      setShowDetailModal(true);
  };
  
  const handleHideDetails = () => {
      setSelectedAppointmentId(null);
      setShowDetailModal(false);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
     switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const renderLoading = (section) => (
    <div className="d-flex justify-content-center align-items-center p-5">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading {section}...</span>
      </Spinner>
    </div>
  );

  return (
    <div className="pet-owner-dashboard p-3">
      {/* Quick Action Cards - Using CWidgetStatsF */}
      <Row className="mb-4 g-4">
        <Col xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="h-100 shadow-sm border-0"
            icon={<CIcon width={24} icon={cilSearch} size="xl" />}
            padding={false}
            title="Find a Vet"
            value={<Button as={Link} to="/search-providers" variant="primary" size="sm" className="mt-2">Search Now</Button>}
            color="primary"
            footer={<Link to="/search-providers" className="text-decoration-none text-white"><small>Search for mobile veterinarians</small></Link>}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="h-100 shadow-sm border-0"
            icon={<CIcon width={24} icon={cilCalendar} size="xl" />}
            padding={false}
            title="Appointments"
            value={<Button as={Link} to="/my-appointments" variant="success" size="sm" className="mt-2">View/Schedule</Button>}
            color="success"
            footer={<Link to="/my-appointments" className="text-decoration-none text-white"><small>Manage appointments</small></Link>}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
           <CWidgetStatsF
            className="h-100 shadow-sm border-0"
            icon={<CIcon width={24} icon={cilDog} size="xl" />}
            padding={false}
            title="My Pets"
            value={<Button as={Link} to="/add-pet" variant="info" size="sm" className="mt-2">Add/View Pets</Button>}
            color="info"
            footer={<Link to="/my-pets" className="text-decoration-none text-white"><small>Manage your pet profiles</small></Link>}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="h-100 shadow-sm border-0"
            icon={<CIcon width={24} icon={cilList} size="xl" />}
            padding={false}
            title="Service Requests"
            value={<Button as={Link} to="/dashboard/pet-owner/service-requests" variant="warning" size="sm" className="mt-2">View Requests</Button>}
            color="warning"
            footer={<Link to="/dashboard/pet-owner/service-requests" className="text-decoration-none text-white"><small>Check specialist referrals</small></Link>}
          />
        </Col>
      </Row>

      {/* Upcoming Appointments - Simplified Card/List */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
              <h5 className="mb-0 fw-semibold">Upcoming Appointments</h5>
              <Link to="/my-appointments" className="btn btn-link btn-sm text-decoration-none">
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {loading.appointments ? (
                renderLoading('appointments')
              ) : upcomingAppointments.length > 0 ? (
                <ListGroup variant="flush">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <ListGroup.Item key={appointment._id} className="px-0">
                      <Row className="align-items-center">
                        <Col xs={12} md={5} className="mb-2 mb-md-0">
                          <h6 className="mb-1 fw-semibold">
                            {appointment.service?.name || 'Veterinary Service'}
                          </h6>
                          <small className="text-muted">
                            With {appointment.providerProfile?.user?.name || 'Veterinarian'} for {appointment.pet?.name || 'Your Pet'}
                          </small>
                        </Col>
                        <Col xs={12} sm={6} md={4} className="mb-2 mb-md-0">
                          <small className="d-block text-muted">
                            <Clock className="me-1" /> 
                            {new Date(appointment.appointmentTime).toLocaleDateString()} at {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                          <small className="d-block text-muted">
                            <GeoAlt className="me-1" /> {appointment.appointmentLocation}
                          </small>
                        </Col>
                        <Col xs={12} sm={6} md={3} className="text-start text-sm-end">
                          <Badge 
                            bg={getStatusBadgeVariant(appointment.status)}
                            className="mb-2 mb-sm-0 me-sm-2"
                          >
                            {appointment.status}
                          </Badge>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowDetails(appointment._id)}
                          >
                            Details
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No upcoming appointments</p>
                  <Button as={Link} to="/search-providers" variant="secondary">
                    <Search className="me-2" /> Find a Vet
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pets and Reminders - Simplified */}
      <Row>
        {/* My Pets Section */}
        <Col md={7} lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
              <h5 className="mb-0 fw-semibold">My Pets</h5>
              <Link to="/my-pets" className="btn btn-link btn-sm text-decoration-none">
                Manage Pets
              </Link>
            </Card.Header>
            <Card.Body>
              {loading.pets ? (
                renderLoading('pets')
              ) : pets.length > 0 ? (
                <Row className="g-3">
                  {pets.slice(0, 3).map((pet) => (
                    <Col sm={6} lg={4} key={pet._id}>
                      <Card className="h-100">
                        <Card.Img 
                          variant="top" 
                          src={pet.profileImage || 'https://via.placeholder.com/300x200?text=Pet'} 
                          style={{ height: '120px', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        <Card.Body className="d-flex flex-column p-2">
                          <Card.Title as="h6" className="fw-semibold mb-1">{pet.name}</Card.Title>
                          <small className="text-muted mb-2">
                            {pet.breed} • {pet.age} yrs
                          </small>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            className="mt-auto"
                            as={Link}
                            to={`/pet/${pet._id}`}
                          >
                            Profile
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                 ) : (
                 <div className="text-center py-4">
                    <p className="text-muted">No pets added yet.</p>
                    <Button as={Link} to="/add-pet" variant="primary">
                      <PlusCircle className="me-2" />Add Pet
                    </Button>
                  </div>
              )}
            </Card.Body>
             {pets.length > 0 && (
              <Card.Footer className="text-center bg-light">
                <Button as={Link} to="/add-pet" variant="secondary" size="sm">
                   <PlusCircle className="me-1" /> Add Another Pet
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>

        {/* Reminders Section */}
        <Col md={5} lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center border-bottom">
              <h5 className="mb-0 fw-semibold">Reminders</h5>
               <Link to="/manage-reminders" className="btn btn-link btn-sm text-decoration-none">
                Manage
              </Link>
            </Card.Header>
            <Card.Body>
              {loading.reminders ? (
                renderLoading('reminders')
              ) : reminders.length > 0 ? (
                 <ListGroup variant="flush">
                  {reminders.slice(0, 4).map((reminder) => (
                    <ListGroup.Item key={reminder._id} className="px-0">
                       <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1 fw-semibold">{reminder.title}</h6>
                          <Badge pill bg={getPriorityBadgeVariant(reminder.priority)}>
                            {reminder.priority}
                          </Badge>
                        </div>
                        <p className="text-muted mb-1 small">{reminder.description}</p>
                        <small className="text-muted d-flex align-items-center">
                          <Bell className="me-1" size={12} />
                          Due: {new Date(reminder.dueDate).toLocaleDateString()}
                        </small>
                    </ListGroup.Item>
                  ))}
                 </ListGroup>
              ) : (
                 <div className="text-center py-3">
                  <p className="text-muted mb-3">No reminders set</p>
                </div>
              )}
            </Card.Body>
             <Card.Footer className="text-center bg-light">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  as={Link}
                  to="/add-reminder"
                >
                  <PlusCircle className="me-1"/> Add Reminder
                </Button>
              </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Appointment Detail Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailModal 
            show={showDetailModal}
            onHide={handleHideDetails}
            appointmentId={selectedAppointmentId}
            userRole={user?.role}
            onUpdate={handleAppointmentUpdate}
        />
      )}
    </div>
  );
};

export default PetOwnerDashboard; 