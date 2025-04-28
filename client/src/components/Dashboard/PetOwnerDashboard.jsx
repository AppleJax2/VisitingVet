import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Search, Calendar2Check, PlusCircle, 
  GeoAlt, Clock, Stars, Bell
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { fetchPetOwnerDashboardData, fetchUserReminders, fetchUserPets, fetchUpcomingAppointments } from '../../services/api';
import AppointmentDetailModal from '../AppointmentDetailModal';

const PetOwnerDashboard = ({ user }) => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState({
    appointments: true,
    pets: true,
    reminders: true
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
        
        // Wait for all data to load
        const [appointmentsData, petsData, remindersData] = await Promise.all([
          appointmentsPromise,
          petsPromise,
          remindersPromise
        ]);
        
        // Update state with the fetched data
        setUpcomingAppointments(appointmentsData.appointments || []);
        setPets(petsData.pets || []);
        setReminders(remindersData.reminders || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load some dashboard data. Please try refreshing the page.');
      } finally {
        setLoading({
          appointments: false,
          pets: false,
          reminders: false
        });
      }
    };
    
    loadDashboardData();
  }, [user?._id]);

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

  // Styles
  const styles = {
    actionCard: {
      borderRadius: theme.borderRadius.lg,
      border: 'none',
      height: '100%',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows.lg,
      },
    },
    actionIcon: {
      backgroundColor: `${theme.colors.accent.lightGreen}50`,
      color: theme.colors.primary.main,
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      fontSize: '1.8rem',
      marginBottom: '15px',
    },
    petCard: {
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      height: '100%',
    },
    petImage: {
      height: '140px',
      objectFit: 'cover',
    },
    reminderBadge: (priority) => {
      const colors = {
        high: theme.colors.error,
        medium: theme.colors.warning,
        low: theme.colors.success,
      };
      return {
        backgroundColor: colors[priority],
      };
    },
    appointmentCard: {
      border: 'none',
      borderRadius: theme.borderRadius.md,
      marginBottom: '15px',
      boxShadow: theme.shadows.sm,
    },
    statusBadge: (status) => {
      const colors = {
        confirmed: theme.colors.success,
        pending: theme.colors.warning,
        cancelled: theme.colors.error,
        completed: theme.colors.accent.blue,
      };
      return {
        backgroundColor: colors[status] || theme.colors.info,
      };
    },
    addButton: {
      backgroundColor: theme.colors.primary.main,
      border: 'none',
    },
    sectionTitle: {
      color: theme.colors.primary.dark,
      fontWeight: '600',
      marginBottom: '20px',
    },
    cardTitle: {
      color: theme.colors.primary.main,
      fontWeight: '600',
    },
    viewAllLink: {
      color: theme.colors.primary.main,
      textDecoration: 'none',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px',
      color: theme.colors.text.secondary,
    },
    infoIcon: {
      marginRight: '8px',
      color: theme.colors.primary.main,
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '150px',
    }
  };

  const renderLoading = (section) => (
    <div style={styles.loadingContainer}>
      <Spinner animation="border" role="status" style={{ color: theme.colors.primary.main }}>
        <span className="visually-hidden">Loading {section}...</span>
      </Spinner>
    </div>
  );

  return (
    <div className="pet-owner-dashboard">
      {/* Quick Action Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card style={styles.actionCard} as={Link} to="/search-providers">
            <Card.Body className="text-center p-4">
              <div style={styles.actionIcon} className="mx-auto">
                <Search />
              </div>
              <h5 style={styles.cardTitle}>Find a Vet</h5>
              <p className="text-muted">
                Search for mobile veterinarians in your area
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={styles.actionCard} as={Link} to="/my-appointments">
            <Card.Body className="text-center p-4">
              <div style={styles.actionIcon} className="mx-auto">
                <Calendar2Check />
              </div>
              <h5 style={styles.cardTitle}>Manage Appointments</h5>
              <p className="text-muted">
                View and schedule vet appointments
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={styles.actionCard} as={Link} to="/my-pets">
            <Card.Body className="text-center p-4">
              <div style={styles.actionIcon} className="mx-auto">
                <PlusCircle />
              </div>
              <h5 style={styles.cardTitle}>Add a Pet</h5>
              <p className="text-muted">
                Register a new pet to your profile
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Appointments */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Upcoming Appointments</h5>
              <Link to="/my-appointments" style={styles.viewAllLink}>
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {loading.appointments ? (
                renderLoading('appointments')
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <Card key={appointment._id} style={styles.appointmentCard}>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h6 style={styles.cardTitle}>
                            {appointment.service?.name || 'Veterinary Service'} with {appointment.providerProfile?.user?.name || 'Veterinarian'}
                          </h6>
                          <p className="text-muted mb-0">
                            For {appointment.pet?.name || 'Your Pet'}
                          </p>
                        </Col>
                        <Col md={4}>
                          <div style={styles.infoItem}>
                            <Clock style={styles.infoIcon} />
                            {new Date(appointment.appointmentTime).toLocaleDateString()} at {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={styles.infoItem}>
                            <GeoAlt style={styles.infoIcon} />
                            {appointment.appointmentLocation}
                          </div>
                        </Col>
                        <Col md={2} className="text-end d-flex flex-column justify-content-between">
                          <Badge 
                            style={styles.statusBadge(appointment.status.toLowerCase())}
                            className="mb-2"
                          >
                            {appointment.status}
                          </Badge>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowDetails(appointment._id)}
                            style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                          >
                            Details
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No upcoming appointments</p>
                  <Button 
                    as={Link} 
                    to="/search-providers"
                    style={{ backgroundColor: theme.colors.secondary.main, borderColor: theme.colors.secondary.main }}
                  >
                    <Search className="me-2" />
                    Find a Vet
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pets and Reminders */}
      <Row>
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">My Pets</h5>
              <Link to="/my-pets" style={styles.viewAllLink}>
                Manage Pets
              </Link>
            </Card.Header>
            <Card.Body>
              {loading.pets ? (
                renderLoading('pets')
              ) : (
                <Row>
                  {pets.map((pet) => (
                    <Col md={6} key={pet._id} className="mb-3">
                      <Card style={styles.petCard}>
                        <Card.Img 
                          variant="top" 
                          src={pet.profileImage || 'https://via.placeholder.com/300x200?text=Pet'} 
                          style={styles.petImage}
                        />
                        <Card.Body>
                          <Card.Title style={styles.cardTitle}>{pet.name}</Card.Title>
                          <Card.Text className="text-muted mb-1">
                            {pet.breed} • {pet.age} years old
                          </Card.Text>
                          <Card.Text className="text-muted mb-3">
                            Last checkup: {pet.lastCheckup ? new Date(pet.lastCheckup).toLocaleDateString() : 'No records yet'}
                          </Card.Text>
                          <div className="d-grid">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              as={Link}
                              to={`/pet/${pet._id}`}
                              style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                            >
                              View Profile
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                  <Col md={6} className="mb-3">
                    <Card style={{ ...styles.petCard, height: '100%', border: `2px dashed ${theme.colors.background.light}` }}>
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                        <PlusCircle size={40} className="mb-3" style={{ color: theme.colors.primary.light }} />
                        <h5 style={styles.cardTitle}>Add a New Pet</h5>
                        <p className="text-muted text-center mb-3">
                          Register a new pet to your profile
                        </p>
                        <Button 
                          as={Link} 
                          to="/add-pet"
                          style={{ backgroundColor: theme.colors.primary.main, borderColor: theme.colors.primary.main }}
                        >
                          Add Pet
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Reminders</h5>
            </Card.Header>
            <Card.Body>
              {loading.reminders ? (
                renderLoading('reminders')
              ) : reminders.length > 0 ? (
                reminders.map((reminder) => (
                  <div 
                    key={reminder._id} 
                    className="p-3 mb-3" 
                    style={{ 
                      backgroundColor: `${theme.colors.background.light}50`,
                      borderRadius: theme.borderRadius.md,
                      borderLeft: `4px solid ${styles.reminderBadge(reminder.priority).backgroundColor}`
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 style={styles.cardTitle}>{reminder.title}</h6>
                      <Badge style={styles.reminderBadge(reminder.priority)}>
                        {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted mb-1">{reminder.description}</p>
                    <small className="d-flex align-items-center">
                      <Bell className="me-1" style={{ color: theme.colors.primary.main }} />
                      Due: {new Date(reminder.dueDate).toLocaleDateString()}
                    </small>
                  </div>
                ))
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-3">No reminders yet</p>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    as={Link}
                    to="/add-reminder"
                    style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                  >
                    Add Reminder
                  </Button>
                </div>
              )}
              {reminders.length > 0 && (
                <div className="text-center">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    as={Link}
                    to="/add-reminder"
                    style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                  >
                    Add Reminder
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Top Rated Vets Near You</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex mb-3 pb-3" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
                <img 
                  src="https://randomuser.me/api/portraits/women/68.jpg" 
                  alt="Dr. Sarah Johnson"
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                />
                <div>
                  <h6 style={styles.cardTitle} className="mb-0">Dr. Sarah Johnson</h6>
                  <div className="d-flex align-items-center mb-1">
                    <Stars className="me-1" style={{ color: theme.colors.accent.gold }} />
                    <span className="text-muted">4.9 (42 reviews)</span>
                  </div>
                  <small className="text-muted">Small Animals Specialist</small>
                </div>
              </div>
              
              <div className="d-flex mb-3">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Dr. Michael Chen"
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '15px' }}
                />
                <div>
                  <h6 style={styles.cardTitle} className="mb-0">Dr. Michael Chen</h6>
                  <div className="d-flex align-items-center mb-1">
                    <Stars className="me-1" style={{ color: theme.colors.accent.gold }} />
                    <span className="text-muted">4.8 (37 reviews)</span>
                  </div>
                  <small className="text-muted">Exotic Animals Specialist</small>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <Button 
                  as={Link} 
                  to="/search-providers"
                  variant="outline-primary"
                  style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                >
                  View All Vets
                </Button>
              </div>
            </Card.Body>
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