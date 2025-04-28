const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Pet = require('../models/Pet'); // To check ownership

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads/pets');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @desc    Upload profile image for a specific pet
 * @route   POST /api/v1/upload/pet-image/:petId
 * @access  Private (PetOwner)
 */
exports.uploadPetProfileImage = asyncHandler(async (req, res, next) => {
    const petId = req.params.petId;
    const userId = req.user.id;

    // 1. Check if pet exists and user is the owner
    const pet = await Pet.findById(petId);
    if (!pet) {
        return next(new ErrorResponse(`Pet not found with id ${petId}`, 404));
    }
    if (pet.owner.toString() !== userId) {
         return next(new ErrorResponse('User not authorized to update this pet', 403));
    }

    // 2. Check if file was uploaded by multer middleware
    if (!req.file) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // 3. Construct the URL path for the uploaded file
    // Assuming static serving is set up for the /public folder
    const imageUrl = `/uploads/pets/${req.file.filename}`;

    // 4. Optionally: Update pet record directly here (or let frontend handle it)
    // If updating here:
    // pet.profileImage = imageUrl;
    // await pet.save();

    // 5. Return the URL of the uploaded image
    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: { 
            imageUrl: imageUrl 
        }
    });
}); 