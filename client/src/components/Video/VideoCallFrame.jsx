import React, { useState, useEffect, useRef, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { getVideoToken } from '../../services/api'; // Adjusted path back to api.js
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorMessage from '../Shared/ErrorMessage';
import '../../styles/VideoCallFrame.css';
import { Button } from 'react-bootstrap'; // Added Button for fallbacks
import { Link } from 'react-router-dom'; // For linking to chat/reschedule

// Map Daily error types to user-friendly messages and suggestions
const mapDailyError = (dailyError) => {
    const errorType = dailyError?.error?.type || dailyError?.errorMsg || 'Unknown error';
    let message = `Video call error: ${errorType}`;
    let suggestion = 'Please try again or contact support.';

    switch (errorType) {
        case 'cam-access-denied':
        case 'mic-access-denied':
            message = 'Camera or Microphone Access Denied';
            suggestion = 'Please grant permission to access your camera and microphone in your browser settings and try again.';
            break;
        case 'cam-in-use':
        case 'mic-in-use':
            message = 'Camera or Microphone In Use';
            suggestion = 'Another application might be using your camera or microphone. Please close other applications and try again.';
            break;
        case 'connection-error':
            message = 'Connection Error';
            suggestion = 'Could not connect to the video service. Please check your internet connection and try again. If the problem persists, try using the text chat or reschedule.';
            break;
        case 'setup-error':
             message = 'Setup Error';
             suggestion = 'There was an issue setting up the video call. Please try again shortly.';
             break;
         case 'meeting-session-already-started':
             message = 'Session Error';
             suggestion = 'There seems to be an issue with the call session. Please try leaving and rejoining.';
             break;
        default:
            if (errorType.includes('NetworkError') || errorType.includes('network connection')) {
                 message = 'Network Connection Issue';
                 suggestion = 'Your network connection seems unstable. Please check your connection and try again. Consider using text chat as a fallback.';
            }
            break;
    }
    return { message, suggestion };
};

function VideoCallFrame({ roomName, userName, appointmentId, // Pass appointmentId for linking
    onCallLeft // Callback when user intentionally leaves or call ends
 }) {
    const [callFrame, setCallFrame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null); // Stores { message, suggestion }
    const [showFallbackOptions, setShowFallbackOptions] = useState(false);
    const callContainerRef = useRef(null);

    const destroyFrame = useCallback(() => {
        if (callFrame) {
            console.log('Destroying Daily iframe explicitly...');
            // Remove event listeners before destroying to avoid potential issues
            callFrame.off('loaded').off('joining-meeting').off('joined-meeting').off('left-meeting').off('error');
            callFrame.destroy();
            setCallFrame(null);
        }
    }, [callFrame]);

    const createAndJoinCall = useCallback(async (isRetry = false) => {
        if (!roomName || !userName) {
            setError({ message: 'Configuration Error', suggestion: 'Room name and user name are required.'});
            setIsLoading(false);
            return;
        }
        
        // Clean up existing frame if retrying
        if (isRetry && callFrame) {
            destroyFrame();
        }

        setIsLoading(true);
        setError(null);
        setShowFallbackOptions(false);
        console.log(`Attempting to get token for room: ${roomName}, user: ${userName}. Retry: ${isRetry}`);

        try {
            const { token, roomUrl } = await getVideoToken(roomName);
            if (!token || !roomUrl) throw new Error('Failed to retrieve video call token or URL.');
            if (!callContainerRef.current) throw new Error('Call container element not found.');

            const frameOptions = {
                url: roomUrl,
                token: token,
                userName: userName,
                showLeaveButton: true,
                iframeStyle: {
                    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '0'
                }
            };
            
            const frame = DailyIframe.createFrame(callContainerRef.current, frameOptions);
            setCallFrame(frame); // Store frame instance
            console.log('Daily iframe created.');

            frame.on('loaded', () => console.log('Daily iframe loaded'));
            frame.on('joining-meeting', () => {
                 console.log('Joining Daily meeting...');
                 setIsLoading(false); // Frame is visible, show joining state
             });
            frame.on('joined-meeting', (event) => {
                 console.log('Successfully joined Daily meeting', event);
                 setIsLoading(false);
                 setShowFallbackOptions(false); // Hide fallbacks on success
                 setError(null);
             });
            frame.on('left-meeting', () => {
                 console.log('Left Daily meeting event');
                 setError(null); 
                 destroyFrame(); // Clean up frame
                 if (onCallLeft) onCallLeft(); // Notify parent
             });
            frame.on('error', (event) => {
                 console.error('Daily call error event:', event);
                 const mappedError = mapDailyError(event);
                 setError(mappedError);
                 setShowFallbackOptions(true);
                 setIsLoading(false);
                 destroyFrame(); // Clean up frame on error
            });

            // Join the call (this happens after 'loaded' usually, but join() can be called directly)
            frame.join();

        } catch (err) {
            console.error('Error setting up Daily call:', err);
            setError({ message: 'Initialization Failed', suggestion: err.message || 'Could not initialize video call.' });
            setShowFallbackOptions(true);
            setIsLoading(false);
            if (callFrame) destroyFrame(); // Cleanup if frame was partially created
        }
    }, [roomName, userName, callFrame, destroyFrame, onCallLeft]);

    // Initial call setup
    useEffect(() => {
        createAndJoinCall(false); // Initial attempt
        // Cleanup function on unmount
        return () => destroyFrame();
    }, [roomName, userName]); // Only re-run initial setup if room/user fundamentally changes

    const handleTryAgain = () => {
        createAndJoinCall(true); // Retry attempt
    };

    return (
        <div className="video-call-container">
            {/* Loading Overlay */} 
            {isLoading && (
                <div className="video-loading-overlay">
                    <LoadingSpinner /> 
                    <p>Setting up video call...</p>
                </div>
            )}
            
            {/* Error/Fallback Display */} 
            {error && !isLoading && (
                 <div className="video-error-overlay">
                     <ErrorMessage title={error.message} message={error.suggestion} />
                     {showFallbackOptions && (
                         <div className="fallback-options">
                             <Button variant="primary" onClick={handleTryAgain} className="me-2">Try Again</Button>
                             {/* TODO: Add logic to get phone numbers if implementing phone fallback */}
                             {/* <Button variant="secondary" onClick={switchToPhone} className="me-2">Switch to Phone Call</Button> */} 
                              {appointmentId && (
                                   <Link to={`/dashboard/messages?startConversationWith=${appointmentId}`} className="btn btn-info me-2">
                                       Use Text Chat Instead
                                   </Link>
                               )}
                               {/* Link to reschedule - requires knowing appointment ID and having reschedule route */} 
                              {/* <Link to={`/appointments/${appointmentId}/reschedule`} className="btn btn-warning me-2">Reschedule</Link> */} 
                              <Button variant="danger" onClick={onCallLeft}>Leave Call</Button> 
                         </div>
                     )}
                 </div>
            )}
            
            {/* Daily Iframe Container - only renders when no error and not loading? */} 
            <div ref={callContainerRef} className={`call-frame-wrapper ${isLoading || error ? 'hidden' : ''}`}></div>
        </div>
    );
}

export default VideoCallFrame; 