import React from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import '../../styles/ConversationListItem.css'; // Add styling

// Helper to get the other participant (assuming 1-on-1 for now)
// In a real app, you might get the current userId from context
// const getOtherParticipant = (conversation, currentUserId) => { 
//     return conversation.participants.find(p => p._id !== currentUserId);
// };

function ConversationListItem({ conversation, isSelected, onSelect }) {
    // Destructure needed info, provide defaults
    const { 
        _id,
        otherParticipant = { name: 'Unknown User', profileImage: '' }, // Use the pre-calculated otherParticipant
        lastMessage = { content: 'No messages yet', timestamp: conversation.updatedAt }, 
        unreadCount = 0,
        updatedAt // Fallback timestamp
    } = conversation;

    const lastActivityDate = lastMessage?.timestamp || updatedAt;

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'Invalid date';
        }
    };

    const getLastMessagePreview = () => {
        if (!lastMessage || !lastMessage.sender) return lastMessage.content || 'No messages yet';
        // If sender info is available, prepend "You: " if current user sent it
        // This requires knowing the current user's ID
        // const senderName = lastMessage.sender._id === currentUserId ? 'You' : lastMessage.sender.name;
        // return `${senderName}: ${lastMessage.content}`;
        // Simplified version without currentUserId:
        return lastMessage.content;
    };

    return (
        <li 
            className={`conversation-list-item ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            <img 
                src={otherParticipant?.profileImage || '/path/to/default-avatar.png'} // Provide a default avatar path
                alt={`${otherParticipant?.name || 'User'}'s avatar`}
                className="conversation-avatar"
            />
            <div className="conversation-info">
                <div className="conversation-header">
                    <span className="conversation-name">{otherParticipant?.name}</span>
                    <span className="conversation-timestamp">{formatTimestamp(lastActivityDate)}</span>
                </div>
                <div className="conversation-preview">
                    <p className="last-message">{getLastMessagePreview()}</p>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
            </div>
        </li>
    );
}

export default ConversationListItem; 