import React, { useState, useEffect, useRef, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { getVideoToken } from '../../services/apiService'; // Adjust path if needed
import LoadingSpinner from '../Shared/LoadingSpinner';
import ErrorMessage from '../Shared/ErrorMessage';
import '../../styles/VideoCallFrame.css'; // Add styling

function VideoCallFrame({ roomName, userName, onCallLeft }) {
    const [callFrame, setCallFrame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const callContainerRef = useRef(null);

    const createAndJoinCall = useCallback(async () => {
        if (!roomName || !userName) {
            setError('Room name and user name are required to start the call.');
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        console.log(`Attempting to get token for room: ${roomName}, user: ${userName}`);

        try {
            // 1. Get token and room URL from backend
            const { token, roomUrl } = await getVideoToken(roomName);
            console.log(`Received token and URL: ${roomUrl}`);

            if (!token || !roomUrl) {
                throw new Error('Failed to retrieve video call token or URL.');
            }

            if (!callContainerRef.current) {
                throw new Error('Call container element not found.');
            }

            // 2. Create Daily Call Frame
            const frameOptions = {
                url: roomUrl,
                token: token,
                userName: userName,
                showLeaveButton: true,
                iframeStyle: {
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: '0',
                }
            };
            
            const frame = DailyIframe.createFrame(callContainerRef.current, frameOptions);
            setCallFrame(frame);
            console.log('Daily iframe created.');

            // 3. Add event listeners
            frame.on('loaded', () => {
                console.log('Daily iframe loaded');
                // Attempt to join immediately after loading
                frame.join(); 
            });

            frame.on('joining-meeting', () => {
                console.log('Joining Daily meeting...');
                setIsLoading(false); // Frame is visible, show joining state
            });

            frame.on('joined-meeting', (event) => {
                console.log('Successfully joined Daily meeting', event);
                setIsLoading(false);
            });

            frame.on('left-meeting', () => {
                console.log('Left Daily meeting');
                setError(null); // Clear any previous errors
                if (onCallLeft) {
                    onCallLeft(); // Notify parent component
                }
                // Frame might be destroyed automatically, but cleanup just in case
                frame.destroy();
                setCallFrame(null);
            });

            frame.on('error', (event) => {
                console.error('Daily call error:', event);
                setError(`Video call error: ${event?.error?.type || event?.errorMsg || 'Unknown error'}`);
                setIsLoading(false);
                // Attempt cleanup on critical error
                 if (frame) {
                     frame.destroy();
                     setCallFrame(null);
                 }
            });

        } catch (err) {
            console.error('Error setting up Daily call:', err);
            setError(err.message || 'Failed to initialize video call.');
            setIsLoading(false);
        }
    }, [roomName, userName, onCallLeft]);

    // Effect to create and join the call when component mounts or props change
    useEffect(() => {
        createAndJoinCall();

        // Cleanup function
        return () => {
            if (callFrame) {
                console.log('Destroying Daily iframe on component unmount...');
                callFrame.destroy();
                setCallFrame(null);
            }
        };
    }, [createAndJoinCall]); // Rerun if createAndJoinCall changes (due to prop changes)

    return (
        <div className="video-call-container">
            {isLoading && <div className="video-loading-overlay"><LoadingSpinner /> <p>Setting up video call...</p></div>}
            {error && !isLoading && (
                 <div className="video-error-overlay">
                     <ErrorMessage title="Video Call Error" message={error} />
                     {onCallLeft && <button onClick={onCallLeft} className="close-error-button">Close</button>}
                 </div>
            ) }
            {/* Container for the Daily iframe */} 
            <div ref={callContainerRef} className={`call-frame-wrapper ${isLoading || error ? 'hidden' : ''}`}></div>
        </div>
    );
}

export default VideoCallFrame; 