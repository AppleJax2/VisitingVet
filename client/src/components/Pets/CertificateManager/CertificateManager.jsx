import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Assuming API service module - Uncommented
import './CertificateManager.css'; // Add basic styling

// Assume petId is passed as a prop
const CertificateManager = ({ petId }) => {
    // This component needs access to VERIFIED vaccination records
    const [verifiedRecords, setVerifiedRecords] = useState([]);
    // const [availableTemplates, setAvailableTemplates] = useState([]); // If template selection is offered
    const [selectedRecordId, setSelectedRecordId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const fetchVerifiedRecords = async () => {
        if (!petId) return;
        setIsLoading(true);
        setError(null);
        try {
            // Fetch only verified records
            const response = await api.get(`/vaccinations/pet/${petId}`, { params: { status: 'verified' } });
            const fetchedRecords = response.data?.records || response.data || [];
            const sortedRecords = fetchedRecords.sort((a, b) => 
                new Date(b.administrationDate) - new Date(a.administrationDate)
            );
            setVerifiedRecords(sortedRecords);
            
            // Removed simulation logic and logs
            // Removed template fetching TODO and logic

        } catch (err) {
            console.error(`[Cert Manager] Error fetching data for pet ${petId}:`, err);
            setError(err.response?.data?.message || 'Failed to load verified vaccination records. Please try again.');
            setVerifiedRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifiedRecords();
    }, [petId]);

    const handleGenerateCertificate = async (recordId) => {
        setSelectedRecordId(recordId);
        setIsGenerating(true);
        setError(null);
        try {
            // Request certificate generation from backend
            const response = await api.get(`/vaccinations/${recordId}/certificate`, {
                responseType: 'blob', // Important to handle PDF blob response
            });
            
            // Removed simulation logic and logs

            // Create a URL for the blob and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            // Extract filename from Content-Disposition header if available, otherwise use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `vaccination-certificate-${recordId}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
                if (filenameMatch.length === 2) filename = filenameMatch[1];
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up

        } catch (err) {
            console.error(`[Cert Manager] Error generating certificate for record ${recordId}:`, err);
            // Handle potential Blob reading errors if response wasn't a blob
            if (err.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                         const errorData = JSON.parse(reader.result);
                         setError(errorData.message || 'Failed to generate certificate.');
                    } catch (parseError) {
                         setError('An unexpected error occurred while generating the certificate.');
                    }
                };
                reader.onerror = () => {
                     setError('Failed to read error response from certificate generation.');
                };
                reader.readAsText(err.response.data);
            } else {
                 setError(err.response?.data?.message || 'Failed to generate certificate. Please try again.');
            }
        } finally {
            setIsGenerating(false);
            // setSelectedRecordId(null); // Deselect after generation?
        }
    };

    return (
        <div className="certificate-manager">
            <h3>Manage Vaccination Certificates</h3>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-spinner">Loading records...</div>}

            {!isLoading && verifiedRecords.length === 0 && !error && (
                <p>No verified vaccination records available to generate certificates for.</p>
            )}

            {!isLoading && verifiedRecords.length > 0 && (
                <ul className="certificate-list">
                    {verifiedRecords.map(record => (
                        <li key={record._id} className="certificate-item">
                            <div className="cert-details">
                                <strong>{record.vaccineType}</strong>
                                <span className="date">Administered: {new Date(record.administrationDate).toLocaleDateString()}</span>
                                {record.expirationDate && (
                                    <span className="date">Expires: {new Date(record.expirationDate).toLocaleDateString()}</span>
                                )}
                            </div>
                            <div className="cert-actions">
                                {/* Add Template Selection Dropdown here if needed */}
                                <button 
                                    onClick={() => handleGenerateCertificate(record._id)}
                                    disabled={isGenerating && selectedRecordId === record._id}
                                >
                                    {isGenerating && selectedRecordId === record._id ? 'Generating...' : 'Download Certificate'}
                                </button>
                                {/* Add Share Button here? */}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CertificateManager; 