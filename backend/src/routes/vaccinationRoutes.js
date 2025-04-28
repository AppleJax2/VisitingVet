const express = require('express');
const { body, param } = require('express-validator');
const vaccinationController = require('../controllers/vaccinationController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming JWT auth middleware
const roleMiddleware = require('../middleware/roleMiddleware'); // Middleware to check user roles
// const verificationService = require('../services/verificationService'); // May need for verify route
// const certificateService = require('../services/certificateService'); // May need for certificate route

const router = express.Router();

// --- Input Validation Rules ---

const createRecordValidation = [
    body('petId').isMongoId().withMessage('Valid Pet ID is required.'),
    body('vaccineType').trim().notEmpty().withMessage('Vaccine type is required.').isLength({ max: 100 }).withMessage('Vaccine type too long.'),
    body('administrationDate').isISO8601().toDate().withMessage('Valid administration date is required.'),
    body('expirationDate').optional().isISO8601().toDate().withMessage('Invalid expiration date format.'),
    // TODO: Add validation for file upload if using multer
];

const recordIdValidation = [
    param('recordId').isMongoId().withMessage('Valid Vaccination Record ID is required in URL parameter.')
];

const petIdValidation = [
    param('petId').isMongoId().withMessage('Valid Pet ID is required in URL parameter.')
];

const updateRecordValidation = [
    ...recordIdValidation, // Ensure recordId param is valid
    body('verificationStatus').optional().isIn(vaccinationController.VerificationStatus.getVerificationStatuses()).withMessage('Invalid verification status.'),
    body('rejectionReason').optional().isString().trim().isLength({ max: 500 }).withMessage('Rejection reason too long.'),
    // Add validation for other updatable fields as needed
];

// --- Routes --- 

// POST /api/vaccinations - Create a new vaccination record
// Requires authentication
router.post(
    '/',
    authMiddleware, // Ensure user is logged in
    createRecordValidation,
    vaccinationController.createVaccinationRecord
);

// GET /api/vaccinations/pet/:petId - Get all records for a specific pet
// Requires authentication (owner or authorized provider)
router.get(
    '/pet/:petId',
    authMiddleware,
    petIdValidation,
    vaccinationController.getVaccinationRecordsByPet
);

// GET /api/vaccinations/:recordId - Get a single record by ID
// Requires authentication (owner or authorized provider)
router.get(
    '/:recordId',
    authMiddleware,
    recordIdValidation,
    vaccinationController.getVaccinationRecordById
);

// PATCH /api/vaccinations/:recordId - Update a record (e.g., status by admin/vet)
// Requires authentication and specific roles (admin/veterinarian for status changes)
router.patch(
    '/:recordId',
    authMiddleware,
    // roleMiddleware(['admin', 'veterinarian']), // Apply role check for status updates within controller for flexibility
    updateRecordValidation, // Includes recordId param validation
    vaccinationController.updateVaccinationRecord
);

// DELETE /api/vaccinations/:recordId - Delete a record
// Requires authentication (Pet Owner primarily)
router.delete(
    '/:recordId',
    authMiddleware,
    recordIdValidation,
    vaccinationController.deleteVaccinationRecord
);

// --- Additional Workflow Routes (Placeholders) ---

// POST /api/vaccinations/:recordId/trigger-verification - Manually trigger verification workflow
// Requires auth, potentially admin/vet role
router.post(
    '/:recordId/trigger-verification',
    authMiddleware,
    roleMiddleware(['admin', 'veterinarian']), // Or adjust as needed
    recordIdValidation,
    async (req, res, next) => {
        // Placeholder: Call verification service
        try {
            // const updatedRecord = await verificationService.startVerificationWorkflow(req.params.recordId);
            // res.status(200).json({ message: 'Verification workflow initiated.', record: updatedRecord });
            await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
            res.status(200).json({ message: 'Verification workflow initiated (simulation).' });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/vaccinations/:recordId/certificate - Generate and download a certificate
// Requires auth (owner, authorized provider, admin)
router.get(
    '/:recordId/certificate',
    authMiddleware,
    recordIdValidation,
    async (req, res, next) => {
        // Placeholder: Call certificate service
        try {
             // const { pdfBuffer } = await certificateService.generateAndStoreCertificate(req.params.recordId, req.query.templateId, false);
             // res.setHeader('Content-Type', 'application/pdf');
             // res.setHeader('Content-Disposition', `attachment; filename=vaccination-certificate-${req.params.recordId}.pdf`);
             // res.send(pdfBuffer);
             await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async
             res.setHeader('Content-Type', 'text/plain');
             res.send(`Simulated PDF Certificate for record ${req.params.recordId}`);

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router; 