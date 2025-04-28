import React, { useState, useEffect } from 'react';
import ConversationList from '../../components/Chat/ConversationList';
import MessageView from '../../components/Chat/MessageView';
import { getConversations } from '../services/conversationService'; // Corrected path
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Shared/LoadingSpinner'; // Assuming a spinner component
import ErrorMessage from '../../components/Shared/ErrorMessage'; // Assuming an error component
import '../../styles/MessagesPage.css'; // Add styling

function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            if (!user) return; // Should be protected route anyway
            setLoading(true);
            setError(null);
            try {
                const data = await getConversations();
                setConversations(data || []); // Ensure it's an array
            } catch (err) {
                console.error("Error fetching conversations:", err);
                setError(err.message || 'Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]); // Refetch if user changes (though unlikely on this page)

    const handleSelectConversation = (conversationId) => {
        setSelectedConversationId(conversationId);
    };

    // Find the full selected conversation object to pass to MessageView
    const selectedConversation = conversations.find(c => c._id === selectedConversationId);

    return (
        <div className="messages-page-container">
            <div className={`conversation-list-panel ${selectedConversationId ? 'panel-collapsed' : 'panel-expanded'}`}>
                 <h2>Messages</h2>
                {loading && <LoadingSpinner />}
                {error && <ErrorMessage message={error} />}
                {!loading && !error && (
                    <ConversationList
                        conversations={conversations}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={handleSelectConversation}
                    />
                )}
                 {!loading && !error && conversations.length === 0 && (
                     <p>No conversations yet.</p>
                 )}
            </div>
            <div className={`message-view-panel ${selectedConversationId ? 'panel-expanded' : 'panel-collapsed'}`}>
                {selectedConversationId && selectedConversation ? (
                    <MessageView
                        key={selectedConversationId} // Force re-render on selection change
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversationId(null)} // Function to go back to list view on mobile/small screens
                    />
                ) : (
                    <div className="message-view-placeholder">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage; 