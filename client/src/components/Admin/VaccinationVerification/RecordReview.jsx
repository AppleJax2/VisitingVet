import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import DocumentViewer from '../DocumentViewer'; // Assuming DocumentViewer is in Admin folder
import { approveVerification, rejectVerification } from '../../../services/api'; // Assuming API functions exist
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const RecordReview = ({ record, onVerificationComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(false);

    if (!record) {
        return (
            <Card.Body className="text-center text-muted">
                <p>Select a record from the queue to review its details and attached documents.</p>
            </Card.Body>
        );
    }

    const handleAction = async (action) => {
        setError('');
        if (action === 'reject' && !rejectionReason.trim()) {
            setError('Rejection reason is required.');
            setShowRejectionInput(true); // Ensure input is visible
            return;
        }

        setIsLoading(true);
        try {
            let response;
            if (action === 'approve') {
                response = await approveVerification(record._id);
            } else {
                response = await rejectVerification(record._id, rejectionReason);
            }

            if (response.success) {
                toast.success(`Record ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
                onVerificationComplete(record._id, action === 'approve' ? 'Verified' : 'Rejected');
            } else {
                 throw new Error(response.message || `Failed to ${action} record.`);
            }
        } catch (err) {
            console.error(`Error during ${action}:`, err);
            setError(err.response?.data?.message || err.message || `An error occurred while ${action}ing the record.`);
            toast.error(`Action failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PP'); // e.g., Feb 27, 2024
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <Card.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            
            <h5>Record Details</h5>
            <p><strong>Pet:</strong> {record.pet?.name || 'N/A'}</p>
            <p><strong>Owner:</strong> {record.owner?.name || record.owner?.email || 'N/A'}</p>
            <p><strong>Vaccine Type:</strong> {record.vaccineType}</p>
            <p><strong>Administration Date:</strong> {formatDate(record.administrationDate)}</p>
            <p><strong>Expiration Date:</strong> {record.expirationDate ? formatDate(record.expirationDate) : 'None'}</p>
            <p><strong>Submitted At:</strong> {formatDate(record.createdAt)}</p>
            <hr />

            <h5>Attached Documents</h5>
            {record.documents && record.documents.length > 0 ? (
                record.documents.map((doc, index) => (
                    <div key={doc._id || index} className="mb-3">
                        <p><strong>Document {index + 1}:</strong> <a href={doc.url} target="_blank" rel="noopener noreferrer">View Document</a> ({doc.contentType})</p>
                         {/* Enhance DocumentViewer to accept URL and contentType */}
                        <DocumentViewer documentUrl={doc.url} contentType={doc.contentType} />
                        {/* Note: Annotations might not be desired/needed in this review context */}
                    </div>
                ))
            ) : (
                <p className="text-muted">No documents attached.</p>
            )}
            <hr />

            <h5>Actions</h5>
            {!showRejectionInput ? (
                <div className="d-flex gap-2">
                    <Button 
                        variant="success" 
                        onClick={() => handleAction('approve')} 
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm"/> : 'Approve'}
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => setShowRejectionInput(true)} 
                        disabled={isLoading}
                    >
                        Reject
                    </Button>
                </div>
            ) : (
                <Form onSubmit={(e) => { e.preventDefault(); handleAction('reject'); }}>
                    <Form.Group className="mb-2" controlId="rejectionReason">
                        <Form.Label>Reason for Rejection*</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                            isInvalid={!rejectionReason.trim() && error.includes('required')} // Show red border if submitted empty
                        />
                         <Form.Control.Feedback type="invalid">Reason is required.</Form.Control.Feedback>
                    </Form.Group>
                     <div className="d-flex gap-2">
                        <Button type="submit" variant="danger" disabled={isLoading}>
                            {isLoading ? <Spinner size="sm"/> : 'Confirm Reject'}
                        </Button>
                        <Button variant="secondary" onClick={() => { setShowRejectionInput(false); setError(''); }} disabled={isLoading}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            )}
        </Card.Body>
    );
};

RecordReview.propTypes = {
    record: PropTypes.object, // Can be null if nothing is selected
    onVerificationComplete: PropTypes.func.isRequired,
};

export default RecordReview; 