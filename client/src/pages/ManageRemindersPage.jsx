import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Badge, Form } from 'react-bootstrap';
import { PlusCircle, PencilSquare, Trash, CheckCircle, CheckCircleFill, Clock } from 'react-bootstrap-icons';
import { fetchUserReminders, updateReminder, deleteReminder } from '../services/api';
import { format } from 'date-fns';
import theme from '../utils/theme';
import ReminderEditModal from '../components/ReminderEditModal'; // Import the modal

function ManageRemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [filter, setFilter] = useState('incomplete'); // 'all', 'incomplete', 'complete'
  const navigate = useNavigate();

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  useEffect(() => {
    loadReminders();
  }, [filter]);

  const loadReminders = async () => {
    setLoading(true);
    setError('');
    setActionError(''); // Clear action errors on reload
    setActionSuccess('');
    try {
      const filters = {};
      if (filter === 'complete') filters.isComplete = true;
      if (filter === 'incomplete') filters.isComplete = false;
      
      const response = await fetchUserReminders(filters);
      if (response.success) {
        setReminders(response.reminders || []);
      } else {
        setError(response.error || 'Failed to load reminders.');
      }
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError(err.message || 'An error occurred while fetching reminders.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminderId, reminderTitle) => {
    if (!window.confirm(`Are you sure you want to delete the reminder "${reminderTitle}"?`)) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      const response = await deleteReminder(reminderId);
      if (response.success) {
        setReminders(reminders.filter(r => r._id !== reminderId));
        setActionSuccess(`Successfully deleted reminder: ${reminderTitle}.`);
      } else {
        setActionError(response.error || 'Failed to delete reminder.');
      }
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setActionError(err.message || 'An error occurred during deletion.');
    }
  };

  const handleToggleComplete = async (reminder) => {
    setActionError('');
    setActionSuccess('');
    const updatedStatus = !reminder.isComplete;
    try {
      const response = await updateReminder(reminder._id, { isComplete: updatedStatus });
      if (response.success) {
        // Update local state immediately or reload based on filter
        if (filter === 'all') {
             setReminders(reminders.map(r => r._id === reminder._id ? response.reminder : r));
        } else {
            // If filtering, remove the item from the current view
             setReminders(reminders.filter(r => r._id !== reminder._id));
        }
        setActionSuccess(`Reminder "${reminder.title}" marked as ${updatedStatus ? 'complete' : 'incomplete'}.`);
      } else {
        setActionError(response.error || 'Failed to update reminder status.');
      }
    } catch (err) {
      console.error('Error updating reminder status:', err);
      setActionError(err.message || 'An error occurred while updating status.');
    }
  };
  
  // Handlers for Edit Modal
  const handleShowEditModal = (reminder) => {
      setSelectedReminder(reminder);
      setShowEditModal(true);
  };
  const handleHideEditModal = () => {
      setSelectedReminder(null);
      setShowEditModal(false);
  };
  const handleReminderUpdate = (updatedReminder) => {
      // Update the reminder in the list
      setReminders(reminders.map(r => r._id === updatedReminder._id ? updatedReminder : r));
      // Close modal is handled by the modal itself on success
      setActionSuccess(`Reminder "${updatedReminder.title}" updated successfully.`);
  };

  const getPriorityBadge = (priority) => {
      let variant = 'secondary';
      switch(priority) {
          case 'high': variant = 'danger'; break;
          case 'medium': variant = 'warning'; break;
          case 'low': variant = 'success'; break;
      }
      return <Badge bg={variant}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  }

  const styles = {
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    pageTitle: {
      color: theme.colors.primary.dark,
    },
    reminderCard: {
      border: 'none',
      borderRadius: theme.borderRadius.md,
      marginBottom: '15px',
      boxShadow: theme.shadows.sm,
      transition: 'box-shadow 0.2s ease-in-out',
      '&:hover': {
          boxShadow: theme.shadows.md,
      }
    },
    cardHeader: {
        backgroundColor: theme.colors.background.white,
        borderBottom: `1px solid ${theme.colors.background.medium}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderTitle: {
        fontWeight: '600',
        color: theme.colors.primary.dark,
        textDecoration: 'none',
    },
    reminderMeta: {
        fontSize: '0.9em',
        color: theme.colors.text.secondary,
    },
    actionButton: {
        marginLeft: '8px',
    },
    filterGroup: {
        marginBottom: '20px',
    }
  };

  return (
    <Container className="py-5">
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Manage Reminders</h1>
        <Button variant="primary" onClick={() => navigate('/add-reminder')} style={{backgroundColor: theme.colors.primary.main}}>
          <PlusCircle className="me-2" /> Add New Reminder
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {actionError && <Alert variant="danger" dismissible onClose={() => setActionError('')}>{actionError}</Alert>}
      {actionSuccess && <Alert variant="success" dismissible onClose={() => setActionSuccess('')}>{actionSuccess}</Alert>}

      <Form.Group style={styles.filterGroup} className="d-flex justify-content-end">
        <Form.Label className="me-2 pt-1">Show:</Form.Label>
        <Form.Select size="sm" value={filter} onChange={(e) => setFilter(e.target.value)} style={{width: '150px'}}>
            <option value="incomplete">Incomplete</option>
            <option value="complete">Complete</option>
            <option value="all">All</option>
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center"><Spinner animation="border" style={{color: theme.colors.primary.main}} /></div>
      ) : reminders.length === 0 ? (
          <Card body className="text-center text-muted">
              No reminders found matching the filter '{filter}'.
          </Card>
      ) : (
        reminders.map((reminder) => (
            <Card key={reminder._id} style={{...styles.reminderCard, opacity: reminder.isComplete ? 0.7 : 1}} className="mb-3">
                <Card.Header style={styles.cardHeader}>
                    <div className="d-flex align-items-center">
                         <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => handleToggleComplete(reminder)} 
                            title={reminder.isComplete ? 'Mark as Incomplete' : 'Mark as Complete'}
                            className="p-0 me-2"
                         >
                           {reminder.isComplete ? <CheckCircleFill size={20} color={theme.colors.success} /> : <CheckCircle size={20} color={theme.colors.text.light} />}
                        </Button>
                        <span 
                            style={{...styles.reminderTitle, textDecoration: reminder.isComplete ? 'line-through' : 'none'}}
                        >
                            {reminder.title}
                        </span>
                    </div>
                    <div>
                        {getPriorityBadge(reminder.priority)}
                    </div>
                </Card.Header>
                <Card.Body>
                    {reminder.description && <p style={{textDecoration: reminder.isComplete ? 'line-through' : 'none'}}>{reminder.description}</p>}
                    <div style={styles.reminderMeta}>
                        <span><Clock size={14} className="me-1"/> Due: {format(new Date(reminder.dueDate), 'PPP')}</span>
                        {reminder.pet && <span className="ms-3"> | Pet: {reminder.pet.name}</span>}
                    </div>
                </Card.Body>
                <Card.Footer className="bg-white text-end">
                    <Button variant="outline-secondary" size="sm" style={styles.actionButton} onClick={() => handleShowEditModal(reminder)} title="Edit Reminder"><PencilSquare /></Button>
                    <Button variant="outline-danger" size="sm" style={styles.actionButton} onClick={() => handleDelete(reminder._id, reminder.title)} title="Delete Reminder"><Trash /></Button>
                </Card.Footer>
            </Card>
        ))
      )}

      {/* Render Edit Modal */}
      {selectedReminder && (
        <ReminderEditModal 
          show={showEditModal} 
          onHide={handleHideEditModal} 
          reminder={selectedReminder} 
          onUpdate={handleReminderUpdate}
        />
      )}
    </Container>
  );
}

export default ManageRemindersPage; 