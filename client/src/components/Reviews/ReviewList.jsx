import React from 'react';
import { Card, Alert, Image } from 'react-bootstrap';
import StarRatingDisplay from './StarRatingDisplay'; // Static display version of stars
import { formatDistanceToNow } from 'date-fns';

function ReviewList({ reviews, isLoading, error }) {

    const formatDateAgo = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Invalid Date';
        }
    };

    if (isLoading) {
        return <p>Loading reviews...</p>;
    }

    if (error) {
        return <Alert variant="warning">Could not load reviews: {error}</Alert>;
    }

    if (!reviews || reviews.length === 0) {
        return <p>No reviews yet for this provider.</p>;
    }

    return (
        <div className="review-list">
            {reviews.map(review => (
                <Card key={review._id} className="mb-3 review-card">
                    <Card.Body>
                        <div className="d-flex align-items-center mb-2">
                            <Image 
                                src={review.reviewer?.profileImage || '/assets/default-profile.png'} 
                                roundedCircle 
                                width={40} 
                                height={40} 
                                className="me-2"
                            />
                            <div>
                                <strong className="reviewer-name">{review.reviewer?.name || 'Anonymous'}</strong>
                                <div className="review-date text-muted small">{formatDateAgo(review.createdAt)}</div>
                            </div>
                        </div>
                        <StarRatingDisplay rating={review.rating} />
                        <Card.Text className="mt-2 review-comment">
                            {review.comment}
                        </Card.Text>
                        {review.providerResponse?.comment && (
                             <Card className="mt-3 provider-response bg-light">
                                 <Card.Body>
                                     <Card.Subtitle className="mb-2 text-muted">Provider's Response ({formatDateAgo(review.providerResponse.responseDate)}):</Card.Subtitle>
                                     <Card.Text>{review.providerResponse.comment}</Card.Text>
                                 </Card.Body>
                             </Card>
                        )}
                    </Card.Body>
                </Card>
            ))}

            <style jsx>{`
                .review-card {
                    border: 1px solid #eee;
                }
                .reviewer-name {
                    font-size: 1rem;
                }
                .review-date {
                    font-size: 0.85rem;
                }
                .review-comment {
                    white-space: pre-wrap; /* Preserve line breaks */
                    font-size: 0.95rem;
                }
                .provider-response {
                     border-left: 3px solid #0d6efd; /* Bootstrap primary blue */
                     font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
}

export default ReviewList; 