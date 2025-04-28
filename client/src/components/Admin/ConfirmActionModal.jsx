import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Spinner } from 'react-bootstrap';

function ConfirmActionModal({
  show,
  onHide,
  onConfirm,
  title,
  body,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
  isConfirming = false,
  cancelButtonText = 'Cancel',
}) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton={!isConfirming}> {/* Prevent closing while confirming */} 
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {body}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isConfirming}>
          {cancelButtonText}
        </Button>
        <Button 
          variant={confirmButtonVariant} 
          onClick={onConfirm} 
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Processing...
            </>
          ) : (
            confirmButtonText
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.node.isRequired,
  confirmButtonText: PropTypes.string,
  confirmButtonVariant: PropTypes.string,
  isConfirming: PropTypes.bool,
  cancelButtonText: PropTypes.string,
};

export default ConfirmActionModal; 