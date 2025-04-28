import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { getMessagesForConversation } from '../../services/conversationService';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorMessage from '../Shared/ErrorMessage';
import '../../styles/MessageView.css'; // Add styling

const MESSAGES_PER_PAGE = 30;

function MessageView({ conversation, onBack }) {
    const { _id: conversationId, otherParticipant } = conversation;
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true); // Assume more initially
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    
    const messageListRef = useRef(null);
    const initialLoadRef = useRef(true); // To track initial scroll to bottom

    // Function to fetch messages (used for initial load and loading more)
    const fetchMessages = useCallback(async (beforeMessageId = null) => {
        if (!conversationId) return;
        console.log(`Fetching messages for ${conversationId}, before: ${beforeMessageId}`);
        setError(null);
        const loadingSetter = beforeMessageId ? setIsFetchingMore : setLoading;
        loadingSetter(true);

        try {
            const fetchedMessages = await getMessagesForConversation(conversationId, MESSAGES_PER_PAGE, beforeMessageId);
            
            if (fetchedMessages && fetchedMessages.length > 0) {
                setMessages(prev => beforeMessageId ? [...fetchedMessages, ...prev] : fetchedMessages);
                setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE);
            } else {
                setHasMoreMessages(false); // No more messages were returned
            }
            
            // If initial load, mark the flag
            if (!beforeMessageId) {
                 initialLoadRef.current = true;
            }

        } catch (err) {
            console.error("Error fetching messages:", err);
            setError(err.message || 'Failed to load messages');
            setHasMoreMessages(false); // Stop trying on error
        } finally {
            loadingSetter(false);
        }
    }, [conversationId]);

    // Initial fetch
    useEffect(() => {
        initialLoadRef.current = true; // Reset flag on conversation change
        setMessages([]); // Clear old messages
        setHasMoreMessages(true); // Reset pagination
        fetchMessages();
    }, [conversationId, fetchMessages]);

    // Scroll to bottom on initial load or new message
    useEffect(() => {
        if (messageListRef.current) {
            const { scrollHeight, clientHeight, scrollTop } = messageListRef.current;
             // Only scroll if near the bottom or on initial load
            const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100; // Allow some leeway

            if (initialLoadRef.current || isScrolledToBottom) {
                messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
                 initialLoadRef.current = false; // Mark initial scroll as done
            }
        }
    }, [messages]); // Run when messages array changes

    // WebSocket listener for new messages
    useEffect(() => {
        if (socket && isConnected) {
            console.log(`Socket ${socket.id} listening for messages in convo ${conversationId}`);
            const handleNewMessage = (newMessage) => {
                console.log('New message received:', newMessage);
                // Only add if it belongs to the current conversation
                if (newMessage.conversationId === conversationId) {
                    setMessages(prev => [...prev, newMessage]);
                    // TODO: Mark as read if window/tab is focused
                    // Maybe emit 'markAsRead' here?
                    if (document.hasFocus()) {
                         console.log(`Emitting markAsRead for ${conversationId}`);
                         socket.emit('markAsRead', { conversationId });
                    }
                }
            };

            socket.on('newMessage', handleNewMessage);

            // Emit markAsRead when conversation is opened
             console.log(`Emitting markAsRead for ${conversationId} on view open`);
            socket.emit('markAsRead', { conversationId });

            return () => {
                console.log(`Socket ${socket.id} removing listener for ${conversationId}`);
                socket.off('newMessage', handleNewMessage);
            };
        } else {
            console.log('Socket not available or not connected for message listener');
        }
    }, [socket, isConnected, conversationId]);

    // Handler for sending a message
    const handleSendMessage = (content) => {
        if (!socket || !isConnected || !content.trim()) {
            console.error('Socket not connected or message empty');
             // Maybe show an error to the user
            return;
        }

        const messageData = {
            recipientId: otherParticipant?._id,
            content: content.trim(),
            conversationId: conversationId 
        };

        console.log('Sending message:', messageData);
        socket.emit('sendMessage', messageData, (response) => {
            if (response.success) {
                console.log('Message sent successfully and acknowledged:', response.message);
                // Optionally add the message optimistically or wait for 'newMessage' event
                // Already handled by 'newMessage' listener including sender's own messages
            } else {
                console.error('Failed to send message:', response.error);
                setError('Failed to send message. Please try again.'); // Show error to user
            }
        });
    };

     // Infinite scroll handler
     const handleScroll = () => {
        if (messageListRef.current && !isFetchingMore && hasMoreMessages) {
            const { scrollTop } = messageListRef.current;
            // If scrolled near the top, load more
            if (scrollTop < 50) { 
                const firstMessageId = messages[0]?._id;
                if (firstMessageId) {
                     console.log('Scrolling near top, fetching more messages...');
                    fetchMessages(firstMessageId);
                }
            }
        }
    };

    return (
        <div className="message-view">
             <div className="message-view-header">
                 {onBack && <button onClick={onBack} className="back-button">&larr;</button>}
                 <img 
                     src={otherParticipant?.profileImage || '/path/to/default-avatar.png'} 
                     alt={`${otherParticipant?.name}'s avatar`} 
                     className="header-avatar"
                 />
                <h3>{otherParticipant?.name || 'Conversation'}</h3>
                {/* Add other actions like video call start if needed */} 
            </div>

            <div className="message-list-container" ref={messageListRef} onScroll={handleScroll}>
                 {loading && <LoadingSpinner />} 
                 {isFetchingMore && <div className="loading-more-indicator"><LoadingSpinner size="small" /></div>} 
                 {error && !loading && <ErrorMessage message={error} />} 
                {!loading && messages.length === 0 && !error && <p className="no-messages">No messages in this conversation yet.</p>}
                {messages.map((msg, index) => (
                    <MessageItem 
                        key={msg._id || index} // Use index as fallback key if needed 
                        message={msg} 
                        isOwnMessage={msg.sender?._id === user?.id} 
                    />
                ))}
                 {!hasMoreMessages && messages.length > 0 && <div className="start-of-conversation">Start of conversation</div>}
            </div>

            <MessageInput onSendMessage={handleSendMessage} disabled={!isConnected} />
        </div>
    );
}

export default MessageView; 