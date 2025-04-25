const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  app: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    apiUrl: process.env.API_URL || 'http://localhost:3000'
  },
  
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/visiting-vet'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'visiting-vet-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'Visiting Vet <support@visitingvet.com>'
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.AWS_S3_BUCKET_NAME,
    region: process.env.AWS_REGION || 'us-east-1'
  },
  
  services: {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY
    }
  }
};

module.exports = config; 