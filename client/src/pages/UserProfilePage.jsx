import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { checkAuthStatus, updateUserDetails, changePassword } from '../services/api'; // Assuming these API functions exist
import theme from '../utils/theme';

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    carrier: '',
    smsNotificationsEnabled: false,
    emailNotificationsEnabled: true
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await checkAuthStatus();
        if (data && data.success) {
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phoneNumber: data.user.phoneNumber || '',
            carrier: data.user.carrier || '',
            smsNotificationsEnabled: data.user.smsNotificationsEnabled || false,
            emailNotificationsEnabled: data.user.emailNotificationsEnabled !== undefined ? data.user.emailNotificationsEnabled : true
          });
        } else {
          setError('Failed to load user data. Please log in again.');
          // Optionally navigate to login
        }
      } catch (err) {
        setError('An error occurred while loading your profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    setSuccess('');
    try {
      // Only send fields that should be updatable
      const updateData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        carrier: formData.carrier,
        smsNotificationsEnabled: formData.smsNotificationsEnabled,
        emailNotificationsEnabled: formData.emailNotificationsEnabled,
      };
      const response = await updateUserDetails(updateData); // Use your actual update API function
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
        setUser(response.user); // Update user state with potentially new data
      } else {
        setError(response?.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while saving your profile.');
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (!passwordData.currentPassword || !passwordData.newPassword) {
        setPasswordError('Please fill in all password fields.');
        return;
    }

    setSavingPassword(true);
    try {
      const response = await changePassword({ 
          currentPassword: passwordData.currentPassword, 
          newPassword: passwordData.newPassword 
      }); // Use your actual change password API function
      if (response && response.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear fields
      } else {
        setPasswordError(response?.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'An error occurred while changing the password.');
      console.error(err);
    } finally {
      setSavingPassword(false);
    }
  };

  const styles = {
    cardHeader: {
      backgroundColor: theme.colors.primary.light + '50', // Lighter primary
      color: theme.colors.primary.dark,
      borderBottom: `1px solid ${theme.colors.background.medium}`,
      fontWeight: '600',
    },
    card: {
      border: 'none',
      boxShadow: theme.shadows.sm,
      marginBottom: '2rem',
    },
     saveButton: {
        backgroundColor: theme.colors.primary.main,
        borderColor: theme.colors.primary.main,
        minWidth: '100px'
    },
    changePasswordButton: {
        backgroundColor: theme.colors.secondary.main,
        borderColor: theme.colors.secondary.main,
        minWidth: '150px'
    }
  };

  if (loading) {
    return <Container className="text-center py-5"><Spinner animation="border" style={{ color: theme.colors.primary.main }} /></Container>;
  }

  if (error && !user) {
    // Show significant error if user data failed to load entirely
    return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="py-4">
      <h2 style={{ color: theme.colors.primary.dark, marginBottom: '2rem' }}>Settings & Profile</h2>
      
      {/* General Error/Success Messages */} 
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Profile Information Card */}
      <Card style={styles.card}>
        <Card.Header style={styles.cardHeader}>My Information</Card.Header>
        <Card.Body>
          <Form onSubmit={handleProfileSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="profileName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="profileEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly // Typically email is not editable or requires verification
                    disabled 
                  />
                  <Form.Text muted>Email cannot be changed.</Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
               <Col md={6}>
                <Form.Group className="mb-3" controlId="profilePhone">
                  <Form.Label>Phone Number (for SMS)</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleProfileChange}
                    placeholder="(e.g., +15551234567)"
                  />
                </Form.Group>
              </Col>
               <Col md={6}>
                 <Form.Group className="mb-3" controlId="profileCarrier">
                    <Form.Label>Mobile Carrier (for SMS)</Form.Label>
                    <Form.Select 
                      name="carrier" 
                      value={formData.carrier} 
                      onChange={handleProfileChange}
                    >
                      <option value="">Select Carrier (Optional)</option>
                      {/* Common US Carriers - Add more as needed */}
                      <option value="att">AT&T</option>
                      <option value="verizon">Verizon</option>
                      <option value="tmobile">T-Mobile</option>
                      <option value="sprint">Sprint</option>
                      <option value="uscellular">US Cellular</option>
                      <option value="boost">Boost Mobile</option>
                      <option value="cricket">Cricket Wireless</option>
                      <option value="metropcs">MetroPCS</option>
                      {/* Add international carriers if applicable */}
                    </Form.Select>
                  </Form.Group>
                </Col>
            </Row>
            <Row>
              <Col md={12}>
                 <h5 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: theme.colors.text.secondary }}>Notification Preferences</h5>
                 <Form.Group className="mb-3" controlId="emailNotificationsEnabled">
                    <Form.Check 
                        type="switch"
                        id="email-notifications-switch"
                        label="Enable Email Notifications"
                        name="emailNotificationsEnabled"
                        checked={formData.emailNotificationsEnabled}
                        onChange={handleProfileChange}
                    />
                 </Form.Group>
                 <Form.Group className="mb-3" controlId="smsNotificationsEnabled">
                    <Form.Check 
                        type="switch"
                        id="sms-notifications-switch"
                        label="Enable SMS Notifications (Requires Phone & Carrier)"
                        name="smsNotificationsEnabled"
                        checked={formData.smsNotificationsEnabled}
                        onChange={handleProfileChange}
                        disabled={!formData.phoneNumber || !formData.carrier}
                    />
                 </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={savingProfile} style={styles.saveButton}>
              {savingProfile ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Profile'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Change Password Card */}
      <Card style={styles.card}>
        <Card.Header style={styles.cardHeader}>Change Password</Card.Header>
        <Card.Body>
          {passwordError && <Alert variant="danger" onClose={() => setPasswordError('')} dismissible>{passwordError}</Alert>}
          {passwordSuccess && <Alert variant="success" onClose={() => setPasswordSuccess('')} dismissible>{passwordSuccess}</Alert>}
          <Form onSubmit={handlePasswordSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="confirmNewPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="secondary" type="submit" disabled={savingPassword} style={styles.changePasswordButton}>
              {savingPassword ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Change Password'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

    </Container>
  );
}

export default UserProfilePage; 