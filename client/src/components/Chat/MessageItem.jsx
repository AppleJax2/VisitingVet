import React from 'react';
import { format } from 'date-fns';
import '../../styles/MessageItem.css'; // Add styling

function MessageItem({ message, isOwnMessage }) {
    const { sender, content, timestamp } = message;

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            // Can use libraries like date-fns for more robust formatting
            return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        } catch (e) {
            return 'Invalid Date';
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
                <div className="message-status">
                    {/* TODO: Add read status indicator if needed */}
                </div>
            </div>
        </div>
    );
}

export default MessageItem; 