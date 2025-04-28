import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Calendar3, Clock, GeoAlt, Cash, Star, 
  PeopleFill, Check2Circle, XCircle, Eye, 
  BarChart, Download, Wallet2, BellFill, FileEarmarkText 
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { getMyAppointmentsProvider, updateAppointmentStatus } from '../../services/api';
import AppointmentDetailModal from '../AppointmentDetailModal';
import { format } from 'date-fns';

const ProviderDashboard = ({ user }) => {
  const [dateRange, setDateRange] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [statsData, setStatsData] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
  // Sample data for demonstration
  const stats = {
    pendingAppointments: 5,
    confirmedAppointments: 12,
    totalEarnings: 2450,
    rating: 4.8,
    reviewCount: 42
  };

  const upcomingAppointments = [
    {
      id: 1,
      clientName: 'Emily Thompson',
      petName: 'Max',
      service: 'Wellness Checkup',
      date: '2023-11-30',
      time: '10:00 AM',
      status: 'pending',
      location: '123 Maple St',
      distance: '2.5 miles'
    },
    {
      id: 2,
      clientName: 'Robert Adams',
      petName: 'Bella',
      service: 'Vaccination',
      date: '2023-11-30',
      time: '2:30 PM',
      status: 'confirmed',
      location: '456 Oak Ave',
      distance: '3.2 miles'
    },
    {
      id: 3,
      clientName: 'Jennifer Wilson',
      petName: 'Charlie',
      service: 'Dental Cleaning',
      date: '2023-12-01',
      time: '11:15 AM',
      status: 'confirmed',
      location: '789 Pine Rd',
      distance: '1.8 miles'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_appointment',
      message: 'New appointment request from Sarah Miller',
      time: '10 minutes ago'
    },
    {
      id: 2,
      type: 'completed_appointment',
      message: 'Completed appointment with James Johnson',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'new_review',
      message: 'New 5-star review from Melissa Davis',
      time: '1 day ago'
    }
  ];
  
  // Chart data
  const earningsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Earnings',
        data: [320, 420, 380, 450, 600, 380, 340],
        backgroundColor: `${theme.colors.primary.main}50`,
        borderColor: theme.colors.primary.main,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const appointmentTypeData = {
    labels: ['Checkups', 'Vaccinations', 'Dental Care', 'Emergency', 'Other'],
    datasets: [
      {
        label: 'Appointment Types',
        data: [35, 25, 15, 10, 15],
        backgroundColor: [
          theme.colors.primary.main,
          theme.colors.primary.light,
          theme.colors.secondary.main,
          theme.colors.accent.gold,
          theme.colors.accent.lightGreen,
        ],
        borderWidth: 1,
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${theme.colors.text.light}20`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
    },
  };

  // Styles
  const styles = {
    statCard: {
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      height: '100%',
      boxShadow: theme.shadows.sm,
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '16px',
      fontSize: '1.5rem',
    },
    appointmentCard: {
      border: 'none',
      borderRadius: theme.borderRadius.md,
      marginBottom: '15px',
      boxShadow: theme.shadows.sm,
    },
    sectionTitle: {
      color: theme.colors.primary.dark,
      fontWeight: '600',
      marginBottom: '20px',
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
    statusBadge: (status) => {
      const colors = {
        confirmed: theme.colors.success,
        pending: theme.colors.warning,
        cancelled: theme.colors.error,
        completed: '#6c757d',
      };
      return {
        backgroundColor: colors[status],
      };
    },
    activityIcon: (type) => {
      const colors = {
        new_appointment: theme.colors.primary.main,
        completed_appointment: theme.colors.success,
        new_review: theme.colors.accent.gold,
        payment_received: theme.colors.secondary.main,
      };
      return {
        backgroundColor: `${colors[type]}20`,
        color: colors[type],
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px',
      };
    },
    chartContainer: {
      height: '250px',
    },
    switchButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.colors.text.secondary,
      fontWeight: '500',
      padding: '6px 12px',
      borderRadius: theme.borderRadius.md,
    },
    activeSwitchButton: {
      backgroundColor: `${theme.colors.primary.main}20`,
      color: theme.colors.primary.main,
    },
  };

  // Get activity icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar3 />;
      case 'completed_appointment':
        return <Check2Circle />;
      case 'new_review':
        return <Star />;
      case 'payment_received':
        return <Cash />;
      default:
        return <BellFill />;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    setAppointmentsError('');
    try {
      const upcomingStatuses = ['Requested', 'Confirmed'];
      const confirmedResponse = await getMyAppointmentsProvider('Confirmed');
      const requestedResponse = await getMyAppointmentsProvider('Requested');
      
      let fetchedAppointments = [];
      if (confirmedResponse.success) {
          fetchedAppointments = fetchedAppointments.concat(confirmedResponse.data || []);
      }
      if (requestedResponse.success) {
          fetchedAppointments = fetchedAppointments.concat(requestedResponse.data || []);
      }
      
      fetchedAppointments.sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
      
      setAppointments(fetchedAppointments);
      
    } catch (err) {
      console.error('Error fetching provider appointments:', err);
      setAppointmentsError('Failed to load appointments. Please try again.');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
      try {
          const response = await updateAppointmentStatus(appointmentId, newStatus);
          if (response.success) {
              fetchAppointments();
          } else {
              setAppointmentsError(response.error || `Failed to ${newStatus.toLowerCase()} appointment.`);
          }
      } catch (err) {
          console.error(`Error updating appointment status to ${newStatus}:`, err);
          setAppointmentsError(err.message || `An error occurred while updating the appointment.`);
      }
  };
  
  const handleShowDetails = (id) => {
      setSelectedAppointmentId(id);
      setShowDetailModal(true);
  };
  
  const handleHideDetails = () => {
      setSelectedAppointmentId(null);
      setShowDetailModal(false);
      fetchAppointments(); 
  };

  return (
    <div className="provider-dashboard">
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body className="d-flex align-items-center">
              <div 
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${theme.colors.primary.main}20`,
                  color: theme.colors.primary.main
                }}
              >
                <Calendar3 />
              </div>
              <div>
                <h6 className="text-muted mb-1">Pending Appointments</h6>
                <h3 className="mb-0">{stats.pendingAppointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body className="d-flex align-items-center">
              <div 
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${theme.colors.success}20`,
                  color: theme.colors.success
                }}
              >
                <Check2Circle />
              </div>
              <div>
                <h6 className="text-muted mb-1">Confirmed Appointments</h6>
                <h3 className="mb-0">{stats.confirmedAppointments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body className="d-flex align-items-center">
              <div 
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${theme.colors.accent.gold}20`,
                  color: theme.colors.accent.gold
                }}
              >
                <Star />
              </div>
              <div>
                <h6 className="text-muted mb-1">Average Rating</h6>
                <h3 className="mb-0">{stats.rating} <small className="text-muted fs-6">({stats.reviewCount})</small></h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card style={styles.statCard}>
            <Card.Body className="d-flex align-items-center">
              <div 
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${theme.colors.secondary.main}20`,
                  color: theme.colors.secondary.main
                }}
              >
                <Wallet2 />
              </div>
              <div>
                <h6 className="text-muted mb-1">Monthly Earnings</h6>
                <h3 className="mb-0">${stats.totalEarnings}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Earnings Overview</h5>
              <div>
                <Button 
                  style={{
                    ...styles.switchButton,
                    ...(dateRange === 'week' ? styles.activeSwitchButton : {})
                  }}
                  onClick={() => setDateRange('week')}
                >
                  Weekly
                </Button>
                <Button 
                  style={{
                    ...styles.switchButton,
                    ...(dateRange === 'month' ? styles.activeSwitchButton : {})
                  }}
                  onClick={() => setDateRange('month')}
                >
                  Monthly
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={styles.chartContainer}>
                <Chart type="line" data={earningsData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Appointment Types</h5>
            </Card.Header>
            <Card.Body>
              <div style={styles.chartContainer}>
                <Chart type="doughnut" data={appointmentTypeData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Appointments & Activity */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Upcoming Appointments</h5>
              <Link to="/provider-appointments" style={styles.viewAllLink}>
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {loadingAppointments && <div className="text-center"><Spinner animation="border" /></div>}
              {appointmentsError && <Alert variant="danger">{appointmentsError}</Alert>}
              {!loadingAppointments && !appointmentsError && appointments.length === 0 && (
                  <p className="text-center text-muted">No upcoming appointments found.</p>
              )}
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} style={styles.appointmentCard}>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6 style={{ color: theme.colors.primary.main, fontWeight: '600' }}>
                          {appointment.service} for {appointment.petName}
                        </h6>
                        <p className="text-muted mb-0">
                          Client: {appointment.clientName}
                        </p>
                      </Col>
                      <Col md={4}>
                        <div style={styles.infoItem}>
                          <Clock style={styles.infoIcon} />
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </div>
                        <div style={styles.infoItem}>
                          <GeoAlt style={styles.infoIcon} />
                          {appointment.location} ({appointment.distance})
                        </div>
                      </Col>
                      <Col md={2} className="text-end d-flex flex-column justify-content-between">
                        <Badge 
                          style={styles.statusBadge(appointment.status)}
                          className="mb-2"
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            as={Link}
                            to={`/appointment/${appointment.id}`}
                            className="me-1"
                            style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                          >
                            <Eye size={16} />
                          </Button>
                          {appointment.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                className="me-1"
                                style={{ borderColor: theme.colors.success, color: theme.colors.success }}
                              >
                                <Check2Circle size={16} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                style={{ borderColor: theme.colors.error, color: theme.colors.error }}
                              >
                                <XCircle size={16} />
                              </Button>
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="d-flex align-items-start mb-4"
                >
                  <div style={styles.activityIcon(activity.type)}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="mb-1">{activity.message}</p>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary"
                  style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                >
                  View All Activity
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Install Now Button Card */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div 
                style={{
                  backgroundColor: `${theme.colors.secondary.main}20`,
                  color: theme.colors.secondary.main,
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '16px',
                }}
              >
                <Download />
              </div>
              <h5 style={{ color: theme.colors.primary.dark, fontWeight: '600' }}>Desktop Application</h5>
              <p className="text-muted mb-3">
                Install our desktop application for quick access to your dashboard and offline features.
              </p>
              <Button 
                style={{
                  backgroundColor: theme.colors.secondary.main,
                  borderColor: theme.colors.secondary.main,
                }}
              >
                <Download className="me-2" /> Install Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Service Requests Card */}
      <Col md={4}>
        <Card className="dashboard-card shadow-sm h-100">
          <Card.Body className="text-center">
            <FileEarmarkText size={40} className="mb-3 text-primary" />
            <Card.Title>Service Requests</Card.Title>
            <Card.Text>
              View and respond to service requests from clinics.
            </Card.Text>
            <Button 
              variant="primary" 
              as={Link} 
              to="/dashboard/provider/service-requests"
            >
              View Requests
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </div>
  );
};

export default ProviderDashboard; 