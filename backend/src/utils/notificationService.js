const Notification = require('../models/Notification');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * Send an in-app notification to a user
 * @param {Object} options - Notification options
 * @param {String} options.userId - User ID to notify
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification message
 * @param {String} options.type - Notification type
 * @param {String} options.referenceId - Related entity ID (optional)
 * @param {String} options.referenceModel - Related entity model name (optional)
 * @param {String} options.actionUrl - URL for user action (optional)
 * @returns {Promise<Object>} The created notification
 */
const sendInAppNotification = async (options) => {
  try {
    const notification = await Notification.create({
      user: options.userId,
      title: options.title,
      message: options.message,
      type: options.type,
      referenceId: options.referenceId,
      referenceModel: options.referenceModel,
      actionUrl: options.actionUrl
    });

    return notification;
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    throw new Error('Failed to send in-app notification');
  }
};

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message (HTML supported)
 * @returns {Promise<Boolean>} Success status
 */
const sendEmailNotification = async (options) => {
  try {
    // TODO: Implement actual email sending (e.g., Nodemailer, SendGrid, etc.)
    console.log(`[EMAIL NOTIFICATION] To: ${options.email}, Subject: ${options.subject}`);
    console.log(`[EMAIL CONTENT] ${options.message}`);
    
    // For now, we'll just simulate success
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

/**
 * Send an SMS notification
 * @param {Object} options - SMS options
 * @param {String} options.phoneNumber - Recipient phone number
 * @param {String} options.message - SMS message
 * @returns {Promise<Boolean>} Success status
 */
const sendSmsNotification = async (options) => {
  try {
    // TODO: Implement actual SMS sending (e.g., Twilio, Nexmo, etc.)
    console.log(`[SMS NOTIFICATION] To: ${options.phoneNumber}`);
    console.log(`[SMS CONTENT] ${options.message}`);
    
    // For now, we'll just simulate success
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};

/**
 * Send appointment notifications
 * @param {Object} options - Notification options
 * @param {String} options.appointmentId - Appointment ID
 * @param {String} options.notificationType - Type of notification
 * @param {String} options.message - Custom message (optional)
 * @returns {Promise<Object>} Result with success status
 */
const sendAppointmentNotification = async (options) => {
  try {
    const appointment = await Appointment.findById(options.appointmentId)
      .populate('petOwner')
      .populate('providerProfile')
      .populate({
        path: 'providerProfile',
        populate: {
          path: 'user'
        }
      })
      .populate('service');
      
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    const petOwner = appointment.petOwner;
    const provider = appointment.providerProfile.user;
    
    if (!petOwner || !provider) {
      throw new Error('Users not found for notification');
    }
    
    // Default messages by notification type
    const defaultMessages = {
      Created: {
        petOwner: `Your appointment request for ${appointment.service.name} has been submitted and is awaiting confirmation.`,
        provider: `New appointment request for ${appointment.service.name}.`
      },
      Updated: {
        petOwner: `Your appointment for ${appointment.service.name} has been updated.`,
        provider: `Appointment for ${appointment.service.name} has been updated.`
      },
      Reminder: {
        petOwner: `Reminder: Your appointment for ${appointment.service.name} is scheduled for ${new Date(appointment.appointmentTime).toLocaleString()}.`,
        provider: `Reminder: Appointment for ${appointment.service.name} is scheduled for ${new Date(appointment.appointmentTime).toLocaleString()}.`
      },
      Cancelled: {
        petOwner: `Your appointment for ${appointment.service.name} has been cancelled.`,
        provider: `Appointment for ${appointment.service.name} has been cancelled.`
      },
      Completed: {
        petOwner: `Your appointment for ${appointment.service.name} has been marked as completed.`,
        provider: `Appointment for ${appointment.service.name} has been marked as completed.`
      }
    };
    
    // Create notification records
    const notificationPromises = [];
    
    // Pet owner notification
    notificationPromises.push(
      sendInAppNotification({
        userId: petOwner._id,
        title: `Appointment ${options.notificationType}`,
        message: options.message || defaultMessages[options.notificationType].petOwner,
        type: 'appointment_update',
        referenceId: appointment._id,
        referenceModel: 'Appointment',
        actionUrl: '/my-appointments'
      })
    );
    
    // Provider notification
    notificationPromises.push(
      sendInAppNotification({
        userId: provider._id,
        title: `Appointment ${options.notificationType}`,
        message: options.message || defaultMessages[options.notificationType].provider,
        type: 'appointment_update',
        referenceId: appointment._id,
        referenceModel: 'Appointment',
        actionUrl: '/provider-appointments'
      })
    );
    
    // Send email notifications
    notificationPromises.push(
      sendEmailNotification({
        email: petOwner.email,
        subject: `Visiting Vet Appointment ${options.notificationType}`,
        message: options.message || defaultMessages[options.notificationType].petOwner
      })
    );
    
    notificationPromises.push(
      sendEmailNotification({
        email: provider.email,
        subject: `Visiting Vet Appointment ${options.notificationType}`,
        message: options.message || defaultMessages[options.notificationType].provider
      })
    );
    
    // Track the notification in appointment
    appointment.notifications.push({
      type: options.notificationType,
      sentTo: 'Both',
      channel: 'Email',
      sentAt: new Date()
    });
    
    await appointment.save();
    await Promise.all(notificationPromises);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending appointment notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInAppNotification,
  sendEmailNotification,
  sendSmsNotification,
  sendAppointmentNotification
}; 