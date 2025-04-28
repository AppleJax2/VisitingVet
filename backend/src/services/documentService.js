const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto');
const path = require('path');
const logger = require('../utils/logger');

// Ensure AWS credentials and region are set in environment variables
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_REGION = process.env.AWS_REGION || 'us-east-1'; // Default region if not set

if (!S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    logger.error('S3 configuration missing! Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME are set in environment variables.');
    // Potentially throw error to prevent startup? Or allow graceful degradation?
    // throw new Error('Missing S3 Configuration');
}

const s3Client = new S3Client({ region: S3_REGION });

/**
 * Generates a unique file key for S3 storage.
 * Example: verifications/user_abcdef123/license/uuid-document.pdf
 *
 * @param {string} userId - The ID of the user uploading the document.
 * @param {string} documentType - Type of document (e.g., 'license', 'certification').
 * @param {string} originalFileName - The original name of the file.
 * @returns {string} The generated unique S3 key.
 */
const generateFileKey = (userId, documentType, originalFileName) => {
    const uniqueId = crypto.randomUUID();
    const extension = path.extname(originalFileName);
    const baseName = path.basename(originalFileName, extension);
    // Sanitize parts to prevent path traversal or invalid characters
    const safeUserId = String(userId).replace(/[^a-zA-Z0-9_\-]/g, '');
    const safeDocType = String(documentType).replace(/[^a-zA-Z0-9_\-]/g, '');
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9_\-\.]/g, '').substring(0, 50); // Limit length

    return `verifications/${safeUserId}/${safeDocType}/${uniqueId}-${safeBaseName}${extension}`;
};

/**
 * Uploads a document buffer to S3.
 *
 * @param {Buffer} fileBuffer - The buffer containing the file data.
 * @param {string} userId - The ID of the user associated with the document.
 * @param {string} documentType - The type of the document.
 * @param {string} originalFileName - The original name of the file.
 * @param {string} contentType - The MIME type of the file (e.g., 'application/pdf').
 * @returns {Promise<string>} A promise that resolves with the S3 file key upon successful upload.
 * @throws {Error} If the upload fails.
 */
const uploadDocument = async (fileBuffer, userId, documentType, originalFileName, contentType) => {
    if (!S3_BUCKET_NAME) throw new Error('S3 Bucket Name is not configured.');

    const fileKey = generateFileKey(userId, documentType, originalFileName);
    logger.info(`Uploading document to S3. Key: ${fileKey}, ContentType: ${contentType}`);

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
        // ACL: 'private', // Objects are private by default, access via signed URLs
        // Add metadata if needed: Metadata: { 'userId': userId, 'documentType': documentType }
    });

    try {
        await s3Client.send(command);
        logger.info(`Successfully uploaded document: ${fileKey}`);
        return fileKey; // Return the key for storage in DB
    } catch (error) {
        logger.error(`Failed to upload document ${fileKey} to S3:`, error);
        throw new Error('Failed to upload document.'); // Rethrow a generic error
    }
};

/**
 * Generates a pre-signed URL for temporary, secure download access to an S3 object.
 *
 * @param {string} fileKey - The S3 key of the file.
 * @param {number} [expiresInSeconds=3600] - URL validity duration (default: 1 hour).
 * @returns {Promise<string>} A promise that resolves with the pre-signed URL.
 * @throws {Error} If URL generation fails.
 */
const getSecureDownloadUrl = async (fileKey, expiresInSeconds = 3600) => {
    if (!S3_BUCKET_NAME) throw new Error('S3 Bucket Name is not configured.');
    if (!fileKey) throw new Error('File key is required to generate download URL.');

    logger.debug(`Generating signed URL for key: ${fileKey}, Expires: ${expiresInSeconds}s`);

    const command = new GetObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
    });

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
        logger.debug(`Generated signed URL for ${fileKey}`);
        return signedUrl;
    } catch (error) {
        logger.error(`Failed to generate signed URL for ${fileKey}:`, error);
        throw new Error('Could not generate secure download link.');
    }
};

/**
 * Deletes a document from S3.
 *
 * @param {string} fileKey - The S3 key of the file to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful.
 * @throws {Error} If deletion fails.
 */
const deleteDocument = async (fileKey) => {
    if (!S3_BUCKET_NAME) throw new Error('S3 Bucket Name is not configured.');
    if (!fileKey) throw new Error('File key is required for deletion.');

    logger.info(`Deleting document from S3: ${fileKey}`);

    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: fileKey,
    });

    try {
        await s3Client.send(command);
        logger.info(`Successfully deleted document: ${fileKey}`);
    } catch (error) {
        logger.error(`Failed to delete document ${fileKey} from S3:`, error);
        throw new Error('Failed to delete document.');
    }
};

module.exports = {
    uploadDocument,
    getSecureDownloadUrl,
    deleteDocument,
    generateFileKey // Exporting for potential use elsewhere if needed
}; 