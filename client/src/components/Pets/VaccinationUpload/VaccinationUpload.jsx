import React, { useState, useCallback } from 'react';
import api from '../../../services/api'; // Assuming API service module - Uncommented
import { useDropzone } from 'react-dropzone'; // Library for drag-n-drop
import './VaccinationUpload.css'; // Add basic styling

// Assume petId is passed as a prop
const VaccinationUpload = ({ petId, onUploadSuccess }) => {
    const [formData, setFormData] = useState({
        vaccineType: '',
        administrationDate: '',
        expirationDate: '',
    });
    const [files, setFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- File Upload Handling (using react-dropzone) ---
    const onDrop = useCallback(acceptedFiles => {
        // Basic validation (e.g., file type, size)
        const validatedFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setFiles(prevFiles => [...prevFiles, ...validatedFiles]);
        setError(null); // Clear previous file errors if any
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'application/pdf': ['.pdf'] 
        }, // Accepted file types
        maxFiles: 5, // Max number of files
        maxSize: 5 * 1024 * 1024, // 5MB limit per file
    });

    const removeFile = (fileName) => {
        setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const filePreviews = files.map(file => (
        <div key={file.name} className="file-preview-item">
            <img src={file.preview || '/path/to/default/doc-icon.png'} alt={`Preview of ${file.name}`} className="file-thumbnail" />
            <span>{file.name}</span>
            <button type="button" onClick={() => removeFile(file.name)}>&times;</button>
        </div>
    ));
    // --- End File Upload Handling ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!petId) {
            setError("Pet ID is missing. Cannot upload record.");
            return;
        }
        if (!formData.vaccineType || !formData.administrationDate) {
             setError("Vaccine type and administration date are required.");
             return;
        }
        // Potentially add more validation here

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        const submissionData = new FormData(); // Use FormData for file uploads
        submissionData.append('petId', petId);
        submissionData.append('vaccineType', formData.vaccineType);
        submissionData.append('administrationDate', formData.administrationDate);
        if (formData.expirationDate) {
             submissionData.append('expirationDate', formData.expirationDate);
        }
        // Append files
        files.forEach(file => {
            submissionData.append('documents', file); // Backend expects 'documents' field
        });

        try {
            // Make the actual API call
            const response = await api.post('/vaccinations', submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setSuccessMessage(response.data.message || 'Vaccination record submitted successfully! It will be reviewed shortly.');
            setFormData({ vaccineType: '', administrationDate: '', expirationDate: '' }); // Clear form
            setFiles([]); // Clear files
            // Clean up preview URLs
            files.forEach(file => URL.revokeObjectURL(file.preview)); 

            if (onUploadSuccess) {
                // Pass back new record info if available in response and needed
                if (response.data.record) {
                    onUploadSuccess(response.data.record);
                } else {
                    onUploadSuccess(); // Indicate success even if no record data returned
                }
            }

        } catch (err) {
            console.error('[Pet Upload] Error submitting record:', err);
            setError(err.response?.data?.message || 'Failed to submit record. Please check your input and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="vaccination-upload">
            <h3>Add New Vaccination Record</h3>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                <div className="form-group">
                    <label htmlFor="vaccineType">Vaccine Type *</label>
                    <input 
                        type="text" 
                        id="vaccineType"
                        name="vaccineType"
                        value={formData.vaccineType}
                        onChange={handleInputChange}
                        required 
                        maxLength={100}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="administrationDate">Administration Date *</label>
                    <input 
                        type="date" 
                        id="administrationDate"
                        name="administrationDate"
                        value={formData.administrationDate}
                        onChange={handleInputChange}
                        required 
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="expirationDate">Expiration Date (Optional)</label>
                    <input 
                        type="date" 
                        id="expirationDate"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label>Upload Supporting Documents (Optional)</label>
                    <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
                        <input {...getInputProps()} />
                        {isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag 'n' drop files here, or click to select (PDF, JPG, PNG)</p>
                        }
                    </div>
                    {files.length > 0 && (
                        <aside className="file-previews">
                            <h4>Selected Files:</h4>
                            {filePreviews}
                        </aside>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? 'Submitting...' : 'Submit Record'}
                </button>
            </form>
        </div>
    );
};

export default VaccinationUpload; 