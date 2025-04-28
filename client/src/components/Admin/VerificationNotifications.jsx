import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { BellIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons
import PropTypes from 'prop-types';

// Assume an API service exists to fetch pending verification counts
// import { getPendingVerificationCount } from '../../services/adminVerificationApi';

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
const VerificationNotifications = ({ pollInterval = 60000 }) => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // const count = await getPendingVerificationCount();
            const count = await fetchPendingCount();
            setPendingCount(count);
        } catch (err) {
            console.error('Error fetching verification notifications:', err);
            setError(err.message || 'Could not load notifications.');
            setPendingCount(0); // Reset count on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial fetch

        // Set up polling
        const intervalId = setInterval(fetchData, pollInterval);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [pollInterval]);

    const renderContent = () => {
        if (isLoading && pendingCount === 0) {
            // Show subtle loading state only on initial load or if count was 0
            return (
                <span className="flex items-center text-gray-400 animate-pulse">
                    <BellIcon className="h-5 w-5 mr-1" />
                    <span className="text-xs">...</span>
                </span>
            );
        }

        if (error) {
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