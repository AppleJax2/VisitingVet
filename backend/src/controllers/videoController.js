const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = process.env.DAILY_API_URL || 'https://api.daily.co/v1';
const DAILY_DOMAIN = process.env.DAILY_DOMAIN; // Your Daily domain, e.g., your-domain.daily.co

if (!DAILY_API_KEY || !DAILY_DOMAIN) {
    console.error('Error: DAILY_API_KEY and DAILY_DOMAIN environment variables are required for video features.');
    // Depending on requirements, you might throw an error here or allow the app to run without video
}

const dailyApi = axios.create({
    baseURL: DAILY_API_URL,
    headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

/**
 * @desc    Create or get a meeting token for a Daily video room
 * @route   POST /api/video/token
 * @access  Private
 * @body    { roomName: string } // e.g., roomName based on appointmentId
 */
exports.createVideoToken = asyncHandler(async (req, res, next) => {
    const { roomName } = req.body;
    const userId = req.user.id; // Assuming user ID is available from auth middleware
    const userName = req.user.name; // Assuming user name is available

    if (!DAILY_API_KEY || !DAILY_DOMAIN) {
        return next(new ErrorResponse('Video conferencing is not configured on the server.', 500));
    }

    if (!roomName) {
        return next(new ErrorResponse('Room name is required', 400));
    }

    try {
        // 1. Check if room exists, otherwise create it
        let roomExists = false;
        try {
            await dailyApi.get(`/rooms/${roomName}`);
            console.log(`Daily room '${roomName}' already exists.`);
            roomExists = true;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`Daily room '${roomName}' not found, creating...`);
                // Room doesn't exist, create it
                // Set room to expire 1 hour (3600s) after creation, adjust as needed
                const roomExpiry = Math.floor(Date.now() / 1000) + 3600;
                await dailyApi.post('/rooms', {
                    name: roomName,
                    privacy: 'private', // Require a token to join
                    properties: {
                        exp: roomExpiry, // Automatically delete room after expiry
                        enable_chat: true,
                        enable_people_ui: true, 
                        enable_screenshare: true,
                        enable_recording: 'cloud' // Or 'local', 'rtp-tracks', false
                    }
                });
                console.log(`Daily room '${roomName}' created successfully.`);
                roomExists = true;
            } else {
                // Rethrow other errors (e.g., auth, rate limit)
                console.error('Error checking/creating Daily room:', error.response?.data || error.message);
                throw new ErrorResponse('Failed to prepare video room', 500);
            }
        }

        // 2. Create a meeting token for the user
        if (roomExists) {
            // Token expires in 1 hour (3600s), adjust as needed
            const tokenExpiry = Math.floor(Date.now() / 1000) + 3600;
            const tokenProperties = {
                room_name: roomName,
                user_id: userId, 
                user_name: userName,
                exp: tokenExpiry,
                // is_owner: req.user.role === 'MVSProvider' // Example: Make provider the owner
            };

            const response = await dailyApi.post('/meeting-tokens', tokenProperties);
            const token = response.data.token;
            const roomUrl = `https://${DAILY_DOMAIN}.daily.co/${roomName}`;

            console.log(`Generated Daily token for user ${userId} in room ${roomName}`);
            res.status(200).json({ success: true, token: token, roomUrl: roomUrl });

        } else {
            // This case should ideally not be reached due to error handling above
             throw new ErrorResponse('Failed to create or verify video room', 500);
        }

    } catch (error) {
        console.error('Error generating Daily meeting token:', error.response?.data || error.message);
        // Ensure specific error isn't thrown if it's already an ErrorResponse
        if (error instanceof ErrorResponse) {
             return next(error);
        } 
        return next(new ErrorResponse('Failed to generate video token', 500));
    }
}); 