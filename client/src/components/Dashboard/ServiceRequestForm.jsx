import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  FormLabel,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
  '4:00 PM', '5:00 PM', '6:00 PM'
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Routine care, can wait weeks' },
  { value: 'medium', label: 'Medium - Should be seen within a week' },
  { value: 'high', label: 'High - Should be seen within days' },
  { value: 'emergency', label: 'Emergency - Requires immediate attention' }
];

const ServiceRequestForm = ({ onSuccess }) => {
  const { user } = useAuth();
  
  // Form state
  const [petOwnerId, setPetOwnerId] = useState('');
  const [petId, setPetId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [requestedServices, setRequestedServices] = useState([]);
  const [preferredDates, setPreferredDates] = useState([{ date: null, timeSlot: '' }]);
  
  // UI state
  const [petOwners, setPetOwners] = useState([]);
  const [pets, setPets] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Load pet owners, providers, and services on component mount
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        
        // Fetch pet owners
        const petOwnersResponse = await axios.get('/api/admin/users', { 
          params: { role: 'pet_owner' } 
        });
        setPetOwners(petOwnersResponse.data.data || []);
        
        // Fetch providers
        const providersResponse = await axios.get('/api/admin/users', { 
          params: { role: 'provider', verified: true } 
        });
        setProviders(providersResponse.data.data || []);
        
      } catch (error) {
        console.error('Error fetching form data:', error);
        setNotification({
          open: true,
          message: 'Failed to load form data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, []);

  // Load pets when pet owner changes
  useEffect(() => {
    const fetchPets = async () => {
      if (!petOwnerId) {
        setPets([]);
        setPetId('');
        return;
      }
      
      try {
        const response = await axios.get(`/api/pets/owner/${petOwnerId}`);
        setPets(response.data.data || []);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setPets([]);
      }
    };
    
    fetchPets();
  }, [petOwnerId]);

  // Load services when provider changes
  useEffect(() => {
    const fetchServices = async () => {
      if (!providerId) {
        setServices([]);
        setRequestedServices([]);
        return;
      }
      
      try {
        const response = await axios.get(`/api/profiles/visiting-vet/services`, {
          params: { providerId }
        });
        setServices(response.data.data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      }
    };
    
    fetchServices();
  }, [providerId]);

  const handleAddDate = () => {
    setPreferredDates([...preferredDates, { date: null, timeSlot: '' }]);
  };

  const handleRemoveDate = (index) => {
    const updated = [...preferredDates];
    updated.splice(index, 1);
    setPreferredDates(updated);
  };

  const handleDateChange = (index, date) => {
    const updated = [...preferredDates];
    updated[index].date = date;
    setPreferredDates(updated);
  };

  const handleTimeSlotChange = (index, timeSlot) => {
    const updated = [...preferredDates];
    updated[index].timeSlot = timeSlot;
    setPreferredDates(updated);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!petOwnerId) newErrors.petOwnerId = 'Pet owner is required';
    if (!petId) newErrors.petId = 'Pet is required';
    if (!providerId) newErrors.providerId = 'Provider is required';
    if (!medicalNotes) newErrors.medicalNotes = 'Medical notes are required';
    if (requestedServices.length === 0) newErrors.requestedServices = 'At least one service is required';
    
    // Check if at least one preferred date is valid
    const hasValidDate = preferredDates.some(
      pd => pd.date && pd.timeSlot
    );
    
    if (!hasValidDate) newErrors.preferredDates = 'At least one valid preferred date and time is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      
      // Format data for API
      const requestData = {
        petOwnerId,
        petId,
        providerId,
        medicalNotes,
        urgency,
        requestedServices: requestedServices.map(service => ({
          service: service._id,
          notes: ''
        })),
        preferredDates: preferredDates
          .filter(pd => pd.date && pd.timeSlot)
          .map(pd => ({
            date: pd.date,
            timeSlot: pd.timeSlot
          }))
      };
      
      const response = await axios.post('/api/service-requests', requestData);
      
      setNotification({
        open: true,
        message: 'Service request created successfully',
        severity: 'success'
      });
      
      // Reset form
      setPetOwnerId('');
      setPetId('');
      setProviderId('');
      setMedicalNotes('');
      setUrgency('medium');
      setRequestedServices([]);
      setPreferredDates([{ date: null, timeSlot: '' }]);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      
    } catch (error) {
      console.error('Error creating service request:', error);
      setNotification({
        open: true,
        message: 'Failed to create service request',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New Service Request
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Use this form to request specialized veterinary services for a pet owner from a mobile veterinary specialist.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Pet Owner Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.petOwnerId}>
                <InputLabel>Pet Owner</InputLabel>
                <Select
                  value={petOwnerId}
                  onChange={(e) => setPetOwnerId(e.target.value)}
                  label="Pet Owner"
                >
                  <MenuItem value="" disabled>Select a pet owner</MenuItem>
                  {petOwners.map((owner) => (
                    <MenuItem key={owner._id} value={owner._id}>
                      {owner.name} ({owner.email})
                    </MenuItem>
                  ))}
                </Select>
                {errors.petOwnerId && <FormHelperText>{errors.petOwnerId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Pet Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.petId} disabled={!petOwnerId}>
                <InputLabel>Pet</InputLabel>
                <Select
                  value={petId}
                  onChange={(e) => setPetId(e.target.value)}
                  label="Pet"
                >
                  <MenuItem value="" disabled>Select a pet</MenuItem>
                  {pets.map((pet) => (
                    <MenuItem key={pet._id} value={pet._id}>
                      {pet.name} ({pet.species}, {pet.breed})
                    </MenuItem>
                  ))}
                </Select>
                {errors.petId && <FormHelperText>{errors.petId}</FormHelperText>}
                {petOwnerId && pets.length === 0 && (
                  <FormHelperText>No pets found for this owner</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Provider Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.providerId}>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  label="Provider"
                >
                  <MenuItem value="" disabled>Select a provider</MenuItem>
                  {providers.map((provider) => (
                    <MenuItem key={provider._id} value={provider._id}>
                      {provider.name} ({provider.email})
                    </MenuItem>
                  ))}
                </Select>
                {errors.providerId && <FormHelperText>{errors.providerId}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Urgency Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  label="Urgency"
                >
                  {URGENCY_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Requested Services */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.requestedServices} disabled={!providerId}>
                <FormLabel>Requested Services</FormLabel>
                <Autocomplete
                  multiple
                  id="requested-services"
                  options={services}
                  getOptionLabel={(option) => `${option.name} - $${option.price}`}
                  value={requestedServices}
                  onChange={(event, newValue) => {
                    setRequestedServices(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Select services"
                      error={!!errors.requestedServices}
                      helperText={errors.requestedServices}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={`${option.name} - $${option.price}`}
                        {...getTagProps({ index })}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                />
                {providerId && services.length === 0 && (
                  <FormHelperText>No services found for this provider</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Medical Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Notes"
                multiline
                rows={4}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                error={!!errors.medicalNotes}
                helperText={errors.medicalNotes}
              />
            </Grid>
            
            {/* Preferred Dates */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">Preferred Dates</Typography>
                <Typography variant="body2" color="textSecondary">
                  Suggest possible dates and times for the service
                </Typography>
                {errors.preferredDates && (
                  <Typography variant="body2" color="error">
                    {errors.preferredDates}
                  </Typography>
                )}
              </Box>
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {preferredDates.map((pd, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={5}>
                      <DatePicker
                        label="Date"
                        value={pd.date}
                        onChange={(date) => handleDateChange(index, date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth>
                        <InputLabel>Time Slot</InputLabel>
                        <Select
                          value={pd.timeSlot}
                          onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                          label="Time Slot"
                        >
                          <MenuItem value="" disabled>Select a time</MenuItem>
                          {TIME_SLOTS.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                              {slot}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box display="flex" height="100%" alignItems="center">
                        <Button
                          color="error"
                          onClick={() => handleRemoveDate(index)}
                          disabled={preferredDates.length <= 1}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                ))}
              </LocalizationProvider>
              
              <Button 
                variant="outlined" 
                onClick={handleAddDate}
                sx={{ mt: 1 }}
              >
                Add Another Date
              </Button>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                sx={{ mt: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Create Service Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        
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
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm; 