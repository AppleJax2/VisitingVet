const { VaccinationRecord, VerificationStatus } = require('../models/VaccinationRecord');
const ApiError = require('../errors/ApiError');
// const ocrService = require('./ocrService'); // Needed if re-processing or checking OCR confidence
// const notificationService = require('./notificationService'); // To notify on status change
// const Pet = require('../models/Pet'); // Needed to update Pet summary status

/**
 * Validates the authenticity and correctness of a vaccination record based on rules.
 * 
 * @param {VaccinationRecord} record - The vaccination record object.
 * @param {object} ocrData - Optional OCR results ({ extractedText, mappedFields }) if available.
 * @returns {Promise<{isValid: boolean, issues: string[], requiresManualReview: boolean}>} 
 *          - isValid: Boolean indicating if the record passes automated checks.
 *          - issues: Array of strings describing validation failures.
 *          - requiresManualReview: Boolean indicating if it needs admin/vet review.
 */
const applyValidationRules = async (record, ocrData = null) => {
    console.log(`[Verification Service] Applying validation rules for record: ${record._id}`);
    const issues = [];
    let isValid = true;
    let requiresManualReview = false;

    // Rule 1: Check required fields
    if (!record.vaccineType || !record.administrationDate) {
        issues.push('Missing required fields (vaccine type or administration date).');
        isValid = false;
    }

    // Rule 2: Check date logic
    if (record.expirationDate && record.administrationDate > record.expirationDate) {
        issues.push('Administration date cannot be after expiration date.');
        isValid = false;
    }
    // Add check if administrationDate is in the future? 

    // Rule 3: Check OCR Confidence (if available and record has URL)
    if (record.originalRecordUrl && ocrData && ocrData.mappedFields) {
        const confidence = ocrData.mappedFields.confidenceScore || 0.0;
        console.log(`[Verification Service] OCR Confidence Score: ${confidence}`);
        if (confidence < 0.5) { // Example threshold
            issues.push(`Low OCR confidence score (${confidence.toFixed(2)}). Manual review recommended.`);
            requiresManualReview = true;
            // Depending on policy, low confidence might not automatically invalidate, but requires review
        }
        // Add checks comparing OCR fields (e.g., ocrData.mappedFields.vaccineType) vs user-entered data
        // if (ocrData.mappedFields.vaccineType && record.vaccineType.toLowerCase() !== ocrData.mappedFields.vaccineType.toLowerCase()) {
        //    issues.push('Mismatch between entered vaccine type and OCR result.');
        //    requiresManualReview = true;
        // }
    } else if (record.originalRecordUrl) {
         issues.push('OCR data not available for validation, manual review might be needed.');
         requiresManualReview = true; // If doc exists but no OCR, likely needs manual check
    }

    // Rule 4: Cross-referencing (Placeholder)
    // - Check against known vaccine types?
    // - Check against vet credentials (if verifier field is used differently)?
    // if (record.verifier) { /* Validate verifier */ }

    // Rule 5: Fraud Detection (Placeholder)
    // - Look for signs of tampering in document (requires image analysis service)?
    // - Check for duplicate record submissions?

    console.log(`[Verification Service] Validation complete for record ${record._id}. Issues: ${issues.length}, Requires Review: ${requiresManualReview}`);
    await new Promise(resolve => setTimeout(resolve, 30)); // Simulate async rules engine
    
    // Final decision: If any critical rule failed, it's invalid.
    // Otherwise, validity might depend on whether manual review is required and passed.
    // For now, just return direct validity based on rules run.
    return { isValid, issues, requiresManualReview };
};

/**
 * Initiates the verification workflow for a given vaccination record.
 * 
 * @param {string} recordId - The ID of the VaccinationRecord to verify.
 * @returns {Promise<VaccinationRecord>} - The updated vaccination record object.
 * @throws {ApiError} - Throws error if record not found or verification fails.
 */
