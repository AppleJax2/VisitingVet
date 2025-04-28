const asyncHandler = require('../middleware/asyncHandler');
const Pet = require('../models/Pet');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../config/constants');

// Helper function to check access rights (Owner or Provider who has treated the pet)
const checkPetAccess = async (petId, userId, userRole) => {
    const pet = await Pet.findById(petId).select('owner medicalRecords.enteredBy');
    if (!pet) {
        return { access: false, pet: null, error: new ErrorResponse(`Pet not found with id ${petId}`, 404) };
    }

    // Owner always has access
    if (pet.owner.toString() === userId) {
        return { access: true, pet: pet };
    }
    
    // Providers need more complex logic (e.g., based on past appointments, explicit sharing)
    // For now, let's allow any logged-in user (provider/clinic) to add records, 
    // but restrict viewing/editing based on record visibility later.
    // A provider who entered a record should be able to edit/delete it.
    // TODO: Refine provider access logic based on appointments or sharing mechanism.
    if ([ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin].includes(userRole)) {
         return { access: true, pet: pet }; // Temporary broad access for providers/clinics/admins
    }

    return { access: false, pet: pet, error: new ErrorResponse('User not authorized to access this pet\'s records', 403) };
};

/**
 * @desc    Add a medical record entry for a pet
 * @route   POST /api/v1/pets/:petId/medical-records
 * @access  Private (PetOwner, MVSProvider, Clinic, Admin)
 */
exports.addMedicalRecord = asyncHandler(async (req, res, next) => {
    const { petId } = req.params;
    const { recordType, date, title, details, documentUrl, visibility } = req.body;
    const enteredById = req.user.id;
    const userRole = req.user.role;

    // Validate input
    if (!recordType || !date || !title || !details || !visibility) {
        return next(new ErrorResponse('Missing required fields for medical record', 400));
    }

    // Validate access
    const { access, error: accessError } = await checkPetAccess(petId, enteredById, userRole);
    if (!access) return next(accessError);

    const pet = await Pet.findById(petId);
    if (!pet) return next(new ErrorResponse(`Pet not found with id ${petId}`, 404)); // Re-check after access check

    const newRecord = {
        recordType,
        date,
        title,
        details,
        documentUrl,
        visibility: visibility || (userRole === ROLES.PetOwner ? 'OwnerOnly' : 'AllSharedProviders'), // Default visibility based on role
        enteredBy: enteredById
    };

    pet.medicalRecords.push(newRecord);
    await pet.save();

    // Find the newly added record (Mongoose adds _id upon pushing)
    const addedRecord = pet.medicalRecords[pet.medicalRecords.length - 1];

    res.status(201).json({ success: true, data: addedRecord });
});

/**
 * @desc    Get medical records for a pet (respecting visibility)
 * @route   GET /api/v1/pets/:petId/medical-records
 * @access  Private (PetOwner, MVSProvider, Clinic, Admin)
 */
exports.getMedicalRecords = asyncHandler(async (req, res, next) => {
    const { petId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate access
    const { access, pet, error: accessError } = await checkPetAccess(petId, userId, userRole);
    if (!access) return next(accessError);

    let visibleRecords = [];
    if (pet.owner.toString() === userId || userRole === ROLES.Admin) {
        // Owner and Admin see everything
        visibleRecords = pet.medicalRecords;
    } else if ([ROLES.MVSProvider, ROLES.Clinic].includes(userRole)) {
        // Providers/Clinics see 'AllSharedProviders' and records they entered
        // TODO: Add logic for 'SpecificProviders' visibility if implemented
        visibleRecords = pet.medicalRecords.filter(record => 
            record.visibility === 'AllSharedProviders' || record.enteredBy.toString() === userId
        );
    } // No access for other roles implicitly handled by checkPetAccess

    // Populate enteredBy field for display
    const populatedRecords = await Pet.populate(visibleRecords, { path: 'enteredBy', select: 'name role' });

    // Sort records by date descending
    populatedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // TODO: Implement filtering (req.query.recordType, req.query.startDate, etc.)
    // TODO: Implement pagination

    res.status(200).json({ success: true, count: populatedRecords.length, data: populatedRecords });
});

/**
 * @desc    Update a specific medical record entry
 * @route   PUT /api/v1/pets/:petId/medical-records/:recordId
 * @access  Private (Owner or User who entered the record)
 */
exports.updateMedicalRecord = asyncHandler(async (req, res, next) => {
    const { petId, recordId } = req.params;
    const { recordType, date, title, details, documentUrl, visibility } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate access to pet
    const { access, pet, error: accessError } = await checkPetAccess(petId, userId, userRole);
    if (!access) return next(accessError);

    // Find the specific record within the pet's records
    const record = pet.medicalRecords.id(recordId);
    if (!record) {
        return next(new ErrorResponse(`Medical record not found with ID ${recordId} for pet ${petId}`, 404));
    }

    // Authorization: Only owner or the user who entered the record can update?
    // Admin override?
    if (pet.owner.toString() !== userId && record.enteredBy.toString() !== userId && userRole !== ROLES.Admin) {
        return next(new ErrorResponse('User not authorized to update this medical record', 403));
    }

    // Update fields selectively
    if (recordType) record.recordType = recordType;
    if (date) record.date = date;
    if (title) record.title = title;
    if (details) record.details = details;
    if (documentUrl !== undefined) record.documentUrl = documentUrl; // Allow setting empty string
    if (visibility) record.visibility = visibility;
    
    // Mark the array element as modified (important for subdocuments)
    pet.markModified('medicalRecords');
    await pet.save();

    res.status(200).json({ success: true, data: record });
});

/**
 * @desc    Delete a specific medical record entry
 * @route   DELETE /api/v1/pets/:petId/medical-records/:recordId
 * @access  Private (Owner or User who entered the record)
 */
exports.deleteMedicalRecord = asyncHandler(async (req, res, next) => {
    const { petId, recordId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate access to pet
    const { access, pet, error: accessError } = await checkPetAccess(petId, userId, userRole);
    if (!access) return next(accessError);

    // Find the specific record
    const record = pet.medicalRecords.id(recordId);
    if (!record) {
        return next(new ErrorResponse(`Medical record not found with ID ${recordId} for pet ${petId}`, 404));
    }

    // Authorization: Only owner or the user who entered the record can delete?
    // Admin override?
    if (pet.owner.toString() !== userId && record.enteredBy.toString() !== userId && userRole !== ROLES.Admin) {
        return next(new ErrorResponse('User not authorized to delete this medical record', 403));
    }

    // Remove the subdocument using Mongoose methods
    record.remove(); // Or pet.medicalRecords.pull(recordId); 
    
    await pet.save();

    res.status(200).json({ success: true, data: {} });
}); 