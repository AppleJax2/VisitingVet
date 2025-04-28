const VaccinationTemplate = require('../models/VaccinationTemplate');
const { VaccinationRecord, VerificationStatus } = require('../models/VaccinationRecord');
const ApiError = require('../errors/ApiError');
// const pdfLib = require('pdf-lib'); // Example PDF generation library
// const fs = require('fs/promises'); // For file system operations if saving locally
// const storageService = require('./storageService'); // To upload generated certificate

/**
 * Finds a suitable vaccination certificate template.
 * 
 * @param {string} [templateId] - Optional ID of a specific template to use.
 * @returns {Promise<VaccinationTemplate>} - The found template object.
 * @throws {ApiError} - Throws if no suitable template is found.
 */
const findTemplate = async (templateId = null) => {
    let template;
    if (templateId) {
        template = await VaccinationTemplate.findById(templateId);
        if (!template) {
            throw ApiError.notFound(`Vaccination template with ID ${templateId} not found.`);
        }
    } else {
        // Find the default template
        template = await VaccinationTemplate.findOne({ isDefault: true });
        if (!template) {
            // Fallback: find *any* template if no default is set
            template = await VaccinationTemplate.findOne();
            if (!template) {
                throw ApiError.internal('No default or fallback vaccination template found.');
            }
            console.warn('[Certificate Service] No default template found, using first available template.');
        }
    }
    console.log(`[Certificate Service] Using template: ${template.name} (${template._id})`);
    return template;
};

/**
 * Generates a vaccination certificate PDF.
 * 
 * @param {string | VaccinationRecord} recordOrId - The verified VaccinationRecord object or its ID.
 * @param {string} [templateId] - Optional ID of the template to use. Defaults to the default template.
 * @returns {Promise<Buffer>} - A promise that resolves with the generated PDF buffer.
 * @throws {ApiError} - Throws if record is not verified, template not found, or generation fails.
 */
const generateCertificate = async (recordOrId, templateId = null) => {
    let record;
    try {
        if (typeof recordOrId === 'string') {
            record = await VaccinationRecord.findById(recordOrId).populate('pet');
        } else {
            record = recordOrId;
            // Ensure pet is populated if passed as object
            if (!record.pet || !record.pet.name) {
                await record.populate('pet');
            }
        }

        if (!record) {
            throw ApiError.notFound('Vaccination record not found.');
        }

        // **Crucial Check**: Only generate certificates for VERIFIED records
        if (record.verificationStatus !== VerificationStatus.VERIFIED) {
            throw ApiError.badRequest(`Cannot generate certificate for record with status: ${record.verificationStatus}. Record must be verified.`);
        }
        
        const template = await findTemplate(templateId);

        console.log(`[Certificate Service] Generating certificate for Record ID: ${record._id} using Template: ${template.name}`);

        // --- Placeholder PDF Generation Logic --- 
        // This would involve using a library like pdf-lib or puppeteer
        // to create a PDF, place text, images (logos), etc., based on the 
        // template.layoutConfiguration and record data.

        // Example using pdf-lib (very basic)
        /*
        const pdfDoc = await pdfLib.PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]); // Example page size
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);

        // Use template.layoutConfiguration and template.brandingOptions here
        page.drawText(`Vaccination Certificate`, { x: 50, y: height - 50, font, size: 24 });
        page.drawText(`Pet Name: ${record.pet.name}`, { x: 50, y: height - 100, font, size: 12 });
        page.drawText(`Vaccine: ${record.vaccineType}`, { x: 50, y: height - 120, font, size: 12 });
        page.drawText(`Date Administered: ${record.administrationDate.toLocaleDateString()}`, { x: 50, y: height - 140, font, size: 12 });
        if (record.expirationDate) {
            page.drawText(`Expiration Date: ${record.expirationDate.toLocaleDateString()}`, { x: 50, y: height - 160, font, size: 12 });
        }
        // Add branding (logo), verifier info, watermarks, etc.

        // Apply Electronic Signature (Placeholder)
        // This is complex and might involve external services or libraries
        page.drawText(`Signed Electronically: [Placeholder Signature]`, { x: 50, y: 50, font, size: 10 });

        const pdfBytes = await pdfDoc.save();
        console.log(`[Certificate Service] PDF generated successfully for Record ID: ${record._id}`);
        return Buffer.from(pdfBytes);
        */
        
        // Simulate PDF generation
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async generation
        const simulatedPdfContent = `PDF Certificate Content for ${record.vaccineType} - Pet: ${record.pet.name}`;
        console.log(`[Certificate Service] PDF generation simulation complete for Record ID: ${record._id}`);
        return Buffer.from(simulatedPdfContent);
        // --- End Placeholder PDF Generation --- 

    } catch (error) {
        const recordIdStr = typeof recordOrId === 'string' ? recordOrId : recordOrId?._id;
        console.error(`[Certificate Service] Failed to generate certificate for record ${recordIdStr}:`, error);
        throw error instanceof ApiError ? error : ApiError.internal(`Certificate generation failed for record ${recordIdStr}.`, error);
    }
};

/**
 * Generates a certificate and optionally uploads it to storage.
 * 
 * @param {string | VaccinationRecord} recordOrId - The verified VaccinationRecord object or its ID.
 * @param {string} [templateId] - Optional ID of the template to use.
 * @param {boolean} [uploadToStorage=false] - Whether to upload the generated PDF to storage.
 * @returns {Promise<{pdfBuffer: Buffer, storageUrl?: string}>} - PDF buffer and optional storage URL.
 */
const generateAndStoreCertificate = async (recordOrId, templateId = null, uploadToStorage = false) => {
    const pdfBuffer = await generateCertificate(recordOrId, templateId);
    let storageUrl = null;

    if (uploadToStorage) {
        // Placeholder: Upload to storage service (e.g., S3)
        // const fileName = `vaccination_certificate_${recordOrId._id || recordOrId}_${Date.now()}.pdf`;
        // storageUrl = await storageService.upload(pdfBuffer, fileName, 'application/pdf');
        // console.log(`[Certificate Service] Certificate uploaded to: ${storageUrl}`);
         await new Promise(resolve => setTimeout(resolve, 50)); // Simulate upload
         storageUrl = `https://placeholder.storage.com/certs/cert_${recordOrId._id || recordOrId}.pdf`;
         console.log(`[Certificate Service] Certificate upload simulation complete: ${storageUrl}`);
    }

    return { pdfBuffer, storageUrl };
};

module.exports = {
    generateCertificate,
    findTemplate,
    generateAndStoreCertificate,
}; 