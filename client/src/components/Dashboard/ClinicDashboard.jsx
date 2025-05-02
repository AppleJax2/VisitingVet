import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Tabs, Tab, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Calendar3, Clock, GeoAlt, Cash, Star, 
  PeopleFill, Check2Circle, XCircle, Eye, 
  Building, Download, Wallet2, BellFill,
  PencilSquare, PlusCircle, BarChartFill, FileEarmarkText
} from 'react-bootstrap-icons';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { 
  fetchClinicAppointments, 
  fetchClinicStaff, 
  fetchClinicStats, 
  fetchClinicInventory, 
  fetchClinicRevenueData, 
  fetchClinicServiceData 
} from '../../services/api';
import AppointmentDetailModal from '../AppointmentDetailModal';
import { format } from 'date-fns';

const ClinicDashboard = ({ user }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState('');
  
  // State for clinic stats
  const [clinicStats, setClinicStats] = useState({
    totalAppointments: 0,
    totalProviders: 0,
    totalClients: 0,
    totalEarnings: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');
  
  // State for inventory
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [inventoryError, setInventoryError] = useState('');
  
  // State for chart data
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        backgroundColor: 'rgba(var(--bs-primary-rgb), 0.3)',
        borderColor: 'var(--bs-primary)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  });
  const [serviceDistributionData, setServiceDistributionData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Services',
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
        ],
        borderWidth: 1,
      }
    ]
  });
  const [loadingChartData, setLoadingChartData] = useState(true);
  const [chartDataError, setChartDataError] = useState('');
  
  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  useEffect(() => {
    loadAppointments(selectedDate);
    loadStaff();
    loadStats();
    loadInventory();
    loadChartData();
  }, [selectedDate]); // Reload appointments when date changes

  const loadAppointments = async (date) => {
      setLoadingAppointments(true);
      setAppointmentsError('');
      try {
          const response = await fetchClinicAppointments(user?.clinicId, date); // Assuming clinicId is available on user
          if (response.success) {
              setAppointments(response.appointments || []);
          } else {
              setAppointmentsError(response.error || 'Failed to load appointments for this date.');
          }
      } catch (err) {
          console.error('Error fetching clinic appointments:', err);
          setAppointmentsError(err.message || 'An error occurred fetching appointments.');
      } finally {
          setLoadingAppointments(false);
      }
  };

  const loadStaff = async () => {
      setLoadingStaff(true);
      setStaffError('');
      try {
          const response = await fetchClinicStaff(user?.clinicId);
          if (response.success) {
              setStaff(response.staff || []);
          } else {
              setStaffError(response.error || 'Failed to load staff list.');
          }
      } catch (err) {
          console.error('Error fetching clinic staff:', err);
          setStaffError(err.message || 'An error occurred fetching staff.');
      } finally {
          setLoadingStaff(false);
      }
  };
  
  const loadStats = async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const response = await fetchClinicStats(user?.clinicId);
      if (response.success) {
        setClinicStats(response.stats || {
          totalAppointments: 0,
          totalProviders: 0,
          totalClients: 0,
          totalEarnings: 0
        });
      } else {
        setStatsError(response.error || 'Failed to load clinic statistics.');
      }
    } catch (err) {
      console.error('Error fetching clinic stats:', err);
      setStatsError(err.message || 'An error occurred fetching statistics.');
    } finally {
      setLoadingStats(false);
    }
  };
  
  const loadInventory = async () => {
    setLoadingInventory(true);
    setInventoryError('');
    try {
      const response = await fetchClinicInventory(user?.clinicId);
      if (response.success) {
        setInventoryAlerts(response.inventory || []);
      } else {
        setInventoryError(response.error || 'Failed to load inventory alerts.');
      }
    } catch (err) {
      console.error('Error fetching clinic inventory:', err);
      setInventoryError(err.message || 'An error occurred fetching inventory.');
    } finally {
      setLoadingInventory(false);
    }
  };
  
  const loadChartData = async () => {
    setLoadingChartData(true);
    setChartDataError('');
    try {
      const revenueResponse = await fetchClinicRevenueData(user?.clinicId);
      if (revenueResponse.success) {
        setRevenueData({
          labels: revenueResponse.data.labels || [],
          datasets: [
            {
              label: 'Revenue',
              data: revenueResponse.data.values || [],
              backgroundColor: 'rgba(var(--bs-primary-rgb), 0.3)',
              borderColor: 'var(--bs-primary)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
            }
          ]
        });
      } else {
        setChartDataError(revenueResponse.error || 'Failed to load revenue data.');
      }
      
      const serviceResponse = await fetchClinicServiceData(user?.clinicId);
      if (serviceResponse.success) {
        setServiceDistributionData({
          labels: serviceResponse.data.labels || [],
          datasets: [
            {
              label: 'Services',
              data: serviceResponse.data.values || [],
              backgroundColor: [
                'var(--bs-primary)',
                'var(--bs-info)',
                'var(--bs-warning)',
                'var(--bs-success)',
                'var(--bs-secondary)',
                'var(--bs-danger)',
                'var(--bs-light)',
                'var(--bs-dark)'
              ],
              borderWidth: 1,
            }
          ]
        });
      } else {
        setChartDataError(prevError => 
          prevError ? `${prevError} Also, failed to load service data.` : 'Failed to load service data.'
        );
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setChartDataError(err.message || 'An error occurred fetching chart data.');
    } finally {
      setLoadingChartData(false);
    }
  };
  
  // Modal Handlers
  const handleShowDetails = (id) => {
      setSelectedAppointmentId(id);
      setShowDetailModal(true);
  };
  
  const handleHideDetails = () => {
      setSelectedAppointmentId(null);
      setShowDetailModal(false);
      // Option to refetch appointments if modal changed status
      loadAppointments(selectedDate); 
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
          color: 'rgba(var(--bs-body-color-rgb), 0.1)',
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

  // Helper for badge variants
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'ok':
         return 'success';
      case 'pending':
      case 'break':
         return 'warning';
      case 'cancelled':
      case 'off':
      case 'low':
         return 'danger';
      case 'completed':
         return 'secondary';
      default:
         return 'light'; // Default for unknown
    }
  };

  return (
    <div className="clinic-dashboard p-3">
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-primary-subtle text-primary rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Calendar3 />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Total Appointments</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{clinicStats.totalAppointments}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-success-subtle text-success rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <PeopleFill />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Staff Members</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{clinicStats.totalProviders}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-warning-subtle text-warning rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <PeopleFill />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Clients</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">{clinicStats.totalClients}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center me-3 p-2 bg-secondary-subtle text-secondary rounded"
                style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}
              >
                <Cash />
              </div>
              <div>
                <h6 className="text-muted mb-1 small">Monthly Revenue</h6>
                {loadingStats ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <h3 className="mb-0 fw-bold">${clinicStats.totalEarnings}</h3>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Calendar and Staff Section */}
      <Row className="mb-4">
        <Col lg={8} className="mb-3 mb-lg-0">
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark fw-semibold">Today's Schedule</h5>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="me-2 form-control-sm"
                  style={{ width: 'auto' }}
                />
                <Link to="/clinic-appointments" className="btn btn-link btn-sm text-primary fw-medium">
                  View Full Calendar
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingAppointments && <div className="text-center"><Spinner animation="border" /></div>}
              {appointmentsError && <Alert variant="danger">{appointmentsError}</Alert>}
              {!loadingAppointments && !appointmentsError && appointments.length === 0 && (
                  <p className="text-center text-muted">No appointments scheduled for {format(new Date(selectedDate+'T00:00:00Z'), 'PPP')}.</p>
              )}
              <ListGroup variant="flush">
                {!loadingAppointments && !appointmentsError && appointments.map((appointment) => (
                  <ListGroup.Item key={appointment._id} className="px-0">
                    <Row className="align-items-center g-2">
                      <Col xs={2} md={1} className="text-center">
                        <span className="fw-bold small">{appointment.time}</span>
                      </Col>
                      <Col xs={10} md={3}>
                        <h6 className="mb-0 text-primary small fw-semibold">
                          {appointment.client}
                        </h6>
                        <small className="text-muted d-block">
                          {appointment.petName} ({appointment.petType})
                        </small>
                      </Col>
                      <Col xs={12} md={3} className="mt-1 mt-md-0">
                        <span className="small">{appointment.service}</span>
                      </Col>
                      <Col xs={6} md={3} className="mt-1 mt-md-0">
                        <span className="small">{appointment.assignedTo}</span>
                      </Col>
                      <Col xs={6} md={2} className="text-end mt-1 mt-md-0">
                        <Badge 
                          pill
                          bg={getStatusBadgeVariant(appointment.status)}
                          className="me-2"
                        >
                          {appointment.status ? 
                            appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) :
                            'Unknown'}
                        </Badge>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          as={Link}
                          to={`/appointment/${appointment.id}`}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary"
                  size="sm"
                >
                  <PlusCircle size={16} className="me-2" /> Add Appointment
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark fw-semibold">Staff</h5>
              <Link to="/clinic-staff" className="btn btn-link btn-sm text-primary fw-medium">
                Manage Staff
              </Link>
            </Card.Header>
            <ListGroup variant="flush">
              {loadingStaff && <ListGroup.Item className="text-center"><Spinner animation="border" size="sm" /></ListGroup.Item>}
              {staffError && <ListGroup.Item><Alert variant="danger" size="sm">{staffError}</Alert></ListGroup.Item>}
              {!loadingStaff && !staffError && staff.length === 0 && (
                <ListGroup.Item className="text-center text-muted">No staff members found.</ListGroup.Item>
              )}
              {!loadingStaff && !staffError && staff.map((staffMember) => (
                <ListGroup.Item key={staffMember.id} className="d-flex align-items-center">
                  <img 
                    src={staffMember.image}
                    alt={staffMember.name}
                    className="rounded-circle me-3"
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 text-primary fw-semibold">
                      {staffMember.name}
                    </h6>
                    <small className="d-block text-muted">
                      {staffMember.role} • {staffMember.specialty}
                    </small>
                    <small className="d-block text-muted">
                      {staffMember.appointmentsToday} appt(s) today
                    </small>
                  </div>
                  <Badge pill bg={getStatusBadgeVariant(staffMember.status)}>
                    {staffMember.status ? 
                      (staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1)) : 
                      'Unknown'}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Body className="text-center border-top">
              <Button 
                variant="outline-primary"
                size="sm"
              >
                <PlusCircle size={16} className="me-2" /> Add Staff Member
              </Button>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0 text-dark fw-semibold">Inventory Alerts</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {loadingInventory && <ListGroup.Item className="text-center"><Spinner animation="border" size="sm" /></ListGroup.Item>}
              {inventoryError && <ListGroup.Item><Alert variant="danger" size="sm">{inventoryError}</Alert></ListGroup.Item>}
              {!loadingInventory && !inventoryError && inventoryAlerts.length === 0 && (
                <ListGroup.Item className="text-center text-muted">No inventory alerts.</ListGroup.Item>
              )}
              {!loadingInventory && !inventoryError && inventoryAlerts.map((item) => (
                <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 small fw-semibold">{item.item}</h6>
                    <small className="text-muted">
                      Stock: {item.currentStock} / {item.minRequired}
                    </small>
                  </div>
                  <div>
                    <Badge pill bg={getStatusBadgeVariant(item.status)} className="me-2">
                      {item.status === 'low' ? 'Low' : 'OK'}
                    </Badge>
                    {item.status === 'low' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Card.Body className="text-center border-top">
              <Button 
                as={Link}
                to="/inventory"
                variant="outline-primary"
                size="sm"
              >
                View Inventory
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Analytics Section */}
      <Row className="mt-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Tabs defaultActiveKey="revenue" id="clinic-analytics-tabs" className="nav-tabs-bordered">
              <Tab eventKey="revenue" title="Revenue">
                <Card.Body>
                  <div style={{ height: '300px' }} className="mt-3">
                    {loadingChartData ? (
                      <div className="text-center h-100 d-flex align-items-center justify-content-center">
                        <Spinner animation="border" />
                      </div>
                    ) : chartDataError ? (
                      <Alert variant="danger">{chartDataError}</Alert>
                    ) : (
                      <Chart type="line" data={revenueData} options={chartOptions} />
                    )}
                  </div>
                </Card.Body>
              </Tab>
              <Tab eventKey="services" title="Services">
                <Card.Body>
                  <Row className="mt-3">
                    <Col md={7} className="mb-3 mb-md-0">
                      <div style={{ height: '300px' }}>
                        {loadingChartData ? (
                          <div className="text-center h-100 d-flex align-items-center justify-content-center">
                            <Spinner animation="border" />
                          </div>
                        ) : chartDataError ? (
                          <Alert variant="danger">{chartDataError}</Alert>
                        ) : (
                          <Chart type="doughnut" data={serviceDistributionData} options={doughnutOptions} />
                        )}
                      </div>
                    </Col>
                    <Col md={5} className="d-flex flex-column justify-content-center">
                      <h5 className="mb-3 text-dark fw-semibold">Service Distribution</h5>
                      <p className="text-muted small">
                        {(serviceDistributionData.labels?.length || 0) > 0 ? 
                          `Analysis shows dominant service types.` :
                          'No service data available for analysis.'}
                      </p>
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        className="mt-3 align-self-start"
                      >
                        <BarChartFill className="me-2" /> View Detailed Reports
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>
      
      {/* Install Now Card */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm text-center p-4 bg-light">
            <Card.Body className="d-flex flex-column align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center mb-3 p-3 bg-secondary-subtle text-secondary rounded-3"
                style={{ fontSize: '2rem' }}
              >
                <Download />
              </div>
              <h4 className="text-dark fw-semibold mb-2">Desktop Application Available</h4>
              <p className="text-muted mb-4 w-75 small">
                For faster access to your clinic management dashboard and additional offline features, install our desktop application. 
                Manage your clinic operations seamlessly even with unstable internet connections.
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
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow-sm h-100 border-0">
            <Card.Body className="text-center d-flex flex-column align-items-center p-4">
              <FileEarmarkText size={40} className="mb-3 text-primary" />
              <Card.Title className="h6 fw-semibold">Specialist Referrals</Card.Title>
              <Card.Text className="small text-muted flex-grow-1">
                Manage referrals to mobile veterinary specialists.
              </Card.Text>
              <Button 
                variant="primary" 
                as={Link} 
                to="/dashboard/clinic/service-requests"
                className="mt-3"
              >
                Manage Referrals
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
          userRole="clinic"
          onUpdate={() => loadAppointments(selectedDate)}
        />
      )}
    </div>
  );
};

export default ClinicDashboard; 