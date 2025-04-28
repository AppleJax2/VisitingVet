import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Tabs, Tab, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  Calendar3, Clock, GeoAlt, Cash, Star, 
  PeopleFill, Check2Circle, XCircle, Eye, 
  Building, Download, Wallet2, BellFill,
  PencilSquare, PlusCircle, BarChartFill, FileEarmarkText
} from 'react-bootstrap-icons';
import theme from '../../utils/theme';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { fetchClinicAppointments, fetchClinicStaff } from '../../services/api';
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
  
  // Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  
  // Sample data for demonstration
  const clinicStats = {
    totalAppointments: 42,
    totalProviders: 8,
    totalClients: 156,
    totalEarnings: 9850
  };

  useEffect(() => {
    loadAppointments(selectedDate);
    loadStaff();
    // TODO: Load stats, inventory, chart data
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

  // Chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [6500, 7200, 8100, 7900, 9200, 9850, 10200, 10500, 11200, 10800, 11500, 12000],
        backgroundColor: `${theme.colors.primary.main}50`,
        borderColor: theme.colors.primary.main,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const serviceDistributionData = {
    labels: ['Checkups', 'Vaccinations', 'Surgeries', 'Dental', 'Emergency', 'Other'],
    datasets: [
      {
        label: 'Services',
        data: [30, 22, 15, 12, 8, 13],
        backgroundColor: [
          theme.colors.primary.main,
          theme.colors.primary.light,
          theme.colors.secondary.main,
          theme.colors.accent.gold,
          theme.colors.error,
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
    statusBadge: (status) => {
      const colors = {
        confirmed: theme.colors.success,
        pending: theme.colors.warning,
        cancelled: theme.colors.error,
        completed: '#6c757d',
        active: theme.colors.success,
        break: theme.colors.warning,
        off: theme.colors.error,
        low: theme.colors.error,
        ok: theme.colors.success,
      };
      return {
        backgroundColor: colors[status],
      };
    },
    staffCard: {
      border: 'none',
      borderRadius: theme.borderRadius.md,
      height: '100%',
      boxShadow: theme.shadows.sm,
    },
    staffImage: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      marginRight: '15px',
      objectFit: 'cover',
    },
    appointmentRow: {
      borderRadius: theme.borderRadius.md,
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: theme.colors.background.white,
      boxShadow: theme.shadows.sm,
    },
    chartContainer: {
      height: '300px',
    },
    dateSelector: {
      borderColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.md,
      padding: '8px 16px',
      color: theme.colors.primary.main,
      fontWeight: '500',
    },
    tab: {
      fontWeight: '500',
      padding: '12px 20px',
      color: theme.colors.text.secondary,
      border: 'none',
      borderBottom: '2px solid transparent',
    },
    tabActive: {
      color: theme.colors.primary.main,
      borderBottom: `2px solid ${theme.colors.primary.main}`,
    },
    installButton: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
      padding: '10px 20px',
      fontWeight: '500',
    },
  };

  return (
    <div className="clinic-dashboard">
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
                <h6 className="text-muted mb-1">Total Appointments</h6>
                <h3 className="mb-0">{clinicStats.totalAppointments}</h3>
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
                <PeopleFill />
              </div>
              <div>
                <h6 className="text-muted mb-1">Staff Members</h6>
                <h3 className="mb-0">{clinicStats.totalProviders}</h3>
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
                <PeopleFill />
              </div>
              <div>
                <h6 className="text-muted mb-1">Clients</h6>
                <h3 className="mb-0">{clinicStats.totalClients}</h3>
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
                <Cash />
              </div>
              <div>
                <h6 className="text-muted mb-1">Monthly Revenue</h6>
                <h3 className="mb-0">${clinicStats.totalEarnings}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Calendar and Staff Section */}
      <Row className="mb-4">
        <Col md={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Today's Schedule</h5>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={styles.dateSelector}
                  className="me-2"
                />
                <Link to="/clinic-appointments" style={styles.viewAllLink}>
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
              {!loadingAppointments && !appointmentsError && appointments.map((appointment) => (
                <Row 
                  key={appointment._id} 
                  style={styles.appointmentRow}
                  className="align-items-center"
                >
                  <Col md={1}>
                    <span className="fw-bold">{appointment.time}</span>
                  </Col>
                  <Col md={3}>
                    <div>
                      <h6 style={{ color: theme.colors.primary.main, fontWeight: '600', marginBottom: '2px' }}>
                        {appointment.client}
                      </h6>
                      <small className="text-muted d-block">
                        {appointment.petName} ({appointment.petType})
                      </small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <span>{appointment.service}</span>
                  </Col>
                  <Col md={3}>
                    <span>{appointment.assignedTo}</span>
                  </Col>
                  <Col md={2} className="text-end">
                    <Badge 
                      style={styles.statusBadge(appointment.status)}
                      className="me-2"
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      as={Link}
                      to={`/appointment/${appointment.id}`}
                      style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                    >
                      <Eye size={14} />
                    </Button>
                  </Col>
                </Row>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary"
                  style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                >
                  <PlusCircle size={16} className="me-2" /> Add Appointment
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Staff</h5>
              <Link to="/clinic-staff" style={styles.viewAllLink}>
                Manage Staff
              </Link>
            </Card.Header>
            <Card.Body>
              {staff.map((staffMember, index) => (
                <div 
                  key={staffMember.id}
                  className="d-flex align-items-center mb-3 pb-3"
                  style={{ borderBottom: index !== staff.length - 1 ? `1px solid ${theme.colors.background.light}` : 'none' }}
                >
                  <img 
                    src={staffMember.image}
                    alt={staffMember.name}
                    style={styles.staffImage}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0" style={{ color: theme.colors.primary.main }}>
                      {staffMember.name}
                    </h6>
                    <small className="d-block text-muted">
                      {staffMember.role} • {staffMember.specialty}
                    </small>
                    <small className="d-block">
                      {staffMember.appointmentsToday} appointments today
                    </small>
                  </div>
                  <Badge style={styles.statusBadge(staffMember.status)}>
                    {staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1)}
                  </Badge>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  variant="outline-primary"
                  style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                >
                  <PlusCircle size={16} className="me-2" /> Add Staff Member
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white" style={{ borderBottom: `1px solid ${theme.colors.background.light}` }}>
              <h5 style={styles.sectionTitle} className="mb-0">Inventory Alerts</h5>
            </Card.Header>
            <Card.Body>
              {inventoryAlerts.map((item) => (
                <div 
                  key={item.id}
                  className="d-flex justify-content-between align-items-center mb-3 pb-2"
                  style={{ borderBottom: item.id !== inventoryAlerts.length ? `1px solid ${theme.colors.background.light}` : 'none' }}
                >
                  <div>
                    <h6 className="mb-0">{item.item}</h6>
                    <small className="text-muted">
                      Stock: {item.currentStock} / {item.minRequired}
                    </small>
                  </div>
                  <div>
                    <Badge style={styles.statusBadge(item.status)} className="me-2">
                      {item.status === 'low' ? 'Low Stock' : 'In Stock'}
                    </Badge>
                    {item.status === 'low' && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center mt-3">
                <Button 
                  as={Link}
                  to="/inventory"
                  variant="outline-primary"
                  style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                >
                  View Inventory
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Analytics Section */}
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <Tabs 
                defaultActiveKey="revenue" 
                className="border-0"
              >
                <Tab 
                  eventKey="revenue" 
                  title="Revenue"
                  tabClassName="border-0"
                >
                  <div style={styles.chartContainer} className="mt-4">
                    <Chart type="line" data={revenueData} options={chartOptions} />
                  </div>
                </Tab>
                <Tab 
                  eventKey="services" 
                  title="Services"
                  tabClassName="border-0"
                >
                  <Row className="mt-4">
                    <Col md={7}>
                      <div style={styles.chartContainer}>
                        <Chart type="doughnut" data={serviceDistributionData} options={doughnutOptions} />
                      </div>
                    </Col>
                    <Col md={5} className="d-flex flex-column justify-content-center">
                      <h5 className="mb-3">Service Distribution</h5>
                      <p className="text-muted">
                        Regular checkups and vaccinations make up over 50% of all services performed at your clinic. 
                        Consider marketing your specialty services to increase revenue from surgeries and dental procedures.
                      </p>
                      <Button 
                        variant="outline-primary"
                        className="mt-3 align-self-start"
                        style={{ borderColor: theme.colors.primary.main, color: theme.colors.primary.main }}
                      >
                        <BarChartFill className="me-2" /> View Detailed Reports
                      </Button>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Header>
          </Card>
        </Col>
      </Row>
      
      {/* Install Now Card */}
      <Row>
        <Col md={12}>
          <Card className="border-0 shadow-sm text-center p-4">
            <Card.Body className="d-flex flex-column align-items-center">
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
              <h4 style={{ color: theme.colors.primary.dark, fontWeight: '600', marginBottom: '10px' }}>Desktop Application Available</h4>
              <p className="text-muted mb-4 w-75">
                For faster access to your clinic management dashboard and additional offline features, install our desktop application. 
                Manage your clinic operations seamlessly even with unstable internet connections.
              </p>
              <Button 
                style={styles.installButton}
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
            <Card.Title>Specialist Referrals</Card.Title>
            <Card.Text>
              Manage referrals to mobile veterinary specialists.
            </Card.Text>
            <Button 
              variant="primary" 
              as={Link} 
              to="/dashboard/clinic/service-requests"
            >
              Manage Referrals
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </div>
  );
};

export default ClinicDashboard; 