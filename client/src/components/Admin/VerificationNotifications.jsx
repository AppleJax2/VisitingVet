import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { BellIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons
import { adminGetPendingVerifications } from '../../services/apiClient'; // For initial count
import io from 'socket.io-client'; // Import socket.io client
import logger from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext'; // To get token for socket auth
import PropTypes from 'prop-types';

// Assume an API service exists to fetch pending verification counts
// import { getPendingVerificationCount } from '../../services/adminVerificationApi';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'; // Get from env

/**
 * Simulates fetching the count of pending verifications.
 * Replace with actual API call.
 */
const fetchPendingCount = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    // Simulate potential error
    if (Math.random() < 0.1) {
        throw new Error('Failed to fetch notification count.');
    }
    // Simulate a random count
    return Math.floor(Math.random() * 15) + 1; // e.g., 1 to 15 pending
};

/**
 * Component to display notifications about pending verification requests.
 */
const VerificationNotifications = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const socketRef = useRef(null);

    // Fetch initial count
    useEffect(() => {
        const fetchInitialCount = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Fetch only count, assuming API supports this or fetching page 1 is ok
                const response = await adminGetPendingVerifications(1, 1); 
                if (response.success) {
                    setPendingCount(response.pagination?.totalItems || 0);
                } else {
                    setError('Failed to load initial verification count.');
                }
            } catch (err) {
                logger.error('Error fetching initial verification count:', err);
                setError(err.message || 'Error fetching count.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialCount();
    }, []);

    // Setup WebSocket connection
    useEffect(() => {
        if (!user?.token) {
             logger.warn('No auth token, WebSocket connection not established.');
             return; // Don't connect if not authenticated
        }

        // Connect to WebSocket server with auth token
        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: {
                token: user.token
            },
            reconnectionAttempts: 5 // Limit reconnection attempts
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            logger.info('WebSocket connected successfully for notifications.');
            setError(''); // Clear previous connection errors
        });

        // Listen for verification count updates
        socket.on('analyticsUpdate', (data) => {
            if (data?.metricType === 'verificationCount') {
                 logger.debug('Received verification count update:', data.payload);
                 setPendingCount(data.payload?.pending ?? 0);
            }
        });

        socket.on('connect_error', (err) => {
            logger.error('WebSocket connection error:', err.message);
            setError(`Connection error: ${err.message}`);
            // Don't set pendingCount to 0 here, might be temporary issue
        });

        socket.on('disconnect', (reason) => {
            logger.warn(`WebSocket disconnected: ${reason}`);
            // Optionally set error or handle reconnection logic if needed beyond default
             if (reason !== 'io client disconnect') { // Don't show error on manual disconnect/logout
                 setError('WebSocket disconnected. Attempting to reconnect...');
             }
        });

        // Clean up on component unmount
        return () => {
             if (socket) {
                 logger.info('Disconnecting notification WebSocket.');
                 socket.disconnect();
                 socketRef.current = null;
             }
        };
    }, [user]); // Reconnect if user token changes

    const renderContent = () => {
        if (isLoading) {
             return (
                 <span className="flex items-center text-gray-400 animate-pulse">
                     <BellIcon className="h-5 w-5 mr-1" />
                     <span className="text-xs">...</span>
                 </span>
             );
         }
 
         if (error && pendingCount === 0) { // Show error prominently if count is 0
             return (
                 <span className="flex items-center text-red-500" title={error}>
                     <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                     <span className="text-xs">Error</span>
                 </span>
             );
         }
 
         if (pendingCount > 0) {
             return (
                 <span className="flex items-center text-blue-600 hover:text-blue-800">
                     <BellIcon className="h-6 w-6 mr-1 animate-pulse text-yellow-500" />
                     <span className="font-semibold">{pendingCount}</span>
                     <span className="ml-1 text-xs hidden sm:inline">Pending</span>
                 </span>
             );
         }
 
         // No pending items, no error, not loading
         return (
              <span className="flex items-center text-gray-500">
                 <BellIcon className="h-6 w-6 mr-1" />
                  <span className="text-xs hidden sm:inline">Up to date</span>
             </span>
         );
    };

    return (
        // Assuming navigation to the verification queue page
        <Link to="/admin/verifications" className="relative inline-block p-2 rounded hover:bg-gray-100 transition-colors duration-150">
            {renderContent()}
        </Link>
    );
};

VerificationNotifications.propTypes = {
    /** Interval in milliseconds to poll for new notifications */
    pollInterval: PropTypes.number,
};

export default VerificationNotifications; 