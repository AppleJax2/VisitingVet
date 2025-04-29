'use strict';

const config = require('../config/config');
// const twilio = require('twilio'); // Uncomment if using Twilio and install the package

// Placeholder credentials - Replace with actual credentials from config or environment variables
const accountSid = config.twilioAccountSid || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your Account SID
const authToken = config.twilioAuthToken || 'your_auth_token'; // Replace with your Auth Token
const twilioPhoneNumber = config.twilioPhoneNumber || '+15005550006'; // Replace with your Twilio number

// const client = twilio(accountSid, authToken); // Uncomment if using Twilio

async function sendSms(to, body) {
  console.log(`Attempting to send SMS to ${to}: "${body}"`);

  // Placeholder implementation - Replace with actual Twilio API call
  if (!to || !body) {
    console.error('SMS \'to\' or \'body\' is missing.');
    throw new Error('Missing recipient or message body for SMS.');
  }

  if (process.env.NODE_ENV !== 'production') {
     console.log(`Skipping actual SMS send in non-production environment.`);
     return { sid: 'SM_placeholder_non_prod' };
  }
  
  try {
    // Uncomment and use the client if Twilio is set up
    /*
    const message = await client.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: to
    });
    console.log('SMS sent successfully with SID:', message.sid);
    return message;
    */
    
    // Simulating success for now without actual Twilio dependency
    console.log('Simulated SMS send success (replace with actual implementation).');
    return { sid: 'SM_placeholder_simulated' }; 

  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

module.exports = {
  sendSms
}; 