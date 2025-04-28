import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Spinner, Alert, Image } from 'react-bootstrap';
import { format } from 'date-fns'; // Use format for more control
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { getMessagesForConversation } from '../../services/api'; // Assuming API service exists
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

function ChatWindow({ conversation, onNewMessage }) {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otherParticipant, setOtherParticipant] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true); // To track if more messages can be loaded
    const [loadingMore, setLoadingMore] = useState(false);
    const messageListRef = useRef(null);

    // Function to fetch messages
    const fetchMessages = useCallback(async (beforeTimestamp = null) => {
        if (!conversation?._id) return;
        if (!beforeTimestamp) {
            setLoading(true); // Full load
            setMessages([]); // Clear existing messages on new conversation select
            setHasMoreMessages(true); // Reset pagination
        } else {
            setLoadingMore(true); // Loading older messages
        }
        setError(null);

        try {
            const queryParams = { limit: 30 }; // Fetch 30 messages at a time
            if (beforeTimestamp) {
                queryParams.before = beforeTimestamp; // Add cursor for pagination
            }

            const fetchedMessages = await getMessagesForConversation(conversation._id, queryParams);

            if (fetchedMessages.length < queryParams.limit) {
                setHasMoreMessages(false); // No more messages to load
            }

            // Prepend older messages, append if it's the initial load (or handle as needed)
            setMessages(prevMessages => 
                beforeTimestamp ? [...fetchedMessages, ...prevMessages] : fetchedMessages
            );

        } catch (err) {
            console.error("Error fetching messages:", err);
            setError(err.message || 'Failed to load messages.');
            setHasMoreMessages(false); // Stop trying to load more on error
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [conversation?._id]); // Depend on conversation ID

    // Find the other participant
    useEffect(() => {
        if (conversation && currentUser) {
            const participant = conversation.participants?.find(p => p._id !== currentUser._id);
            setOtherParticipant(participant);
        }
    }, [conversation, currentUser]);

    // Initial message fetch when conversation changes
    useEffect(() => {
        fetchMessages(); // Fetch initial batch
    }, [fetchMessages]); // fetchMessages is memoized with useCallback

    // Socket listener for new messages in this specific conversation
    useEffect(() => {
        if (!socket || !conversation?._id) return;

        const handleNewMessage = (newMessage) => {
            if (newMessage.conversation === conversation._id) {
                setMessages(prevMessages => [...prevMessages, newMessage]);

                if (onNewMessage) {
                    onNewMessage(newMessage);
                }
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, conversation?._id, onNewMessage]);

    // Handler for sending a message
    const handleSendMessage = (messageBody) => {
        if (!socket || !conversation || !otherParticipant) {
            console.error('Socket not connected or conversation/recipient missing');
            return; // Prevent sending if socket or conversation details are missing
        }

        const messageData = {
            recipientId: otherParticipant._id,
            body: messageBody,
            // conversationId is handled server-side or can be included if needed
        };

        socket.emit('sendMessage', messageData);
    };

    // Handler for loading more messages
    const loadMoreMessages = () => {
        if (!loadingMore && hasMoreMessages && messages.length > 0) {
            const oldestMessageTimestamp = messages[0].createdAt;
            fetchMessages(oldestMessageTimestamp);
        }
    };

    // Render logic
    if (!conversation) {
        return (
            <Card className="h-100 d-flex justify-content-center align-items-center">
                <Card.Body className="text-center text-muted">
                    <i className="bi bi-chat-dots fs-1 mb-3"></i>
                    <p>Select a conversation to start chatting.</p>
                </Card.Body>
            </Card>
        );
    }

    if (loading && messages.length === 0) {
        return (
            <Card className="h-100 d-flex justify-content-center align-items-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading messages...</span>
                </Spinner>
            </Card>
        );
    }

    return (
        <Card className="h-100 d-flex flex-column chat-window-card">
            <Card.Header className="d-flex align-items-center p-2 chat-window-header">
                <Image 
                    src={otherParticipant?.profileImage || 'https://via.placeholder.com/40?text=User'} 
                    roundedCircle 
                    width={40} 
                    height={40} 
                    className="me-2"
                />
                <span className="fw-bold">{otherParticipant?.name || 'Chat'}</span>
                {/* Add status indicator or other actions here if needed */}
            </Card.Header>

            <Card.Body className="flex-grow-1 overflow-auto p-0 chat-window-body">
                {error && <Alert variant="danger" className="m-2">{error}</Alert>} 
                <MessageList 
                    ref={messageListRef} 
                    messages={messages} 
                    currentUser={currentUser} 
                    onLoadMore={loadMoreMessages}
                    hasMore={hasMoreMessages}
                    isLoadingMore={loadingMore}
                />
            </Card.Body>

            <Card.Footer className="p-0 chat-window-footer">
                <MessageInput onSendMessage={handleSendMessage} />
            </Card.Footer>
             <style jsx>{`
                .chat-window-card {
                    border: none; /* Remove card border if desired */
                    background-color: #ffffff; /* Ensure white background */
                }
                .chat-window-header {
                    background-color: #f8f9fa; /* Light header background */
                    border-bottom: 1px solid #dee2e6;
                }
                .chat-window-body {
                    background-color: #e9ecef; /* Slightly different background for message area */
                    /* Add background image or pattern if desired */
                }
                .chat-window-footer {
                    border-top: 1px solid #dee2e6;
                    background-color: #f8f9fa; /* Match header */
                }
                /* Ensure overflow auto takes precedence */
                .overflow-auto {
                    overflow-y: auto !important;
                    scrollbar-width: thin; /* For Firefox */
                    scrollbar-color: #adb5bd #e9ecef; /* For Firefox */
                }
                .overflow-auto::-webkit-scrollbar {
                    width: 8px;
                }
                .overflow-auto::-webkit-scrollbar-track {
                    background: #e9ecef; /* Match body background */
                }
                .overflow-auto::-webkit-scrollbar-thumb {
                    background-color: #adb5bd; /* Scrollbar handle color */
                    border-radius: 10px;
                    border: 2px solid #e9ecef; /* Padding around handle */
                }
            `}</style>
        </Card>
    );
}

export default ChatWindow; 