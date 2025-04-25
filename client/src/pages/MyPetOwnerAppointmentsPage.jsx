import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { getMyPetOwnerAppointments } from '../services/api';

const statusVariants = {
  Requested: 'warning',
  Confirmed: 'success',
  Cancelled: 'danger',
  Completed: 'info'
};

const formatDate = (dateString) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const MyPetOwnerAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await getMyPetOwnerAppointments();
        setAppointments(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load your appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Group appointments by status
  const appointmentsByStatus = {
    upcoming: appointments.filter(app => ['Requested', 'Confirmed'].includes(app.status)),
    past: appointments.filter(app => ['Cancelled', 'Completed'].includes(app.status))
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>My Appointments</h1>
          <p className="text-muted">View and manage your veterinary appointments</p>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your appointments...</p>
        </div>
      ) : (
        <>
          {appointments.length === 0 ? (
            <Card className="mb-4">
              <Card.Body className="text-center py-5">
                <h4>No appointments found</h4>
                <p className="text-muted">
                  You haven't requested any appointments yet. 
                  Browse our providers to schedule your first appointment.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Header>
                  <h4 className="mb-0">Upcoming Appointments</h4>
                </Card.Header>
                <Card.Body>
                  {appointmentsByStatus.upcoming.length === 0 ? (
                    <p className="text-center text-muted py-3">No upcoming appointments</p>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsByStatus.upcoming.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              {appointment.providerProfile?.user?.email || 'Unknown Provider'}
                            </td>
                            <td>{appointment.service?.name || 'Unknown Service'}</td>
                            <td>{formatDate(appointment.appointmentTime)}</td>
                            <td>
                              <Badge bg={statusVariants[appointment.status] || 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header>
                  <h4 className="mb-0">Past Appointments</h4>
                </Card.Header>
                <Card.Body>
                  {appointmentsByStatus.past.length === 0 ? (
                    <p className="text-center text-muted py-3">No past appointments</p>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsByStatus.past.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              {appointment.providerProfile?.user?.email || 'Unknown Provider'}
                            </td>
                            <td>{appointment.service?.name || 'Unknown Service'}</td>
                            <td>{formatDate(appointment.appointmentTime)}</td>
                            <td>
                              <Badge bg={statusVariants[appointment.status] || 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default MyPetOwnerAppointmentsPage; 