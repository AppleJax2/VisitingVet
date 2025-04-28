import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Pets as PetsIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  Attachment as AttachmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  SvgIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

// Status colors
const statusColors = {
  pending: 'warning',
  accepted: 'info',
  declined: 'error',
  scheduled: 'secondary',
  completed: 'success',
  cancelled: 'error'
};

// Urgency colors
const urgencyColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  emergency: 'error'
};

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Response state for provider
  const [providerResponseOpen, setProviderResponseOpen] = useState(false);
  const [responseStatus, setResponseStatus] = useState('accepted');
  const [responseMessage, setResponseMessage] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { date: null, timeSlot: '' }
  ]);
  
  // Response state for pet owner
  const [petOwnerResponseOpen, setPetOwnerResponseOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  // Update status dialog
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  
  // File upload
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  
  // Notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    const fetchServiceRequest = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/service-requests/${id}`);
        setServiceRequest(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching service request:', err);
        setError('Failed to load service request details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceRequest();
  }, [id]);
  
  // Handle provider response submission
  const handleProviderResponseSubmit = async () => {
    try {
      const filteredTimeSlots = availableTimeSlots.filter(
        slot => slot.date && slot.timeSlot
      );
      
      const response = await axios.put(`/api/service-requests/${id}/provider-response`, {
        status: responseStatus,
        message: responseMessage,
        availableTimeSlots: filteredTimeSlots
      });
      
      setServiceRequest(response.data.data);
      setProviderResponseOpen(false);
      setNotification({
        open: true,
        message: 'Response submitted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting provider response:', err);
      setNotification({
        open: true,
        message: 'Failed to submit response',
        severity: 'error'
      });
    }
  };
  
  // Handle pet owner response submission
  const handlePetOwnerResponseSubmit = async () => {
    try {
      const response = await axios.put(`/api/service-requests/${id}/pet-owner-response`, {
        status: 'selected',
        selectedTimeSlot
      });
      
      setServiceRequest(response.data.data);
      setPetOwnerResponseOpen(false);
      setNotification({
        open: true,
        message: 'Time slot selected successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error submitting pet owner response:', err);
      setNotification({
        open: true,
        message: 'Failed to select time slot',
        severity: 'error'
      });
    }
  };
  
  // Handle status update submission
  const handleStatusUpdateSubmit = async () => {
    try {
      const response = await axios.put(`/api/service-requests/${id}/status`, {
        status: newStatus,
        resultNotes: resultNotes
      });
      
      setServiceRequest(response.data.data);
      setStatusUpdateOpen(false);
      setNotification({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating status:', err);
      setNotification({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
    }
  };
  
  // Handle attachment submission
  const handleAttachmentSubmit = async () => {
    try {
      if (!attachmentName || !attachmentUrl) {
        setNotification({
          open: true,
          message: 'Attachment name and URL are required',
          severity: 'error'
        });
        return;
      }
      
      const response = await axios.post(`/api/service-requests/${id}/attachments`, {
        name: attachmentName,
        fileUrl: attachmentUrl
      });
      
      setServiceRequest(response.data.data);
      setAttachmentDialogOpen(false);
      setAttachmentName('');
      setAttachmentUrl('');
      setNotification({
        open: true,
        message: 'Attachment added successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error adding attachment:', err);
      setNotification({
        open: true,
        message: 'Failed to add attachment',
        severity: 'error'
      });
    }
  };
  
  // Provider response form handlers
  const handleAddTimeSlot = () => {
    setAvailableTimeSlots([...availableTimeSlots, { date: null, timeSlot: '' }]);
  };
  
  const handleRemoveTimeSlot = (index) => {
    if (availableTimeSlots.length > 1) {
      const updated = [...availableTimeSlots];
      updated.splice(index, 1);
      setAvailableTimeSlots(updated);
    }
  };
  
  const handleTimeSlotDateChange = (index, date) => {
    const updated = [...availableTimeSlots];
    updated[index].date = date;
    setAvailableTimeSlots(updated);
  };
  
  const handleTimeSlotTimeChange = (index, time) => {
    const updated = [...availableTimeSlots];
    updated[index].timeSlot = time;
    setAvailableTimeSlots(updated);
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (!serviceRequest) {
    return (
      <Box p={3}>
        <Typography>Service request not found</Typography>
      </Box>
    );
  }
  
  const isClinic = user.role === 'clinic';
  const isProvider = user.role === 'provider';
  const isPetOwner = user.role === 'pet_owner';
  
  // Check if this user is one of the parties involved
  const isInvolved = 
    (isClinic && serviceRequest.clinic?._id === user.id) ||
    (isProvider && serviceRequest.provider?._id === user.id) ||
    (isPetOwner && serviceRequest.petOwner?._id === user.id) ||
    user.role === 'admin';
  
  if (!isInvolved) {
    return (
      <Box p={3}>
        <Typography color="error">
          You are not authorized to view this service request
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" component="h1" gutterBottom>
                Service Request #{serviceRequest._id.substring(serviceRequest._id.length - 6)}
              </Typography>
              
              <Box display="flex" gap={1} mb={2}>
                <Chip 
                  label={`Status: ${serviceRequest.status.charAt(0).toUpperCase() + serviceRequest.status.slice(1)}`}
                  color={statusColors[serviceRequest.status] || 'default'}
                />
                <Chip 
                  label={`Urgency: ${serviceRequest.urgency.charAt(0).toUpperCase() + serviceRequest.urgency.slice(1)}`}
                  color={urgencyColors[serviceRequest.urgency] || 'default'}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} display="flex" justifyContent="flex-end" alignItems="flex-start">
              <Typography variant="body2" color="textSecondary">
                Created: {format(new Date(serviceRequest.createdAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Grid container spacing={3}>
        {/* Left column: Basic info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request Details
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clinic"
                    secondary={serviceRequest.clinic?.name || 'Unknown'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocalHospitalIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Provider"
                    secondary={serviceRequest.provider?.name || 'Unknown'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pet Owner"
                    secondary={serviceRequest.petOwner?.name || 'Unknown'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PetsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Pet"
                    secondary={`${serviceRequest.pet?.name} (${serviceRequest.pet?.species}, ${serviceRequest.pet?.breed})`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
          
          {/* Requested Services */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requested Services
              </Typography>
              
              <List>
                {serviceRequest.requestedServices?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <AttachMoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.service?.name || 'Unknown Service'}
                      secondary={`$${item.service?.price || 0}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* Preferred Dates */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preferred Dates
              </Typography>
              
              <List>
                {serviceRequest.preferredDates?.map((date, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={format(new Date(date.date), 'MMMM d, yyyy')}
                      secondary={date.timeSlot}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right column: Details and interactions */}
        <Grid item xs={12} md={8}>
          {/* Medical Notes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medical Notes
              </Typography>
              <Typography variant="body1" paragraph>
                {serviceRequest.medicalNotes}
              </Typography>
            </CardContent>
          </Card>
          
          {/* Provider Response */}
          {(serviceRequest.providerResponse || isProvider) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Provider Response
                </Typography>
                
                {serviceRequest.providerResponse?.status ? (
                  <Box>
                    <Chip 
                      label={`${serviceRequest.providerResponse.status.charAt(0).toUpperCase() + serviceRequest.providerResponse.status.slice(1)}`}
                      color={serviceRequest.providerResponse.status === 'accepted' ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    />
                    
                    {serviceRequest.providerResponse.message && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Message:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {serviceRequest.providerResponse.message}
                        </Typography>
                      </Box>
                    )}
                    
                    {serviceRequest.providerResponse.status === 'accepted' && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Available Time Slots:
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Time</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {serviceRequest.providerResponse.availableTimeSlots?.map((slot, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {format(new Date(slot.date), 'MMMM d, yyyy')}
                                  </TableCell>
                                  <TableCell>{slot.timeSlot}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                ) : isProvider && serviceRequest.status === 'pending' ? (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setProviderResponseOpen(true)}
                  >
                    Respond to Request
                  </Button>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No response from provider yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Pet Owner Response */}
          {(serviceRequest.petOwnerResponse?.status || 
            (isPetOwner && serviceRequest.status === 'accepted')) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pet Owner Response
                </Typography>
                
                {serviceRequest.petOwnerResponse?.status ? (
                  <Box>
                    <Chip 
                      label={`${serviceRequest.petOwnerResponse.status === 'selected' ? 'Time Slot Selected' : 'Declined'}`}
                      color={serviceRequest.petOwnerResponse.status === 'selected' ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    />
                    
                    {serviceRequest.petOwnerResponse.status === 'selected' && serviceRequest.petOwnerResponse.selectedTimeSlot && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Selected Time:
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <EventIcon color="primary" fontSize="small" />
                          <Typography>
                            {format(new Date(serviceRequest.petOwnerResponse.selectedTimeSlot.date), 'MMMM d, yyyy')}
                          </Typography>
                          <AccessTimeIcon color="primary" fontSize="small" sx={{ ml: 2 }} />
                          <Typography>
                            {serviceRequest.petOwnerResponse.selectedTimeSlot.timeSlot}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : isPetOwner && serviceRequest.status === 'accepted' ? (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setPetOwnerResponseOpen(true)}
                  >
                    Select Time Slot
                  </Button>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Waiting for pet owner to select a time slot
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Scheduled Appointment */}
          {serviceRequest.scheduledAppointment && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scheduled Appointment
                </Typography>
                
                <Box>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <CalendarTodayIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="subtitle1">
                        {format(new Date(serviceRequest.scheduledAppointment.date), 'MMMM d, yyyy')} at {serviceRequest.scheduledAppointment.timeSlot}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Appointment ID: {serviceRequest.scheduledAppointment._id.substring(serviceRequest.scheduledAppointment._id.length - 6)}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Button 
                        variant="outlined"
                        onClick={() => navigate(`/dashboard/${user.role === 'pet_owner' ? 'pet-owner' : user.role}/appointments/${serviceRequest.scheduledAppointment._id}`)}
                      >
                        View Appointment
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Result Notes (if completed) */}
          {serviceRequest.status === 'completed' && serviceRequest.resultNotes && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Result Notes
                </Typography>
                <Typography variant="body1">
                  {serviceRequest.resultNotes}
                </Typography>
              </CardContent>
            </Card>
          )}
          
          {/* Attachments */}
          {serviceRequest.attachments && serviceRequest.attachments.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Attachments
                </Typography>
                
                <List>
                  {serviceRequest.attachments.map((attachment, index) => (
                    <ListItem key={index} 
                      button 
                      component="a" 
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ListItemIcon>
                        <AttachmentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={attachment.name}
                        secondary={attachment.uploadedBy?.name && `Uploaded by ${attachment.uploadedBy.name}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
          
          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <Box>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate(-1)}
                sx={{ mr: 2 }}
              >
                Back
              </Button>
            </Box>
            
            <Box display="flex" gap={2}>
              {/* Add attachment button - always available */}
              <Button 
                variant="outlined"
                startIcon={<AttachmentIcon />}
                onClick={() => setAttachmentDialogOpen(true)}
              >
                Add Attachment
              </Button>
              
              {/* Provider can respond if pending */}
              {isProvider && serviceRequest.status === 'pending' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setProviderResponseOpen(true)}
                >
                  Respond to Request
                </Button>
              )}
              
              {/* Pet owner can select time slot if accepted */}
              {isPetOwner && serviceRequest.status === 'accepted' && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setPetOwnerResponseOpen(true)}
                >
                  Select Time Slot
                </Button>
              )}
              
              {/* Status update button - available for certain statuses */}
              {['accepted', 'scheduled'].includes(serviceRequest.status) && (
                <Button 
                  variant="contained" 
                  color={serviceRequest.status === 'scheduled' ? 'success' : 'error'}
                  onClick={() => {
                    setNewStatus(serviceRequest.status === 'scheduled' ? 'completed' : 'cancelled');
                    setStatusUpdateOpen(true);
                  }}
                >
                  {serviceRequest.status === 'scheduled' ? 'Mark Completed' : 'Cancel Request'}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Provider Response Dialog */}
      <Dialog 
        open={providerResponseOpen} 
        onClose={() => setProviderResponseOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Respond to Service Request</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Response</InputLabel>
              <Select
                value={responseStatus}
                onChange={(e) => setResponseStatus(e.target.value)}
                label="Response"
              >
                <MenuItem value="accepted">Accept Request</MenuItem>
                <MenuItem value="declined">Decline Request</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={3}
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              sx={{ mb: 3 }}
            />
            
            {responseStatus === 'accepted' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Available Time Slots
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Provide time slots when you're available to perform the requested services
                </Typography>
                
                {availableTimeSlots.map((slot, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={5}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={slot.date ? format(new Date(slot.date), 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleTimeSlotDateChange(index, new Date(e.target.value))}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <FormControl fullWidth>
                        <InputLabel>Time</InputLabel>
                        <Select
                          value={slot.timeSlot}
                          onChange={(e) => handleTimeSlotTimeChange(index, e.target.value)}
                          label="Time"
                        >
                          <MenuItem value="" disabled>Select a time</MenuItem>
                          {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map(time => (
                            <MenuItem key={time} value={time}>{time}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <Box display="flex" alignItems="center" height="100%">
                        <Button
                          color="error"
                          onClick={() => handleRemoveTimeSlot(index)}
                          disabled={availableTimeSlots.length <= 1}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={handleAddTimeSlot}
                  sx={{ mb: 2 }}
                >
                  Add Time Slot
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProviderResponseOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleProviderResponseSubmit}
            variant="contained" 
            color="primary"
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Pet Owner Response Dialog */}
      <Dialog 
        open={petOwnerResponseOpen} 
        onClose={() => setPetOwnerResponseOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select a Time Slot</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Typography variant="body1" paragraph>
              The provider has accepted your service request. Please select one of the available time slots:
            </Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceRequest.providerResponse?.availableTimeSlots?.map((slot, index) => (
                    <TableRow key={index} selected={selectedTimeSlot?.date === slot.date && selectedTimeSlot?.timeSlot === slot.timeSlot}>
                      <TableCell>
                        {format(new Date(slot.date), 'MMMM d, yyyy')}
                      </TableCell>
                      <TableCell>{slot.timeSlot}</TableCell>
                      <TableCell>
                        <Button
                          variant={selectedTimeSlot?.date === slot.date && selectedTimeSlot?.timeSlot === slot.timeSlot ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {selectedTimeSlot?.date === slot.date && selectedTimeSlot?.timeSlot === slot.timeSlot ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPetOwnerResponseOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePetOwnerResponseSubmit}
            variant="contained" 
            color="primary"
            disabled={!selectedTimeSlot}
          >
            Confirm Selection
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog 
        open={statusUpdateOpen} 
        onClose={() => setStatusUpdateOpen(false)}
      >
        <DialogTitle>
          {newStatus === 'completed' ? 'Mark Request as Completed' : 'Cancel Request'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            {newStatus === 'completed' && (
              <TextField
                fullWidth
                label="Result Notes"
                multiline
                rows={4}
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
                sx={{ mt: 1 }}
              />
            )}
            
            {newStatus === 'cancelled' && (
              <Typography>
                Are you sure you want to cancel this service request? This action cannot be undone.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdateSubmit}
            variant="contained" 
            color={newStatus === 'completed' ? 'success' : 'error'}
          >
            {newStatus === 'completed' ? 'Mark Completed' : 'Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Attachment Dialog */}
      <Dialog 
        open={attachmentDialogOpen} 
        onClose={() => setAttachmentDialogOpen(false)}
      >
        <DialogTitle>Add Attachment</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              label="Attachment Name"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
            />
            
            <TextField
              fullWidth
              label="File URL"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              helperText="Enter a URL where the file is hosted"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttachmentDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAttachmentSubmit}
            variant="contained" 
            color="primary"
            disabled={!attachmentName || !attachmentUrl}
          >
            Add Attachment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceRequestDetail; 