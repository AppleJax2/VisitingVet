import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa'; // Using react-icons

function StarRating({ rating, onRatingChange, size = 24, color = "#ffc107" }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div style={{ display: 'inline-block', cursor: 'pointer' }}>
            {stars.map((starValue) => (
                <span 
                    key={starValue} 
                    onClick={() => onRatingChange(starValue)} 
                    style={{ marginRight: '5px' }}
                    title={`${starValue} star${starValue > 1 ? 's' : ''}`}
                >
                    {rating >= starValue ? (
                        <FaStar size={size} color={color} />
                    ) : (
                        <FaRegStar size={size} color={color} />
                    )}
                </span>
            ))}
        </div>
    );
}

export default StarRating; 