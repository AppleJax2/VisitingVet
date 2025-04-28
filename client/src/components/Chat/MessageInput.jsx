import React, { useState } from 'react';
import '../../styles/MessageInput.css'; // Add styling

function MessageInput({ onSendMessage, disabled }) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage(''); // Clear input after sending
        }
    };

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        // TODO: Add typing indicator emission here if implementing
        // socket.emit('typing', { conversationId });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Prevent default newline on Enter (unless Shift is pressed)
            e.preventDefault();
            handleSubmit(e); 
        }
    };

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <textarea
                className="message-input-textarea"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? "Connecting..." : "Type a message..."}
                disabled={disabled}
                rows="1" // Start with one row, expands automatically with CSS
            />
            <button 
                type="submit" 
                className="message-send-button"
                disabled={disabled || !message.trim()}
            >
                 {/* Use an icon here preferably */} 
                Send
            </button>
        </form>
    );
}

export default MessageInput; 