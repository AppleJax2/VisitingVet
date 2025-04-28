const express = require('express');
const { uploadPetProfileImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Route for uploading a pet profile image
// Applies authentication, checks for PetOwner role, then handles single image upload
router.post(
    '/pet-image/:petId', 
    protect, 
    authorize(ROLES.PetOwner), 
    uploadSingleImage('petImage'), // 'petImage' must match the form field name
    uploadPetProfileImage
);

// Add other upload routes here if needed (e.g., user profile pics, documents)

module.exports = router; 