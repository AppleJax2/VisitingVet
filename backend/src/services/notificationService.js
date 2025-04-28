const ApiError = require('../errors/ApiError');
// const User = require('../models/User'); // To get user contact info
// const { VaccinationRecord } = require('../models/VaccinationRecord'); // To get record details for message
// const emailService = require('./emailService'); // Placeholder for actual email sending
// const smsService = require('./smsService'); // Placeholder for actual SMS sending

/**
 * Sends a notification based on a specific event type.
 * 
 * @param {string} userId - The ID of the User to notify.
 * @param {string} eventType - The type of event (e.g., 'vaccination_verified', 'vaccination_rejected', 'vaccination_expiring').
 * @param {object} data - Additional data relevant to the event (e.g., { recordId, petName, vaccineType, rejectionReason, expiryDate }).
 * @param {string[]} [channels=['email']] - Preferred notification channels (e.g., ['email', 'inApp']).
 * @returns {Promise<void>}
 * @throws {ApiError} - If user not found or notification fails.
 */
const sendNotification = async (userId, eventType, data, channels = ['email']) => {
    console.log(`[Notification Service] Request to send notification. User: ${userId}, Event: ${eventType}, Channels: ${channels.join(', ')}`);
    
    try {
        // 1. Fetch User details (needed for email/phone and preferences)
        // const user = await User.findById(userId);
        // if (!user) {
        //     throw ApiError.notFound(`User not found with ID: ${userId}`);
        // }
        const simulatedUser = { _id: userId, email: `${userId}@example.com`, preferences: { notificationChannels: channels } }; // Simulation
        const user = simulatedUser;

        // 2. Construct Message based on eventType and data
        const { subject, body, htmlBody } = constructMessage(eventType, data, user);
        if (!subject || !body) {
            console.warn(`[Notification Service] Could not construct message for event type: ${eventType}. Skipping.`);
            return;
        }

        // 3. Determine actual channels based on user preferences
        const effectiveChannels = user.preferences?.notificationChannels || ['email']; 

        // 4. Send via requested channels
        const promises = [];
        if (effectiveChannels.includes('email') && user.email) {
            console.log(`[Notification Service] Sending EMAIL to ${user.email} for event ${eventType}`);
            // promises.push(emailService.send(user.email, subject, body, htmlBody));
            promises.push(new Promise(resolve => setTimeout(resolve, 60))); // Simulate email send
        }
        if (effectiveChannels.includes('sms') && user.phoneNumber) {
            console.log(`[Notification Service] Sending SMS to ${user.phoneNumber} for event ${eventType}`);
             // promises.push(smsService.send(user.phoneNumber, body)); // SMS usually uses plain text body
             promises.push(new Promise(resolve => setTimeout(resolve, 70))); // Simulate SMS send
        }
        if (effectiveChannels.includes('inApp')) {
            console.log(`[Notification Service] Creating IN-APP notification for user ${userId}, event ${eventType}`);
            // promises.push(createInAppNotification(userId, subject, body)); // Store in DB for user to see
            promises.push(new Promise(resolve => setTimeout(resolve, 20))); // Simulate in-app creation
        }

        await Promise.allSettled(promises);
        // Log any failures from Promise.allSettled results if necessary
        console.log(`[Notification Service] Finished sending notifications for event ${eventType} to user ${userId}`);

    } catch (error) {
        console.error(`[Notification Service] Failed to send notification for event ${eventType} to user ${userId}:`, error);
        // Don't necessarily throw an error that stops the parent process, 
        // maybe just log it, unless notification failure is critical.
        // throw error instanceof ApiError ? error : ApiError.internal('Notification sending failed.', error);
    }
};

/**
 * Constructs the notification message content based on the event.
 * 
 * @param {string} eventType 
 * @param {object} data 
 * @param {object} user
 * @returns {{subject: string, body: string, htmlBody?: string}} 
 */
const constructMessage = (eventType, data, user) => {
    // In a real app, use templating engine (Handlebars, EJS) and load templates from files/DB
    const petName = data.petName || 'your pet';
    const vaccineType = data.vaccineType || 'a vaccine';

    switch (eventType) {
        case 'vaccination_verified':
            return {
                subject: `Vaccination Record Verified for ${petName}!`,
                body: `Good news! Your submitted vaccination record for ${vaccineType} (Record ID: ${data.recordId}) for ${petName} has been successfully verified. You can view the details in your pet's profile.`, 
                htmlBody: `<p>Good news!</p><p>Your submitted vaccination record for <strong>${vaccineType}</strong> (Record ID: ${data.recordId}) for <strong>${petName}</strong> has been successfully verified.</p><p>You can view the details in your pet's profile.</p>`
            };
        case 'vaccination_rejected':
            return {
                subject: `Action Required: Vaccination Record for ${petName}`,
                body: `There was an issue verifying the vaccination record for ${vaccineType} (Record ID: ${data.recordId}) for ${petName}. Reason: ${data.rejectionReason || 'See details in app'}. Please review the record and contact support or your vet if needed.`, 
                htmlBody: `<p>Action Required</p><p>There was an issue verifying the vaccination record for <strong>${vaccineType}</strong> (Record ID: ${data.recordId}) for <strong>${petName}</strong>.</p><p>Reason: ${data.rejectionReason || 'See details in app'}</p><p>Please review the record and contact support or your vet if needed.</p>`
            };
        case 'vaccination_expiring':
            const days = data.daysUntilExpiry;
            return {
                subject: `Vaccination Expiring Soon for ${petName}`,
                body: `Heads up! The ${vaccineType} vaccination for ${petName} is set to expire on ${new Date(data.expiryDate).toLocaleDateString()} (in ${days} day${days !== 1 ? 's' : ''}). Please schedule a booster if required.`, 
                htmlBody: `<p>Heads up!</p><p>The <strong>${vaccineType}</strong> vaccination for <strong>${petName}</strong> is set to expire on <strong>${new Date(data.expiryDate).toLocaleDateString()}</strong> (in ${days} day${days !== 1 ? 's' : ''}).</p><p>Please schedule a booster if required.</p>`
            };
        case 'vaccination_review_needed': // Notification for Admin/Vet
             return {
                subject: `Vaccination Record Needs Review: ${petName} - ${vaccineType}`,
                body: `A vaccination record for ${petName} (Vaccine: ${vaccineType}, Record ID: ${data.recordId}) requires manual review. Issues noted: ${data.issues?.join('; ') || 'N/A'}. Please check the verification queue.`, 
                // htmlBody: ... (similar, maybe with link)
            };
        // Add other event types (e.g., certificate_ready, shared_access_granted)
        default:
            return { subject: null, body: null };
    }
};

// --- Placeholder for In-App Notification Storage ---
// const createInAppNotification = async (userId, subject, body) => { ... };

module.exports = {
    sendNotification,
}; 