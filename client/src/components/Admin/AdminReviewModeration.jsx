import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; // Adjust path
import { Table, Spinner, Alert, Button, Form, Modal, Card } from 'react-bootstrap';
import { format } from 'date-fns';
import StarRatingDisplay from '../../Reviews/StarRatingDisplay'; // Adjust path
import { toast } from 'react-toastify';

function AdminReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [moderationAction, setModerationAction] = useState(null); // 'Approve' or 'Reject'
    const [moderatorNotes, setModeratorNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPendingReviews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/reviews/pending');
            if (data.success) {
                setReviews(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch pending reviews');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error fetching pending reviews';
            console.error("Fetch Pending Reviews Error:", err);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingReviews();
    }, [fetchPendingReviews]);

    const handleModalOpen = (review, action) => {
        setSelectedReview(review);
        setModerationAction(action);
        setModeratorNotes(''); // Reset notes
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedReview(null);
        setModerationAction(null);
    };

    const handleModerationSubmit = async () => {
        if (!selectedReview || !moderationAction) return;

        setIsSubmitting(true);
        try {
            const payload = { 
                status: moderationAction, // 'Approved' or 'Rejected'
                moderatorNotes: moderatorNotes
            };
            const { data } = await api.put(`/reviews/${selectedReview._id}/moderate`, payload);
            if (data.success) {
                toast.success(`Review ${moderationAction.toLowerCase()} successfully.`);
                handleModalClose();
                // Refresh the list
                fetchPendingReviews(); 
            } else {
                throw new Error(data.message || 'Failed to moderate review');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error moderating review';
            console.error("Moderate Review Error:", err);
            toast.error(`Moderation Failed: ${message}`);
            // Keep modal open on error?
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPpp');
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="admin-review-moderation">
            <h2>Review Moderation Queue</h2>
            {isLoading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!isLoading && !error && (
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reviewer</th>
                            <th>Provider</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Appointment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center">No reviews pending moderation.</td>
                            </tr>
                        ) : (
                            reviews.map(review => (
                                <tr key={review._id}>
                                    <td>{formatDate(review.createdAt)}</td>
                                    <td>{review.reviewer?.name}<br/><small>{review.reviewer?.email}</small></td>
                                    <td>{review.providerProfile?.businessName || review.providerProfile?.user?.name}<br/><small>{review.providerProfile?.user?.email}</small></td>
                                    <td><StarRatingDisplay rating={review.rating} /></td>
                                    <td>{review.comment}</td>
                                    <td>
                                        <small>Service: {review.appointment?.serviceId?.name}</small><br/>
                                        <small>Date: {formatDate(review.appointment?.appointmentTime)}</small>
                                        {/* Link to appointment details? */}
                                    </td>
                                    <td>
                                        <Button variant="success" size="sm" className="me-1 mb-1" onClick={() => handleModalOpen(review, 'Approved')}>
                                            Approve
                                        </Button>
                                        <Button variant="danger" size="sm" className="mb-1" onClick={() => handleModalOpen(review, 'Rejected')}>
                                            Reject
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            {/* Moderation Confirmation Modal */}
            <Modal show={showModal} onHide={handleModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{moderationAction} Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <>
                            <p>Are you sure you want to <strong>{moderationAction?.toLowerCase()}</strong> the following review?</p>
                            <Card className="mb-3">
                                <Card.Body>
                                    <p><strong>Reviewer:</strong> {selectedReview.reviewer?.name}</p>
                                    <p><strong>Provider:</strong> {selectedReview.providerProfile?.businessName || selectedReview.providerProfile?.user?.name}</p>
                                    <p><strong>Rating:</strong> <StarRatingDisplay rating={selectedReview.rating} /></p>
                                    <p><strong>Comment:</strong> {selectedReview.comment}</p>
                                </Card.Body>
                            </Card>
                             <Form.Group className="mb-3" controlId="moderatorNotes">
                                <Form.Label>Moderator Notes (Optional):</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={moderatorNotes}
                                    onChange={(e) => setModeratorNotes(e.target.value)}
                                    placeholder={`Reason for ${moderationAction?.toLowerCase()}ing...`}
                                />
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        variant={moderationAction === 'Approved' ? 'success' : 'danger'} 
                        onClick={handleModerationSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <><Spinner size="sm" /> Confirming...</> : `Confirm ${moderationAction}`}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminReviewModeration; 