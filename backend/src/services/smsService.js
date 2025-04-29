'use strict';

const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const config = require('../config/config');

// Validate AWS configuration
const requiredAwsConfig = ['accessKeyId', 'secretAccessKey', 'region'];
const missingAwsConfig = requiredAwsConfig.filter(key => !config.aws[key]);

let snsClient;
if (missingAwsConfig.length > 0) {
  console.error(`AWS SNS configuration missing or incomplete: Missing ${missingAwsConfig.join(', ')}. SMS functionality will be disabled.`);
  // Optionally throw an error during startup if AWS config is critical
} else {
  snsClient = new SNSClient({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    }
  });
  console.log(`AWS SNS Client configured for region: ${config.aws.region}`);
}

// Basic E.164 format validation (simplified)
function isValidE164(phoneNumber) {
  return /^\+[1-9]\d{1,14}$/.test(phoneNumber);
}

async function sendSms(to, body) {
  if (!snsClient) {
    console.error('AWS SNS Client not initialized due to missing configuration. Cannot send SMS.');
    throw new Error('SMS service is not configured.');
  }

  if (!to || !body) {
    console.error('Missing recipient phone number or message body for SMS.');
    throw new Error('Missing recipient or message body for SMS.');
  }

  // Ensure phone number is in E.164 format for SNS
  if (!isValidE164(to)) {
      console.error(`Invalid phone number format for SNS: ${to}. Must be E.164 (e.g., +12223334444).`);
      // Consider attempting normalization or throwing error
      // For now, we throw an error
      throw new Error(`Invalid phone number format: ${to}. Use E.164 format.`);
  }

  console.log(`Attempting to send SMS via AWS SNS to ${to}`);

  const params = {
    Message: body,
    PhoneNumber: to,
    // You can optionally set MessageAttributes for sender ID, SMS type (Promotional/Transactional), etc.
    // MessageAttributes: {
    //   'AWS.SNS.SMS.SenderID': { 'DataType': 'String', 'StringValue': 'YourSenderID' },
    //   'AWS.SNS.SMS.SMSType': { 'DataType': 'String', 'StringValue': 'Transactional' }
    // }
  };

  try {
    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    console.log('SMS sent successfully via AWS SNS. Message ID:', data.MessageId);
    return { success: true, messageId: data.MessageId };
  } catch (error) {
    console.error('Error sending SMS via AWS SNS:', error);
    // Log specific details for debugging
    console.error(`Failed to send SNS message to ${to}. AWS Error: ${error.message}`);
    // Check for specific AWS SDK errors if needed
    // if (error.name === 'SomeAwsSpecificError') { ... }
    throw error; // Re-throw the error for the caller to handle
  }
}

module.exports = {
  sendSms
}; 