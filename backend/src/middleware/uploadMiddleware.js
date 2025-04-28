const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Define storage location and filename strategy
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save pet images to public/uploads/pets
        // Ensure this directory exists (handled in controller for now, but could be here)
        cb(null, path.join(__dirname, '../../public/uploads/pets')); 
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check the extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check the mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); // Accept file
    } else {
        cb(new ErrorResponse('Images only! (jpeg, jpg, png, gif)', 400), false); // Reject file
    }
};

// Configure multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB file size limit
    },
    fileFilter: fileFilter
});

// Export a middleware function for handling single file uploads
// 'profileImage' should match the name attribute of the file input in the frontend form
const uploadSingleImage = (fieldName) => (req, res, next) => {
     const multerUpload = upload.single(fieldName); 
     multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred (e.g., file too large)
             let message = 'File upload error';
             if (err.code === 'LIMIT_FILE_SIZE') {
                 message = 'Image is too large. Maximum size is 5MB.';
             }
             return next(new ErrorResponse(message, 400));
        } else if (err) {
            // An unknown error occurred (e.g., file type filter)
            return next(err); // Pass the ErrorResponse from fileFilter
        }
        // Everything went fine, proceed to the controller
        next();
    });
};

module.exports = { uploadSingleImage }; 