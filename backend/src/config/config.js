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
    // Gmail configuration
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
    from: process.env.EMAIL_FROM || 'Visiting Vet <noreply@visitingvet.com>'
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