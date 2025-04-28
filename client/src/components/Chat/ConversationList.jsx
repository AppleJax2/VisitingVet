import React from 'react';
import { ListGroup, Badge, Image, Form } from 'react-bootstrap';
import { formatDistanceToNow } from 'date-fns';
import ConversationListItem from './ConversationListItem';
import '../../styles/ConversationList.css'; // Add styling

function ConversationList({ conversations, selectedConversationId, onSelectConversation, currentUser }) {

    const formatDateAgo = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Invalid Date';
        }
    };

    const getOtherParticipant = (convo) => {
        // Find the participant who is not the current user
        // Use the pre-populated otherParticipant if available from API
        if (convo.otherParticipant) {
            return convo.otherParticipant;
        }
        // Fallback: find manually (should not be needed if API populates correctly)
        return convo.participants?.find(p => p._id !== currentUser?._id);
    };

    const getLastMessagePreview = (convo) => {
        if (!convo.lastMessage) return 'No messages yet';
        const senderName = convo.lastMessage.sender?._id === currentUser?._id ? 'You' : convo.lastMessage.sender?.name || 'Someone';
        return `${senderName}: ${convo.lastMessage.body}`;
    };

    if (!conversations || conversations.length === 0) {
        // This case might be handled in the parent, but added defensively
        return <p className="no-conversations">No active conversations.</p>; 
    }

    return (
        <div className="conversation-list-container d-flex flex-column h-100">
            {/* Optional: Search Bar */}
            <div className="p-2 border-bottom">
                 <Form.Control type="search" placeholder="Search conversations..." />
            </div>
            
            <ListGroup variant="flush" className="overflow-auto flex-grow-1">
                {conversations.map((conversation) => (
                    <ConversationListItem
                        key={conversation._id}
                        conversation={conversation}
                        isSelected={conversation._id === selectedConversationId}
                        onSelect={() => onSelectConversation(conversation._id)}
                    />
                ))}
            </ListGroup>
            <style jsx>{`
                .conversation-list-container {
                    background-color: #f8f9fa; /* Light background */
                }
                .conversation-item {
                     transition: background-color 0.2s ease-in-out;
                }
                .conversation-item:hover {
                    background-color: #e9ecef;
                }
                 .active-conversation {
                     background-color: #cfe2ff; /* Bootstrap primary light */
                     border-left: 4px solid #0d6efd; /* Bootstrap primary */
                 }
                .conversation-name {
                    font-size: 0.95rem;
                }
                 .conversation-preview {
                     font-size: 0.85rem;
                 }
                .conversation-time {
                    font-size: 0.75rem;
                }
                .conversation-unread {
                     font-size: 0.7rem;
                 }
                 .overflow-auto {
                    scrollbar-width: thin; /* For Firefox */
                    scrollbar-color: #ced4da #f8f9fa; /* For Firefox */
                }
                .overflow-auto::-webkit-scrollbar {
                    width: 8px;
                }
                .overflow-auto::-webkit-scrollbar-track {
                    background: #f8f9fa;
                }
                .overflow-auto::-webkit-scrollbar-thumb {
                    background-color: #ced4da;
                    border-radius: 10px;
                    border: 2px solid #f8f9fa;
                }
            `}</style>
        </div>
    );
}

export default ConversationList; 