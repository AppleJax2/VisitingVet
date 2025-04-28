import React, { useState, useEffect } from 'react';
// import api from '../../../services/api'; // Assuming API service module
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
            console.log(`[Cert Manager] Fetching verified records for pet: ${petId}`);
            // const response = await api.get(`/vaccinations/pet/${petId}?status=verified`);
            // setVerifiedRecords(response.data.records || []);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));
            const simulatedRecords = [
                { _id: 'rec1', vaccineType: 'Rabies', administrationDate: new Date(2023, 9, 26), expirationDate: new Date(2024, 9, 26), verificationStatus: 'verified' },
                { _id: 'rec3', vaccineType: 'Bordetella', administrationDate: new Date(2024, 0, 15), expirationDate: new Date(2025, 0, 15), verificationStatus: 'verified' },
            ].sort((a, b) => b.administrationDate - a.administrationDate);
            setVerifiedRecords(simulatedRecords);
            console.log(`[Cert Manager] Fetched simulated verified records for pet: ${petId}`);

            // Removed TODO for fetching templates as it wasn't part of the core task
            // // TODO: Fetch available templates if needed
            // // const templateResponse = await api.get('/vaccination-templates');
            // // setAvailableTemplates(templateResponse.data.templates || []);

        } catch (err) {
            console.error(`[Cert Manager] Error fetching data for pet ${petId}:`, err);
            setError('Failed to load vaccination records. Please try again.');
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
            console.log(`[Cert Manager] Requesting certificate generation for record: ${recordId}`);
            // const response = await api.get(`/vaccinations/${recordId}/certificate`, {
            //     responseType: 'blob', // Important to handle PDF blob response
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            const simulatedBlob = new Blob([`Simulated PDF content for record ${recordId}`], { type: 'application/pdf' });
            console.log(`[Cert Manager] Simulated certificate generated for record: ${recordId}`);

            // Create a URL for the blob and trigger download
            const url = window.URL.createObjectURL(simulatedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `vaccination-certificate-${recordId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up

        } catch (err) {
            console.error(`[Cert Manager] Error generating certificate for record ${recordId}:`, err);
            setError(err.response?.data?.message || 'Failed to generate certificate. Please try again.');
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