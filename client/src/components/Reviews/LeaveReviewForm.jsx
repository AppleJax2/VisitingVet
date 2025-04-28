import React, { useState } from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import StarRating from './StarRating'; // Assuming a StarRating component exists
import api from '../../services/api';
import { toast } from 'react-toastify';

function LeaveReviewForm({ appointmentId, providerName, serviceName, onReviewSubmitted }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!comment.trim()) {
            setError('Please enter a comment for your review.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = { appointmentId, rating, comment };
            const { data } = await api.post('/reviews', payload);
            if (data.success) {
                toast.success('Review submitted successfully! It will be visible after moderation.');
                setRating(0);
                setComment('');
                if (onReviewSubmitted) {
                    onReviewSubmitted(data.data); // Pass back the new review data if needed
                }
            } else {
                throw new Error(data.message || 'Failed to submit review');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error submitting review';
            console.error("Submit Review Error:", err);
            setError(message);
            toast.error(`Review Submission Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="leave-review-form">
            <Card.Header>Leave a Review</Card.Header>
            <Card.Body>
                <p>How was your experience with <strong>{providerName || 'the provider'}</strong> for the <strong>{serviceName || 'service'}</strong>?</p>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group as={Row} className="mb-3" controlId="reviewRating">
                        <Form.Label column sm={3}>Your Rating:</Form.Label>
                        <Col sm={9}>
                            <StarRating rating={rating} onRatingChange={setRating} />
                        </Col>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="reviewComment">
                        <Form.Label>Your Comments:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share details of your experience..."
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...</> : 'Submit Review'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default LeaveReviewForm; 