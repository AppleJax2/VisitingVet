import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { getMessagesForConversation } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorMessage from '../Shared/ErrorMessage';
import '../../styles/MessageView.css'; // Add styling
import { useVisibilityChange } from '../../hooks/useVisibilityChange'; // Assume a custom hook

const MESSAGES_PER_PAGE = 20;

function MessageView({ conversation, onBack }) {
    const { _id: conversationId, otherParticipant } = conversation;
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    
    const messageListRef = useRef(null);
    const initialLoadRef = useRef(true); // Track initial load for scroll behavior
    const messagesEndRef = useRef(null); // Ref for scrolling to bottom
    const isVisible = useVisibilityChange(); // Use custom hook

    const fetchMessages = useCallback(async (beforeMessageId = null) => {
        if (!conversationId) return;
        setError(null);
        const loadingSetter = beforeMessageId ? setIsFetchingMore : setIsLoading;
        loadingSetter(true);

        try {
            const { data } = await getMessagesForConversation(conversationId, MESSAGES_PER_PAGE, beforeMessageId);
            if (data.success) {
                 const newMessages = data.data || [];
                setMessages(prev => beforeMessageId ? [...newMessages, ...prev] : newMessages);
                setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE); // Check if more might exist
            } else {
                 setError('Failed to load messages.');
                 setHasMoreMessages(false);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to fetch messages.');
             setHasMoreMessages(false); // Stop trying on error
        } finally {
            loadingSetter(false);
        }
    }, [conversationId]);

    // Initial fetch
    useEffect(() => {
        initialLoadRef.current = true; // Reset flag
        setMessages([]); // Clear old messages
        setHasMoreMessages(true); // Reset pagination
        fetchMessages();
    }, [fetchMessages]); // fetchMessages depends on conversationId

    // Scroll to bottom logic
     useEffect(() => {
        if (messageListRef.current && !isFetchingMore) {
             // Only scroll fully down on initial load or if already near bottom when new message added
             const { scrollHeight, clientHeight, scrollTop } = messageListRef.current;
             const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150; // Threshold

            if (initialLoadRef.current || isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                initialLoadRef.current = false;
            }
        }
    }, [messages, isFetchingMore]);

    // Socket listeners and Mark as Read logic
    useEffect(() => {
        if (socket && isConnected && conversationId) {
            const messageHandler = (newMessage) => {
                if (newMessage.conversationId === conversationId) {
                    setMessages(prev => [...prev, newMessage]);
                    // If window is visible/focused when message arrives, mark as read immediately
                    if (isVisible && document.hasFocus()) {
                        socket.emit('markAsRead', { conversationId });
                    }
                }
            };
            socket.on('newMessage', messageHandler);

            // Mark as read when component mounts/becomes visible and is focused
            const markReadIfVisible = () => {
                if (isVisible && document.hasFocus()) {
                    socket.emit('markAsRead', { conversationId });
                }
            };
            
            markReadIfVisible(); // Initial check
            
            // Add event listeners for focus/visibility changes
            window.addEventListener('focus', markReadIfVisible);
            document.addEventListener('visibilitychange', markReadIfVisible);

            return () => {
                socket.off('newMessage', messageHandler);
                window.removeEventListener('focus', markReadIfVisible);
                document.removeEventListener('visibilitychange', markReadIfVisible);
            };
        }
    }, [socket, isConnected, conversationId, isVisible]); // Add isVisible dependency

    // Send message handler
    const handleSendMessage = useCallback((content) => {
        if (!socket || !user || !content.trim()) return;

        const messageData = {
            conversationId: conversationId,
            senderId: user._id, // Use senderId convention if backend expects it
            content: content.trim(),
        };

        socket.emit('sendMessage', messageData, (response) => {
            if (response.success) {
                // Optimistic update or rely on socket echo handled by listener
                 // Clear input field if needed (handle in MessageInput)
            } else {
                console.error('Error sending message:', response.error);
                setError(`Failed to send message: ${response.error}`);
            }
        });
    }, [socket, conversationId, user]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (messageListRef.current && messageListRef.current.scrollTop === 0 && !isLoading && !isFetchingMore && hasMoreMessages) {
            const oldestMessageId = messages[0]?._id;
            if (oldestMessageId) {
                fetchMessages(oldestMessageId);
            }
        }
    }, [isLoading, isFetchingMore, hasMoreMessages, messages, fetchMessages]);

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
                 {isLoading && <LoadingSpinner />} 
                 {isFetchingMore && <div className="loading-more-indicator"><LoadingSpinner size="small" /></div>} 
                 {error && !isLoading && <ErrorMessage message={error} />} 
                {!isLoading && messages.length === 0 && !error && <p className="no-messages">No messages in this conversation yet.</p>}
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