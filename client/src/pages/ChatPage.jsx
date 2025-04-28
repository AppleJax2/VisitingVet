import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ConversationList from '../components/Chat/ConversationList';
import ChatWindow from '../components/Chat/ChatWindow';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext'; // Import useSocket
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ChatPage() {
    const { conversationId: paramConvId } = useParams(); // Get initial conversation ID from route
    const { user: currentUser } = useAuth();
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();
    
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [errorConversations, setErrorConversations] = useState(null);

    // Fetch initial list of conversations
    useEffect(() => {
        const fetchConversations = async () => {
            setLoadingConversations(true);
            setErrorConversations(null);
            try {
                const { data } = await api.get('/conversations');
                if (data.success) {
                    setConversations(data.data || []);
                     // If a conversation ID is in the URL, try to select it
                    if (paramConvId) {
                        const initialConvo = data.data.find(c => c._id === paramConvId);
                        if (initialConvo) {
                            setSelectedConversation(initialConvo);
                        } else {
                            console.warn(`Conversation ID ${paramConvId} from URL not found in user's list.`);
                             navigate('/chat'); // Navigate away if ID is invalid
                        }
                    }
                } else {
                    throw new Error(data.message || 'Failed to fetch conversations');
                }
            } catch (err) {
                console.error("Fetch Conversations Error:", err);
                setErrorConversations(err.message || 'Could not load conversations');
            } finally {
                setLoadingConversations(false);
            }
        };
        fetchConversations();
    }, [paramConvId, navigate]);

    // --- Socket Event Listener for New Messages --- 
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewMessage = (newMessage) => {
            console.log('New message received via socket:', newMessage);
            
            setConversations(prevConvos => {
                 // Find the conversation this message belongs to
                 const convoIndex = prevConvos.findIndex(c => c._id === newMessage.conversationId);
                 
                 if (convoIndex !== -1) {
                     // Update existing conversation's last message and move it to top
                     const updatedConvo = {
                         ...prevConvos[convoIndex],
                         lastMessage: newMessage, // Update last message preview
                         updatedAt: newMessage.createdAt, // Use message time for sorting
                         // Increment unread count IF the message is not from the current user 
                         // AND the chat window for this convo isn't currently active
                         unreadCount: (selectedConversation?._id !== newMessage.conversationId && newMessage.sender._id !== currentUser._id) 
                                        ? (prevConvos[convoIndex].unreadCount || 0) + 1 
                                        : prevConvos[convoIndex].unreadCount
                     };
                     // Remove the conversation and add it to the beginning
                     const remainingConvos = prevConvos.filter(c => c._id !== newMessage.conversationId);
                     return [updatedConvo, ...remainingConvos];
                 } else {
                     // This might happen if a new conversation is started by someone else
                     // We should ideally fetch the new conversation details
                     // For now, maybe just refetch all conversations?
                      console.warn('Received message for an unknown conversation, consider refetching list.');
                     // TODO: Add logic to fetch and add the new conversation
                     return prevConvos; 
                 }
            });
        };

        socket.on('newMessage', handleNewMessage);

        // Cleanup listener on unmount
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, isConnected, selectedConversation, currentUser]); // Dependency on selectedConversation to update unread count correctly

    const handleConversationSelect = (conversation) => {
        // Mark messages as read when conversation is selected
        if (socket && isConnected && conversation.unreadCount > 0) {
            socket.emit('markAsRead', { conversationId: conversation._id });
            // Optimistically set unread count to 0 in the UI
             setConversations(prevConvos => prevConvos.map(c => 
                 c._id === conversation._id ? { ...c, unreadCount: 0 } : c
             ));
        }
        setSelectedConversation(conversation);
        // Update URL without full page reload
        navigate(`/chat/${conversation._id}`, { replace: true }); 
    };

    return (
        <Container fluid className="chat-page-container vh-100 d-flex flex-column p-0">
            {/* Optional: Add a header specific to the chat page */} 
             {!isConnected && (
                 <Alert variant="warning" className="text-center mb-0 rounded-0">
                     Chat disconnected. Attempting to reconnect...
                 </Alert>
             )}

            <Row className="g-0 flex-grow-1" style={{ overflow: 'hidden' }}>
                {/* Conversation List Column */} 
                <Col 
                    xs={12} md={4} 
                    className="border-end d-flex flex-column"
                    style={{ height: 'calc(100vh - 56px)' }} // Adjust height based on potential header/footer
                >
                    {loadingConversations && <div className="text-center p-3"><Spinner animation="border" /></div>}
                    {errorConversations && <Alert variant="danger" className="m-3">{errorConversations}</Alert>}
                    {!loadingConversations && !errorConversations && (
                        <ConversationList 
                            conversations={conversations}
                            selectedConversationId={selectedConversation?._id}
                            onConversationSelect={handleConversationSelect}
                            currentUser={currentUser}
                        />
                    )}
                </Col>

                {/* Chat Window Column */} 
                <Col 
                    xs={12} md={8}
                    className="d-flex flex-column" 
                    style={{ height: 'calc(100vh - 56px)' }}
                >
                    {selectedConversation ? (
                        <ChatWindow 
                            conversation={selectedConversation}
                            currentUser={currentUser}
                        />
                    ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                            <p>Select a conversation to start chatting.</p>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default ChatPage; 