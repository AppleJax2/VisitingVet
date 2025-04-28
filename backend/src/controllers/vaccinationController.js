const { VaccinationRecord, VerificationStatus } = require('../models/VaccinationRecord');
const Pet = require('../models/Pet'); // Needed to link record to pet
const ApiError = require('../errors/ApiError');
const { validationResult } = require('express-validator');

// --- Import Services ---
// const ocrService = require('../services/ocrService');
const storageService = require('../services/documentSecurityService'); // Use secure service
const verificationService = require('../services/verificationService'); // For updating pet status
const notificationService = require('../services/notificationService'); // For sending notifications
// -----------------------

// Helper function to check provider access (Placeholder)
// In a real app, this would involve checking shared access records, clinic memberships, etc.
const checkProviderAccess = async (userId, petId) => {
    // Placeholder: Allow if user role is admin or veterinarian for now
    // const user = await User.findById(userId);
    // if (user && (user.role === 'admin' || user.role === 'veterinarian')) return true;
    console.warn(`[Auth Placeholder] Provider access check for User ${userId} on Pet ${petId} is not fully implemented.`);
    // return false; // Default deny
    return true; // Allow for simulation purposes
};

// Controller function to create a new vaccination record
exports.createVaccinationRecord = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(ApiError.badRequest('Validation failed', errors.array()));
    }

    const { petId, vaccineType, administrationDate, expirationDate } = req.body;
    const documentFile = req.file; // Assuming multer middleware puts file here
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    try {
        const pet = await Pet.findOne({ _id: petId, owner: userId }); // Ensure pet exists and belongs to user
        if (!pet) {
            return next(ApiError.notFound('Pet not found or access denied.'));
        }

        let originalRecordUrl = null;
        let ocrProcessedText = null;

        // Handle document upload using secure service
        if (documentFile) {
            try {
                const uniqueFileName = `vaccinations/${petId}/${Date.now()}-${documentFile.originalname}`;
                originalRecordUrl = await storageService.secureUpload(
                    documentFile.buffer, // Assuming multer uses memory storage
                    uniqueFileName,
                    documentFile.mimetype
                );
                console.log(`[Controller] Document uploaded to: ${originalRecordUrl}`);
                // Optional: Trigger OCR immediately (or let verification service handle it)
                // const ocrResult = await ocrService.processDocument(originalRecordUrl);
                // ocrProcessedText = ocrResult?.extractedText;
            } catch (uploadError) {
                 console.error("Error during document upload or OCR:", uploadError);
                 // Decide if upload failure should prevent record creation
                 return next(ApiError.internal('Failed to process uploaded document.', uploadError));
            }
        }

        const newRecord = new VaccinationRecord({
            pet: petId,
            vaccineType,
            administrationDate,
            expirationDate,
            originalRecordUrl, // Add URL if uploaded
            ocrProcessedText, // Add OCR text if processed
            verificationStatus: VerificationStatus.PENDING, // Default status
            // enteredBy: userId, // Maybe add if needed later
        });

        const savedRecord = await newRecord.save();

        // Add record reference to Pet model
        pet.vaccinationHistory.push(savedRecord._id);
        // Trigger Pet summary update (fire-and-forget, service handles errors)
        verificationService.updatePetVerificationSummary(petId).catch(err => {
             console.error(`Error triggering pet summary update for ${petId}:`, err);
        });
        await pet.save(); // Save the pet with the new record ref

        // Optional: Trigger verification workflow immediately
        verificationService.startVerificationWorkflow(savedRecord._id).catch(err => {
            console.error(`Error triggering verification workflow for ${savedRecord._id}:`, err);
        });

        res.status(201).json({
            message: 'Vaccination record created successfully and pending verification.',
            record: savedRecord
        });

    } catch (error) {
        next(ApiError.internal('Failed to create vaccination record', error));
    }
};

// Controller function to get vaccination records for a specific pet
exports.getVaccinationRecordsByPet = async (req, res, next) => {
    const { petId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        // Verify user owns the pet or has provider access
        const pet = await Pet.findById(petId).select('owner'); // Select only owner field
        if (!pet) {
            return next(ApiError.notFound('Pet not found.'));
        }

        const isOwner = String(pet.owner) === userId;
        const hasProviderAccess = await checkProviderAccess(userId, petId);

        if (!isOwner && !hasProviderAccess) {
            return next(ApiError.forbidden('Access denied to this pet\'s records.'));
        }

        const records = await VaccinationRecord.find({ pet: petId })
                                             .sort({ administrationDate: -1 }); // Sort by date

        res.status(200).json({ records });

    } catch (error) {
        next(ApiError.internal('Failed to retrieve vaccination records', error));
    }
};

// Controller function to get a single vaccination record by ID
exports.getVaccinationRecordById = async (req, res, next) => {
    const { recordId } = req.params;
    const userId = req.user.id;

    try {
        const record = await VaccinationRecord.findById(recordId).populate({
             path: 'pet',
             select: 'owner name' // Only select owner and name from Pet
        });
        if (!record) {
            return next(ApiError.notFound('Vaccination record not found.'));
        }

        // Security Check: Ensure the user has permission to view this record
        const isOwner = String(record.pet.owner) === userId;
        const hasProviderAccess = await checkProviderAccess(userId, record.pet._id);

        if (!isOwner && !hasProviderAccess) {
             return next(ApiError.forbidden('Access denied to this record.'));
        }

        res.status(200).json({ record });

    } catch (error) {
        next(ApiError.internal('Failed to retrieve vaccination record', error));
    }
};

