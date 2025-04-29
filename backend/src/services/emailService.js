'use strict';

const nodemailer = require('nodemailer');
const config = require('../config/config');

// Ensure required configuration is present
if (!config.email.user || !config.email.password) {
  console.error('Email configuration missing: Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set.');
  // Depending on the application's needs, you might throw an error here
  // or disable email functionality.
  // For now, we log the error and allow the application to continue,
  // but email sending will fail.
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.password // Use the app password from config
  }
});

async function sendMail(to, subject, text, html) {
  if (!config.email.user || !config.email.password) {
    console.error('Cannot send email due to missing configuration.');
    // Optionally throw an error or return a specific status
    return Promise.reject(new Error('Email service not configured.'));
  }

  const mailOptions = {
    from: config.email.from, // Use the configured from address
    to: to, 
    subject: subject, 
    text: text, 
    html: html 
  };

  try {
    console.log(`Attempting to send email to ${to} with subject "${subject}"`);
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log the specific error for debugging
    console.error(`Failed to send email to ${to}. Error: ${error.message}`);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = {
  sendMail
}; 