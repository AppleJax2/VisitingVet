# Vaccination API Documentation

This document outlines the API endpoints for managing pet vaccination records.

**Base Path:** `/api/vaccinations`

**Authentication:** All endpoints require Bearer Token authentication via the `Authorization` header.

---

## Endpoints

### 1. Create Vaccination Record

*   **Endpoint:** `POST /`
*   **Description:** Creates a new vaccination record for a pet, potentially including document uploads.
*   **Authentication:** Required (User must be logged in).
*   **Permissions:** Pet Owner.
*   **Request Body:** `multipart/form-data` or `application/json`
    *   `petId` (string, required, MongoID): ID of the pet this record belongs to.
    *   `vaccineType` (string, required): Name of the vaccine administered.
    *   `administrationDate` (string, required, ISO 8601 Date): Date the vaccine was given.
    *   `expirationDate` (string, optional, ISO 8601 Date): Date the vaccine expires.
    *   `documents` (File[], optional): Array of uploaded document files (if using `multipart/form-data`).
*   **Success Response (201 Created):**
    ```json
    {
        "message": "Vaccination record created successfully.",
        "record": { ...VaccinationRecord object... }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Validation errors (missing fields, invalid format).
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `404 Not Found`: Pet ID not found or pet does not belong to the user.
    *   `500 Internal Server Error`: Server error during creation.

### 2. Get Records for a Pet

*   **Endpoint:** `GET /pet/:petId`
*   **Description:** Retrieves all vaccination records associated with a specific pet.
*   **Authentication:** Required.
*   **Permissions:** Pet Owner, Authorized Provider/Admin.
*   **URL Parameters:**
    *   `petId` (string, required, MongoID): ID of the pet.
*   **Success Response (200 OK):**
    ```json
    {
        "records": [ { ...VaccinationRecord object... }, ... ]
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `petId` format.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission to view this pet's records.
    *   `404 Not Found`: Pet ID not found.
    *   `500 Internal Server Error`: Server error during retrieval.

### 3. Get Single Record by ID

*   **Endpoint:** `GET /:recordId`
*   **Description:** Retrieves a specific vaccination record by its ID.
*   **Authentication:** Required.
*   **Permissions:** Pet Owner, Authorized Provider/Admin.
*   **URL Parameters:**
    *   `recordId` (string, required, MongoID): ID of the vaccination record.
*   **Success Response (200 OK):**
    ```json
    {
        "record": { ...VaccinationRecord object including populated pet... }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `recordId` format.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission to view this record.
    *   `404 Not Found`: Record ID not found.
    *   `500 Internal Server Error`: Server error during retrieval.

### 4. Update Vaccination Record

*   **Endpoint:** `PATCH /:recordId`
*   **Description:** Updates fields of a specific vaccination record. Primarily used by Admins/Vets to update verification status.
*   **Authentication:** Required.
*   **Permissions:** Pet Owner (limited fields), Admin/Veterinarian (status, etc.). Specific logic in controller.
*   **URL Parameters:**
    *   `recordId` (string, required, MongoID): ID of the record to update.
*   **Request Body:** `application/json`
    *   `verificationStatus` (string, optional): New status ('pending', 'verified', 'rejected'). Requires Admin/Vet role.
    *   `rejectionReason` (string, optional): Reason if status is 'rejected'. Requires Admin/Vet role.
    *   _(Other fields might be updatable depending on permissions)_.
*   **Success Response (200 OK):**
    ```json
    {
        "message": "Vaccination record updated successfully.",
        "record": { ...Updated VaccinationRecord object... }
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `recordId` or invalid field values/format.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission to update this field/record.
    *   `404 Not Found`: Record ID not found.
    *   `500 Internal Server Error`: Server error during update.

### 5. Delete Vaccination Record

*   **Endpoint:** `DELETE /:recordId`
*   **Description:** Deletes a specific vaccination record.
*   **Authentication:** Required.
*   **Permissions:** Pet Owner (primarily), potentially Admin.
*   **URL Parameters:**
    *   `recordId` (string, required, MongoID): ID of the record to delete.
*   **Success Response (200 OK):**
    ```json
    {
        "message": "Vaccination record deleted successfully."
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `recordId` format.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission to delete this record.
    *   `404 Not Found`: Record ID not found.
    *   `500 Internal Server Error`: Server error during deletion.

### 6. Trigger Verification Workflow (Admin/Vet)

*   **Endpoint:** `POST /:recordId/trigger-verification`
*   **Description:** Manually triggers the backend verification workflow for a specific record.
*   **Authentication:** Required.
*   **Permissions:** Admin, Veterinarian.
*   **URL Parameters:**
    *   `recordId` (string, required, MongoID): ID of the record to verify.
*   **Success Response (200 OK):**
    ```json
    {
        "message": "Verification workflow initiated (simulation)." 
        // "record": { ...Updated VaccinationRecord object... } // Actual implementation might return updated record
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `recordId` format.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission.
    *   `404 Not Found`: Record ID not found.
    *   `500 Internal Server Error`: Error during workflow trigger.

### 7. Download Certificate

*   **Endpoint:** `GET /:recordId/certificate`
*   **Description:** Generates and downloads the vaccination certificate PDF for a verified record.
*   **Authentication:** Required.
*   **Permissions:** Pet Owner, Authorized Provider/Admin.
*   **URL Parameters:**
    *   `recordId` (string, required, MongoID): ID of the verified record.
*   **Query Parameters:**
    *   `templateId` (string, optional, MongoID): ID of a specific certificate template to use (defaults to system default).
*   **Success Response (200 OK):**
    *   **Content-Type:** `application/pdf`
    *   **Content-Disposition:** `attachment; filename="vaccination-certificate-{recordId}.pdf"`
    *   **Body:** Raw PDF data.
*   **Error Responses:**
    *   `400 Bad Request`: Invalid `recordId` format, or record is not verified.
    *   `401 Unauthorized`: Missing or invalid authentication token.
    *   `403 Forbidden`: User does not have permission.
    *   `404 Not Found`: Record ID or specified Template ID not found.
    *   `500 Internal Server Error`: Error during certificate generation.

---

## Models Used

*   **VaccinationRecord:** Stores details about a specific vaccination.
*   **Pet:** Stores pet information, references vaccination records.
*   **User:** Stores user information, including roles (owner, admin, vet).
*   **VaccinationTemplate:** Defines the layout and branding for certificates.

---

## TODO / Future Enhancements

*   Add endpoints for managing `VaccinationTemplate`s (Admin only).
*   Add endpoint for managing shared links (`/share/...` or integrated here).
*   Refine permissions for provider access.
*   Document file upload specifics (max size, types) once middleware is finalized. 