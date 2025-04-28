const axios = require('axios');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const usageTrackingService = require('../services/usageTrackingService');

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

            // Log video session start (token generation is a good proxy)
            usageTrackingService.logUsage(
                'VIDEO_SESSION_START',
                userId,
                {
                    roomName: roomName,
                    roomUrl: roomUrl,
                    // Add any other relevant details, e.g., appointmentId if roomName is based on it
                }
            );

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

/**
 * @desc    Get recordings for a specific Daily room
 * @route   GET /api/video/recordings/:roomName
 * @access  Private (Provider, Admin, maybe PetOwner?)
 */
exports.getRecordingsForRoom = asyncHandler(async (req, res, next) => {
    const { roomName } = req.params;
    
    // Basic validation: Ensure API is configured
    if (!DAILY_API_KEY || !DAILY_DOMAIN) {
        return next(new ErrorResponse('Video conferencing is not configured.', 500));
    }

    // TODO: Add authorization check - who can access recordings for this room?
    // e.g., Fetch appointment by roomName (appointmentId), check if req.user._id matches provider or petOwner
    // const appointment = await Appointment.findById(roomName);
    // if (!appointment || (appointment.providerProfile.user.toString() !== req.user.id && appointment.petOwner.toString() !== req.user.id)) {
    //     return next(new ErrorResponse('Not authorized to view recordings for this appointment', 403));
    // }

    try {
        // Call Daily API to list recordings, potentially filtering by room name if API supports it
        // The Daily API GET /recordings might require filtering client-side or using meeting_session_id
        // Let's assume we fetch all and filter, or use a session ID if we store it.
        // Simpler approach: Get recordings associated with the room name (might fetch more than needed if names aren't unique)
        
        console.log(`Fetching Daily recordings list...`);
        // NOTE: The Daily REST API for recordings doesn't directly filter by room_name.
        // It might be better to filter by meeting_session_id if available, or fetch recent recordings
        // and filter manually. This is a simplified example assuming direct room name use might work or 
        // that we'd implement more robust filtering/session tracking.
        const response = await dailyApi.get('/recordings'); // May need pagination
        
        const allRecordings = response.data.data || [];
        
        // Filter recordings that *might* belong to this room based on room_name
        // This is NOT reliable if room names are reused or not unique identifiers like appointment IDs
        const roomRecordings = allRecordings.filter(rec => rec.room_name === roomName);
        
        console.log(`Found ${roomRecordings.length} potential recordings for room ${roomName}`);

        res.status(200).json({ 
            success: true, 
            count: roomRecordings.length, 
            data: roomRecordings 
        });

    } catch (error) {
        console.error(`Error fetching Daily recordings for room ${roomName}:`, error.response?.data || error.message);
        return next(new ErrorResponse('Failed to fetch video recordings', 500));
    }
});

/**
 * @desc    Get a temporary access link for a specific Daily recording
 * @route   GET /api/video/recordings/link/:recordingId
 * @access  Private (Provider, Admin, maybe PetOwner?)
 */
exports.getRecordingAccessLink = asyncHandler(async (req, res, next) => {
    const { recordingId } = req.params;

    if (!DAILY_API_KEY || !DAILY_DOMAIN) {
        return next(new ErrorResponse('Video conferencing is not configured.', 500));
    }
    
     // TODO: Add authorization check - who can access this specific recording?
     // Fetch the recording details first, check its room_name, then check appointment authorization as above.
     // try {
     //     const recordingDetails = await dailyApi.get(`/recordings/${recordingId}`);
     //     const roomName = recordingDetails.data?.room_name;
     //     // ... perform auth check based on roomName ...
     // } catch (detailsError) { ... }

    try {
        console.log(`Fetching Daily access link for recording ${recordingId}...`);
        const response = await dailyApi.get(`/recordings/${recordingId}/access-link`);
        
        const accessLink = response.data.download_link; // Or link, depending on API response structure

        if (!accessLink) {
             throw new ErrorResponse('Access link not found in Daily API response', 404);
        }

        console.log(`Successfully fetched access link for recording ${recordingId}`);
        res.status(200).json({ 
            success: true, 
            accessLink: accessLink 
        });

    } catch (error) {
        console.error(`Error fetching Daily access link for recording ${recordingId}:`, error.response?.data || error.message);
         if (error.response && error.response.status === 404) {
             return next(new ErrorResponse('Recording not found', 404));
         }
        return next(new ErrorResponse('Failed to get recording access link', 500));
    }
}); 