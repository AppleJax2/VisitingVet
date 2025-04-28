import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user and token
import config from '../config'; // Assuming config has API URL

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, token } = useAuth(); // Get user and token from auth context

    useEffect(() => {
        if (user && token) {
            // Connect only if user is logged in and has a token
            console.log('Attempting to connect socket...');
            const newSocket = io(config.apiUrl.replace('/api', ''), { // Connect to base URL
                 auth: { // Send token for authentication
                     token: token 
                 },
                // query: { token } // Alternative: send token via query
                reconnectionAttempts: 5, 
                reconnectionDelay: 3000,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully:', newSocket.id);
                setIsConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
                 // Handle potential reconnection logic or cleanup
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
                // Handle auth errors specifically if needed
                if (error.message.includes('Authentication error')) {
                     // Maybe force logout or show error message
                }
            });

            setSocket(newSocket);

            // Cleanup on component unmount or when user/token changes
            return () => {
                console.log('Disconnecting socket...');
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
             // If user logs out or token disappears, disconnect socket if it exists
             if (socket) {
                 console.log('User logged out, disconnecting socket...');
                 socket.disconnect();
                 setSocket(null);
                 setIsConnected(false);
             }
        }
    }, [user, token]); // Re-run effect if user or token changes

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}; 