// Controller function to update a vaccination record (e.g., verification status by admin/vet)
exports.updateVaccinationRecord = async (req, res, next) => {
    const { recordId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // Assuming role is part of user object

    // Basic validation for update data (could be more robust)
    if (updateData.verificationStatus && !Object.values(VerificationStatus).includes(updateData.verificationStatus)){
        return next(ApiError.badRequest('Invalid verification status provided.'));
    }

    try {
        const record = await VaccinationRecord.findById(recordId).populate('pet', 'owner'); // Populate pet owner for notifications
        if (!record) {
            return next(ApiError.notFound('Vaccination record not found.'));
        }

        // Authorization: Only allow certain users (Admin, Vet) to update specific fields like status
        let canUpdateStatus = (userRole === 'admin' || userRole === 'veterinarian');
        let needsNotification = false;
        let notificationType = null;
        let notificationData = {};

        // Handle status changes specifically
        if (updateData.verificationStatus && updateData.verificationStatus !== record.verificationStatus) {
            if (!canUpdateStatus) {
                 return next(ApiError.forbidden('You do not have permission to update verification status.'));
            }
            const oldStatus = record.verificationStatus;
            record.verificationStatus = updateData.verificationStatus;
            record.verifier = userId; // Log who verified/rejected
            record.verifiedAt = new Date();
            needsNotification = true; // Status changed, notify owner

            if (updateData.verificationStatus === VerificationStatus.REJECTED) {
                if (!updateData.rejectionReason) {
                    // Enforce rejection reason if rejecting
                    return next(ApiError.badRequest('Rejection reason is required when rejecting a record.'));
                }
                record.rejectionReason = updateData.rejectionReason.trim();
                notificationType = 'vaccination_rejected';
                notificationData = { recordId: record._id, petName: record.pet?.name, vaccineType: record.vaccineType, rejectionReason: record.rejectionReason };
            } else {
                record.rejectionReason = undefined; // Clear rejection reason if not rejected
                if (updateData.verificationStatus === VerificationStatus.VERIFIED) {
                     notificationType = 'vaccination_verified';
                     notificationData = { recordId: record._id, petName: record.pet?.name, vaccineType: record.vaccineType };
                }
                // No notification needed if going back to PENDING? Or maybe notify admin?
            }
             console.log(`Record ${recordId} status changed from ${oldStatus} to ${record.verificationStatus} by User ${userId}`);
        } else if (updateData.rejectionReason && record.verificationStatus === VerificationStatus.REJECTED) {
             // Allow updating rejection reason if already rejected (by admin/vet)
              if (!canUpdateStatus) {
                 return next(ApiError.forbidden('You do not have permission to update the rejection reason.'));
             }
             record.rejectionReason = updateData.rejectionReason.trim();
        }

        // TODO: Add logic for pet owners updating other fields if allowed (before verification?)

        const updatedRecord = await record.save();

        // Trigger notification service AFTER saving successfully
        if (needsNotification && notificationType && record.pet?.owner) {
            notificationService.sendNotification(
                 String(record.pet.owner), // Ensure owner ID is string
                 notificationType,
                 notificationData
             ).catch(err => console.error(`Failed to send notification for record ${recordId}:`, err));
        }

        // Trigger Pet summary update (fire-and-forget)
        verificationService.updatePetVerificationSummary(record.pet._id).catch(err => {
             console.error(`Error triggering pet summary update for ${record.pet._id} after status change:`, err);
        });

        res.status(200).json({
            message: 'Vaccination record updated successfully.',
            record: updatedRecord
        });

    } catch (error) {
        next(ApiError.internal('Failed to update vaccination record', error));
    }
};

// Controller function to delete a vaccination record
exports.deleteVaccinationRecord = async (req, res, next) => {
    const { recordId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const record = await VaccinationRecord.findById(recordId).populate('pet', 'owner');
        if (!record) {
            return next(ApiError.notFound('Vaccination record not found.'));
        }

        // Security Check: Allow owner or admin to delete
        const isOwner = String(record.pet.owner) === userId;
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
             return next(ApiError.forbidden('You do not have permission to delete this record.'));
        }

        const recordUrlToDelete = record.originalRecordUrl; // Store URL before deleting record

        await VaccinationRecord.findByIdAndDelete(recordId);

        // Remove record reference from Pet model
        const petId = record.pet._id;
        await Pet.updateOne(
            { _id: petId },
            { $pull: { vaccinationHistory: recordId } }
        );

        // Trigger Pet summary update (fire-and-forget)
         verificationService.updatePetVerificationSummary(petId).catch(err => {
             console.error(`Error triggering pet summary update for ${petId} after deletion:`, err);
        });

        // Delete associated document from storage service (fire-and-forget)
        if (recordUrlToDelete) {
             console.log(`Attempting to delete stored document: ${recordUrlToDelete}`);
             storageService.secureDelete(recordUrlToDelete, userId, recordId).catch(err => {
                 console.error(`Failed to delete document ${recordUrlToDelete} from storage:`, err);
                 // Log this failure, but don't block the main response
             });
        }

        res.status(200).json({ message: 'Vaccination record deleted successfully.' });

    } catch (error) {
        next(ApiError.internal('Failed to delete vaccination record', error));
    }
}; 