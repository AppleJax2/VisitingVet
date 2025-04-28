import React from 'react';
import { format } from 'date-fns';
import '../../styles/MessageItem.css'; // Add styling

function MessageItem({ message, isOwnMessage }) {
    const { sender, content, timestamp } = message;

    const formatTimestamp = (ts) => {
        if (!ts) return '';
        try {
            // Example format: 3:45 PM
            return format(new Date(ts), 'p'); 
        } catch (e) {
            console.error("Error formatting timestamp:", e);
            return 'Invalid time';
        }
    };

    return (
        <div className={`message-item-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}>
             {/* Optionally show avatar for other user's messages */}
             {/* {!isOwnMessage && (
                 <img 
                     src={sender?.profileImage || '/path/to/default-avatar.png'} 
                     alt={`${sender?.name}'s avatar`} 
                     className="message-avatar"
                 />
             )} */} 
            <div className="message-item">
                <div className="message-content">
                    {content}
                </div>
                <div className="message-timestamp">
                    {formatTimestamp(timestamp)}
                </div>
                 {/* TODO: Add read status indicator if needed */} 
            </div>
        </div>
    );
}

export default MessageItem; 