const startVerificationWorkflow = async (recordId) => {
    console.log(`[Verification Service] Starting workflow for record: ${recordId}`);
    try {
        // Populate pet owner for notifications
        const record = await VaccinationRecord.findById(recordId).populate({ 
            path: 'pet', 
            select: 'owner name' // Select owner ID and name
        }); 
        if (!record) {
            throw ApiError.notFound('Vaccination record not found.');
        }
        if (!record.pet || !record.pet.owner) {
            // This shouldn't happen if population works and pet has owner, but good to check
            console.error(`[Verification Service] Could not find pet owner for record ${recordId}. Cannot send notifications.`);
            // Optionally throw error or proceed without notification
        }

        // Only process records that are pending
        if (record.verificationStatus !== VerificationStatus.PENDING) {
            console.log(`[Verification Service] Record ${recordId} is not pending (${record.verificationStatus}). Skipping.`);
            return record;
        }

        // --- Step 1: Gather necessary data (e.g., OCR results if not already done) ---
        let ocrResults = null;
        if (record.originalRecordUrl && !record.ocrProcessedText) {
            // Option 1: Run OCR here if not done during upload
             console.log(`[Verification Service] Running OCR for record ${recordId}...`);
            // ocrResults = await ocrService.processDocument(record.originalRecordUrl);
            // record.ocrProcessedText = ocrResults.extractedText;
            // TODO: Potentially save mapped fields from OCR back to the record if desired?
        } else if (record.ocrProcessedText) {
             // Option 2: Assume OCR text is on record, maybe re-run mapping/confidence scoring
             console.log(`[Verification Service] Using existing OCR text for record ${recordId}.`);
             // ocrResults = { extractedText: record.ocrProcessedText, mappedFields: await ocrService.mapTextToFields(record.ocrProcessedText) };
             // For placeholder:
             ocrResults = { extractedText: record.ocrProcessedText, mappedFields: { confidenceScore: 0.8 } }; 
        } else {
             console.log(`[Verification Service] No document URL for record ${recordId}. Cannot perform OCR-based validation.`);
        }

        // --- Step 2: Apply Validation Rules --- 
        const { isValid, issues, requiresManualReview } = await applyValidationRules(record, ocrResults);

        // --- Step 3: Update Record Status --- 
        let finalStatus = record.verificationStatus;
        const ownerId = record.pet?.owner ? String(record.pet.owner) : null;
        let notificationType = null;
        let notificationData = {};

        if (!isValid) {
            finalStatus = VerificationStatus.REJECTED;
            record.rejectionReason = issues.join('; '); // Set rejection reason
            console.log(`[Verification Service] Record ${recordId} REJECTED. Reasons: ${record.rejectionReason}`);
            notificationType = 'vaccination_rejected';
            notificationData = { recordId: record._id, petName: record.pet?.name, vaccineType: record.vaccineType, rejectionReason: record.rejectionReason };
            // if (ownerId) {
            //    notificationService.send(ownerId, notificationType, notificationData).catch(/*...*/); 
            // }
        } else if (requiresManualReview) {
            // Status remains PENDING, but might flag for admin dashboard
            console.log(`[Verification Service] Record ${recordId} requires MANUAL REVIEW. Issues: ${issues.join('; ')}`);
            // Optionally, add a flag to the record or trigger a different notification
            // record.needsManualReview = true; 
            notificationType = 'vaccination_review_needed'; // Notify Admin
            notificationData = { recordId: record._id, petName: record.pet?.name, vaccineType: record.vaccineType, issues: issues };
            // const adminUserId = 'adminUserIdPlaceholder'; // TODO: Get admin user IDs
            // notificationService.send(adminUserId, notificationType, notificationData).catch(/*...*/);
        } else {
            // Passed automated checks, no manual review needed
            finalStatus = VerificationStatus.VERIFIED;
            record.verifier = null; // Mark as automatically verified (or system user ID)
            record.verifiedAt = new Date();
            record.rejectionReason = undefined; // Clear rejection reason
            console.log(`[Verification Service] Record ${recordId} automatically VERIFIED.`);
            notificationType = 'vaccination_verified';
            notificationData = { recordId: record._id, petName: record.pet?.name, vaccineType: record.vaccineType };
            // if (ownerId) {
            //    notificationService.send(ownerId, notificationType, notificationData).catch(/*...*/);
            // }
        }

        // Only save and notify if status actually changed
        if (finalStatus !== record.verificationStatus) {
             record.verificationStatus = finalStatus;
             const updatedRecord = await record.save();

             // Send notification if owner exists and status changed
             if (ownerId && (notificationType === 'vaccination_verified' || notificationType === 'vaccination_rejected')) {
                  console.log(`[Verification Service] Triggering notification ${notificationType} for owner ${ownerId}`);
                 // notificationService.sendNotification(ownerId, notificationType, notificationData).catch(err => console.error(`Failed to send ${notificationType} notification:`, err));
             }
             // Send admin notification if review needed
             if (notificationType === 'vaccination_review_needed') {
                 // const adminUserId = 'adminUserIdPlaceholder'; 
                 // console.log(`[Verification Service] Triggering notification ${notificationType} for admin ${adminUserId}`);
                 // notificationService.sendNotification(adminUserId, notificationType, notificationData).catch(err => console.error(`Failed to send ${notificationType} notification:`, err));
             }

             // --- Step 4: Update Pet Summary Status (important!) ---
             // Trigger this after status is confirmed changed and saved
             updatePetVerificationSummary(record.pet._id).catch(err => {
                 console.error(`Error triggering pet summary update for ${record.pet._id} after workflow:`, err);
             });
             
             console.log(`[Verification Service] Workflow finished for record ${recordId}. Final status: ${finalStatus}`);
             return updatedRecord;
        } else {
            console.log(`[Verification Service] Record ${recordId} status unchanged (${finalStatus}). No save or notification needed.`);
            return record; // Return original record if no changes
        }

    } catch (error) {
        console.error(`[Verification Service] Error during verification workflow for record ${recordId}:`, error);
        // Rethrow or handle appropriately
        throw error instanceof ApiError ? error : ApiError.internal(`Verification workflow failed for record ${recordId}.`, error);
    }
};

