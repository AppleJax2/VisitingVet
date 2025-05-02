import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Calendar3, Clock, GeoAlt, Cash, Star, 
  PeopleFill, Check2Circle, XCircle, Eye, 
  BarChart, Download, Wallet2, BellFill, FileEarmarkText, Search, GeoAltFill, TagFill, HeartPulseFill, InfoCircle, StarFill, ExclamationTriangleFill 
} from 'react-bootstrap-icons';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  getMyAppointmentsProvider, 
  updateAppointmentStatus, 
  fetchProviderStats, 
  fetchProviderRevenueData, 
  fetchProviderAppointmentTypes,
  fetchProviderActivity 
} from '../../services/api';
import AppointmentDetailModal from '../AppointmentDetailModal';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';

const ProviderDashboard = ({ user }) => {
  const [dateRange, setDateRange] = useState('week');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    confirmedAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');
  
  // Chart data state with updated colors using CSS variables
  const [earningsData, setEarningsData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Earnings',
        data: [],
        backgroundColor: 'rgba(var(--bs-primary-rgb), 0.3)', // Use CSS var with opacity
        borderColor: 'var(--bs-primary)', // Use CSS var
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  });
  const [appointmentTypeData, setAppointmentTypeData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Appointment Types',
        data: [],
        backgroundColor: [
          'var(--bs-primary)', 
          'var(--bs-info)', 
          'var(--bs-warning)', 
          'var(--bs-success)',
          'var(--bs-secondary)',
          'var(--bs-danger)', 
          'var(--bs-light)', 
          'var(--bs-dark)'
        ], // Use CSS vars for colors
        borderWidth: 1,
      }
    ]
  });
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [chartDataError, setChartDataError] = useState('');
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Chart options - updated grid color
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
          color: 'rgba(var(--bs-body-color-rgb), 0.1)', // Use body color CSS var with opacity
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
    fetchStats();
    fetchActivity();
    fetchChartData(dateRange);
  }, []);
  
  useEffect(() => {
    fetchChartData(dateRange);
  }, [dateRange]);

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
  
  const fetchStats = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const response = await fetchProviderStats(user?._id);
      if (response.success) {
        setStats(response.stats || {
          pendingAppointments: 0,
          confirmedAppointments: 0,
          totalEarnings: 0,
          rating: 0,
          reviewCount: 0
        });
      } else {
        setStatsError(response.error || 'Failed to load provider statistics.');
      }
    } catch (err) {
      console.error('Error fetching provider stats:', err);
      setStatsError(err.message || 'An error occurred fetching statistics.');
    } finally {
      setLoadingStats(false);
    }
  };
  
  const fetchActivity = async () => {
    setLoadingActivity(true);
    setActivityError('');
    try {
      const response = await fetchProviderActivity(user?._id);
      if (response.success) {
        setActivity(response.activity || []);
      } else {
        setActivityError(response.error || 'Failed to load recent activity.');
      }
    } catch (err) {
      console.error('Error fetching provider activity:', err);
      setActivityError(err.message || 'An error occurred fetching activity.');
    } finally {
      setLoadingActivity(false);
    }
  };
  
  const fetchChartData = async (range) => {
    setLoadingChartData(true);
    setChartDataError('');
    try {
      const revenueResponse = await fetchProviderRevenueData(user?._id, range);
      if (revenueResponse.success) {
        setEarningsData({
          labels: revenueResponse.data.labels || [],
          datasets: [
            {
              label: range === 'week' ? 'Weekly Earnings' : 'Monthly Earnings',
              data: revenueResponse.data.values || [],
              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.3)', // Updated
              borderColor: 'var(--bs-primary)', // Updated
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            }
          ]
        });
      } else {
        setChartDataError(revenueResponse.error || 'Failed to load earnings data.');
      }
      
      const appointmentTypesResponse = await fetchProviderAppointmentTypes(user?._id);
      if (appointmentTypesResponse.success) {
        setAppointmentTypeData({
          labels: appointmentTypesResponse.data.labels || [],
          datasets: [
            {
              label: 'Appointment Types',
              data: appointmentTypesResponse.data.values || [],
              backgroundColor: [
                'var(--bs-primary)', 
                'var(--bs-info)', 
                'var(--bs-warning)', 
                'var(--bs-success)',
                'var(--bs-secondary)',
                'var(--bs-danger)', 
                'var(--bs-light)', 
                'var(--bs-dark)' 
              ], // Updated
              borderWidth: 1,
            }
          ]
        });
      } else {
        setChartDataError(prevError => 
          prevError ? `${prevError} Also, failed to load appointment type data.` : 'Failed to load appointment type data.'
        );
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setChartDataError(err.message || 'An error occurred fetching chart data.');
    } finally {
      setLoadingChartData(false);
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
  
  const renderLoading = (section) => (
    // Use Bootstrap classes for centering
    <div className="d-flex justify-content-center align-items-center text-primary" style={{ minHeight: '150px' }}> 
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading {section}...</span>
      </Spinner>
    </div>
  );

  // Helper to get badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'requested': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'secondary';
      default: return 'light';
    }
  };

  // Helper to get activity icon classes
  const getActivityIconClass = (type) => {
    switch (type) {
      case 'new_appointment': return 'bg-primary-subtle text-primary';
      case 'completed_appointment': return 'bg-success-subtle text-success';
      case 'new_review': return 'bg-warning-subtle text-warning';
      case 'payment_received': return 'bg-secondary-subtle text-secondary';
      default: return 'bg-light text-dark';
    }
  };

  return (
    <div className="provider-dashboard p-3"> {/* Added padding */}
      {/* Stats Cards - Use utility classes */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-primary-subtle text-primary rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Calendar3 />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Pending Appointments</h6> 
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{stats.pendingAppointments}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                 className="d-flex align-items-center justify-content-center me-3 p-2 bg-success-subtle text-success rounded"
                 style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Check2Circle />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Confirmed Appointments</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{stats.confirmedAppointments}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-warning-subtle text-warning rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Star />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Average Rating</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{stats.rating.toFixed(1)} <small className="text-muted fw-normal">({stats.reviewCount})</small></h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-secondary-subtle text-secondary rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Wallet2 />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Monthly Earnings</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">${stats.totalEarnings}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3 mb-lg-0"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark fw-semibold">Earnings Overview</h5>
              <div>
                <Button 
                  variant={dateRange === 'week' ? "primary" : "outline-secondary"} 
                  size="sm" 
                  onClick={() => setDateRange('week')} 
                  className="me-1"
                >
                  Weekly
                </Button>
                <Button 
                  variant={dateRange === 'month' ? "primary" : "outline-secondary"} 
                  size="sm" 
                  onClick={() => setDateRange('month')}
                >
                  Monthly
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                {loadingChartData ? (
                  renderLoading('earnings data')
                ) : chartDataError ? (
                  <Alert variant="danger">{chartDataError}</Alert>
                ) : (
                  <Chart type="line" data={earningsData} options={chartOptions} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0 text-dark fw-semibold">Appointment Types</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                {loadingChartData ? (
                  renderLoading('appointment types')
                ) : chartDataError ? (
                  <Alert variant="danger">{chartDataError}</Alert>
                ) : (
                  <Chart type="doughnut" data={appointmentTypeData} options={doughnutOptions} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Appointments & Activity */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3 mb-lg-0"> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark fw-semibold">Upcoming Appointments</h5>
              <Link to="/provider-appointments" className="btn btn-link btn-sm text-primary fw-medium"> 
                View All
              </Link>
            </Card.Header>
            <Card.Body>
              {loadingAppointments && renderLoading('appointments')}
              {appointmentsError && <Alert variant="danger">{appointmentsError}</Alert>}
              {!loadingAppointments && !appointmentsError && appointments.length === 0 && (
                  <p className="text-center text-muted">No upcoming appointments found.</p>
              )}
              {!loadingAppointments && !appointmentsError && appointments.map((appointment) => (
                <Card key={appointment._id} className="mb-3 shadow-sm border">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6 className="text-primary fw-semibold">
                          {appointment.service?.name || 'Veterinary Service'} for {appointment.pet?.name || 'Pet'}
                        </h6>
                        <p className="text-muted mb-0 small">
                          Client: {appointment.clientProfile?.user?.name || 'Client'}
                        </p>
                      </Col>
                      <Col md={4} className="small">
                        <div className="d-flex align-items-center text-muted mb-1">
                          <Clock className="me-2 text-primary"/>
                          {new Date(appointment.appointmentTime).toLocaleDateString()} at {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <GeoAlt className="me-2 text-primary" />
                          {appointment.appointmentLocation || 'Location not specified'}
                        </div>
                      </Col>
                      <Col md={2} className="text-end d-flex flex-column justify-content-between align-items-end">
                        <Badge 
                          pill 
                          bg={getStatusBadgeVariant(appointment.status)} // Use helper function
                          className="mb-2"
                        >
                          {appointment.status ? 
                            appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 
                            'Pending'}
                        </Badge>
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleShowDetails(appointment._id)}
                            className="me-1"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          {appointment.status === 'Requested' && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                className="me-1"
                                onClick={() => handleUpdateStatus(appointment._id, 'Confirmed')}
                                title="Confirm"
                              >
                                <Check2Circle size={16} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment._id, 'Cancelled')}
                                title="Cancel"
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
        
        <Col lg={4}> {/* Adjusted cols */} 
          <Card className="border-0 shadow-sm mb-3 mb-lg-0"> {/* Added mb */} 
            <Card.Header className="bg-light">
              <h5 className="mb-0 text-dark fw-semibold">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {loadingActivity && renderLoading('activity')}
              {activityError && <Alert variant="danger">{activityError}</Alert>}
              {!loadingActivity && !activityError && activity.length === 0 && (
                <p className="text-center text-muted">No recent activity found.</p>
              )}
              {!loadingActivity && !activityError && activity.map((activityItem) => (
                <div 
                  key={activityItem._id}
                  className="d-flex align-items-start mb-4"
                >
                  <div 
                    className={`d-flex align-items-center justify-content-center me-3 p-2 rounded ${getActivityIconClass(activityItem.type)}`}
                    style={{ width: '40px', height: '40px' }}
                  >
                    {getActivityIcon(activityItem.type)}
                  </div>
                  <div>
                    <p className="mb-1 small">{activityItem.message}</p>
                    <small className="text-muted">{activityItem.timeAgo}</small>
                  </div>
                </div>
              ))}
              
              {!loadingActivity && !activityError && activity.length > 0 && (
                <div className="text-center mt-3">
                  <Button 
                    variant="outline-primary"
                    size="sm"
                  >
                    View All Activity
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
              <div 
                className="d-flex align-items-center justify-content-center mb-3 p-3 bg-secondary-subtle text-secondary rounded-3"
                style={{ fontSize: '2rem' }}
              >
                <Download />
              </div>
              <h5 className="text-dark fw-semibold">Desktop Application</h5>
              <p className="text-muted mb-3 small">
                Install our desktop application for quick access to your dashboard and offline features.
              </p>
              <Button 
                variant="secondary"
              >
                <Download className="me-2" /> Install Now
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Service Requests Card */}
      <Row className="mt-4"> {/* Added margin top */} 
        <Col md={4}>
          <Card className="shadow-sm h-100 border-0">
            <Card.Body className="text-center d-flex flex-column align-items-center p-4">
              <FileEarmarkText size={40} className="mb-3 text-primary" />
              <Card.Title className="h6 fw-semibold">Service Requests</Card.Title>
              <Card.Text className="small text-muted flex-grow-1">
                View and respond to service requests from clinics.
              </Card.Text>
              <Button 
                variant="primary" 
                as={Link} 
                to="/dashboard/provider/service-requests"
                className="mt-3"
              >
                View Requests
              </Button>
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
          userRole="provider"
          onUpdate={() => fetchAppointments()}
        />
      )}
    </div>
  );
};

export default ProviderDashboard; 