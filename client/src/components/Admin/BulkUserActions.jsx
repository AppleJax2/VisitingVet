import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Modal, Form, Spinner, Alert, ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { BoxArrowUpRight, HandThumbsUpFill, ShieldLockFill, ShieldSlashFill } from 'react-bootstrap-icons';
import apiClient from '../../services/api';
import logger from '../../utils/logger';

function BulkUserActions({ selectedUserIds, onActionComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'ban', 'unban', 'verify'
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const handleShowModal = (type) => {
    setActionType(type);
    setReason(''); // Reset reason
    setError('');
    setResultMessage('');
    if (type === 'ban' || type === 'unban' || type === 'verify') {
        setShowModal(true);
    } else {
        logger.warn('Invalid bulk action type attempted:', type);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!actionType || selectedUserIds.length === 0) return;
    if (actionType === 'ban' && !reason.trim()) {
      setError('Reason is required for banning users.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultMessage('');

    try {
      const payload = { 
          action: actionType, 
          userIds: selectedUserIds,
          ...(actionType === 'ban' && { reason: reason.trim() }) // Only include reason for ban action
      };
      logger.info(`Performing bulk action: ${actionType} on ${selectedUserIds.length} users.`);
      const response = await apiClient.post('/admin/users/bulk-action', payload);
      
      logger.info('Bulk action response:', response.data);
      setResultMessage(response.data.message || 'Bulk action completed.');
      if (response.data.results?.errors?.length > 0) {
          setError(`Action completed with ${response.data.results.failureCount} failures. Check logs for details.`);
      }
      // Close modal after a short delay to show success/partial error
      setTimeout(() => {
          handleCloseModal();
          onActionComplete(); // Refresh list in parent component
      }, 2000);

    } catch (err) {
      logger.error(`Bulk action ${actionType} failed:`, err);
      const errMsg = err.response?.data?.error || err.message || 'An error occurred during the bulk action.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (actionType) {
      case 'ban': return `Ban ${selectedUserIds.length} User(s)`;
      case 'unban': return `Unban ${selectedUserIds.length} User(s)`;
      case 'verify': return `Verify ${selectedUserIds.length} User(s)`;
      default: return 'Confirm Bulk Action';
    }
  };
  
  const getConfirmButtonVariant = () => {
       switch (actionType) {
          case 'ban': return 'danger';
          case 'unban': return 'warning';
          case 'verify': return 'success';
          default: return 'primary';
      }
  }

  return (
    <>
      <Card className="mb-3 bg-light">
        <Card.Body className="d-flex justify-content-between align-items-center p-2">
          <span>
            <CheckSquareFill className="me-2" />
            <strong>{selectedUserIds.length}</strong> user(s) selected.
          </span>
          <DropdownButton
            as={ButtonGroup}
            title="Bulk Actions"
            id="bulk-actions-dropdown"
            variant="secondary"
            size="sm"
          >
            <Dropdown.Item onClick={() => handleShowModal('ban')}><ShieldSlashFill className="me-2 text-danger" />Ban Selected</Dropdown.Item>
            <Dropdown.Item onClick={() => handleShowModal('unban')}><ShieldLockFill className="me-2 text-warning" />Unban Selected</Dropdown.Item>
            <Dropdown.Item onClick={() => handleShowModal('verify')}><HandThumbsUpFill className="me-2 text-success" />Verify Selected</Dropdown.Item>
            {/* Add other actions like Assign Role later */}
          </DropdownButton>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {resultMessage && <Alert variant="info">{resultMessage}</Alert>}
          
          <p>Are you sure you want to perform the action '<strong>{actionType}</strong>' on the selected {selectedUserIds.length} user(s)?</p>
          
          {actionType === 'ban' && (
            <Form.Group controlId="bulkBanReason" className="mt-3">
              <Form.Label>Reason for Banning (Required)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Provide a clear reason for banning..."
              />
            </Form.Group>
          )}
          {actionType === 'unban' && <p className="text-muted">Users will be unbanned.</p>}
          {actionType === 'verify' && <p className="text-muted">Users will be marked as verified.</p>}
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant={getConfirmButtonVariant()} 
            onClick={handleConfirmAction} 
            disabled={isLoading || (actionType === 'ban' && !reason.trim())}
          >
            {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : `Confirm ${actionType}`}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

BulkUserActions.propTypes = {
  selectedUserIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onActionComplete: PropTypes.func.isRequired,
};

export default BulkUserActions; 