/**
 * Updates the summary status flags on the Pet model based on its vaccination records.
 * (Placeholder - This logic could be complex and might involve fetching all records)
 * 
 * @param {string} petId - The ID of the Pet to update.
 */
const updatePetVerificationSummary = async (petId) => {
     console.log(`[Verification Service] Updating verification summary for Pet ID: ${petId}`);
     // Fetch the pet
     // const pet = await Pet.findById(petId);
     // if (!pet) return;
     // Fetch all vaccination records for the pet
     // const records = await VaccinationRecord.find({ pet: petId }).select('verificationStatus expirationDate');
     
     // Determine summary status based on records (Simplified Example)
     // let hasPending = false;
     // let hasRejectedOrExpired = false;
     // const now = new Date();
     // for (const record of records) {
     //    if (record.verificationStatus === VerificationStatus.PENDING) hasPending = true;
     //    if (record.verificationStatus === VerificationStatus.REJECTED) hasRejectedOrExpired = true;
     //    if (record.expirationDate && record.expirationDate < now && record.verificationStatus === VerificationStatus.VERIFIED) hasRejectedOrExpired = true; 
     // }

     // let summary = 'Unknown';
     // if (hasPending) summary = 'Pending';
     // else if (hasRejectedOrExpired) summary = 'Needs Attention';
     // else if (records.length > 0) summary = 'Up-to-date'; // Assuming if no pending/rejected/expired, it's up-to-date
     
     // pet.hasPendingVerification = hasPending;
     // pet.latestVerificationStatusSummary = summary;
     // await pet.save();

     await new Promise(resolve => setTimeout(resolve, 20)); // Simulate async update
     console.log(`[Verification Service] Pet summary update simulation complete for Pet ID: ${petId}`);
};


module.exports = {
    startVerificationWorkflow,
    applyValidationRules,
    updatePetVerificationSummary, // Expose if needed externally
};
