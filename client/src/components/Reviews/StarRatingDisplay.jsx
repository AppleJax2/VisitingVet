import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

function StarRatingDisplay({ rating, size = 20, color = "#ffc107" }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
        <div style={{ display: 'inline-block' }} title={`Rating: ${rating?.toFixed(1)} out of 5`}>
            {[...Array(fullStars)].map((_, i) => (
                <FaStar key={`full-${i}`} size={size} color={color} style={{ marginRight: '2px' }} />
            ))}
            {halfStar === 1 && (
                <FaStarHalfAlt key="half" size={size} color={color} style={{ marginRight: '2px' }} />
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <FaRegStar key={`empty-${i}`} size={size} color={color} style={{ marginRight: '2px' }} />
            ))}
        </div>
    );
}

export default StarRatingDisplay; 