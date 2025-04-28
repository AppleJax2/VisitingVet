import React, { useState, useEffect } from 'react';
// import api from '../../../services/api'; // Assuming API service module
import './VaccinationSigning.css'; // Add basic styling

// This component assumes the logged-in user is a veterinarian
const VaccinationSigningPortal = () => {
    const [pendingCertificates, setPendingCertificates] = useState([]); // Certificates needing signature
    const [selectedCertId, setSelectedCertId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [error, setError] = useState(null);

    const fetchPendingCertificates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[Vet Signing] Fetching certificates pending signature...');
            // const response = await api.get('/veterinarian/certificates/pending-signature');
            // setPendingCertificates(response.data.certificates || []);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const simulatedCerts = [
                { _id: 'cert1', recordId: 'recA', petName: 'Max', vaccineType: 'Rabies', generatedAt: new Date(Date.now() - 3600000) },
                { _id: 'cert2', recordId: 'recB', petName: 'Bella', vaccineType: 'DHPP', generatedAt: new Date(Date.now() - 7200000) },
            ];
            setPendingCertificates(simulatedCerts);
            console.log('[Vet Signing] Fetched simulated pending certificates.');

        } catch (err) {
            console.error('[Vet Signing] Error fetching pending certificates:', err);
            setError('Failed to load certificates. Please try again.');
            setPendingCertificates([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingCertificates();
    }, []);

    const handleSignCertificate = async (certId) => {
        setSelectedCertId(certId);
        setIsSigning(true);
        setError(null);
        try {
            console.log(`[Vet Signing] Requesting electronic signature for certificate: ${certId}`);
            // const response = await api.post(`/veterinarian/certificates/${certId}/sign`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1200)); // Signing takes longer
            console.log(`[Vet Signing] Simulated signature successful for certificate: ${certId}`);
            
            // Remove signed certificate from the list
            setPendingCertificates(prevCerts => prevCerts.filter(cert => cert._id !== certId));
            // Optionally show a success message

        } catch (err) {
            console.error(`[Vet Signing] Error signing certificate ${certId}:`, err);
            setError(err.response?.data?.message || 'Failed to sign certificate. Please try again.');
        } finally {
            setIsSigning(false);
            setSelectedCertId(null);
        }
    };

    const handleBatchSign = async () => {
         // Placeholder for batch signing logic
         alert('Batch signing feature not yet implemented.');
    };

    return (
        <div className="vaccination-signing-portal">
            <h2>Electronic Signing Queue</h2>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-spinner">Loading certificates...</div>}

            {!isLoading && pendingCertificates.length === 0 && !error && (
                <p>No vaccination certificates are currently awaiting your signature.</p>
            )}

            {!isLoading && pendingCertificates.length > 0 && (
                <div>
                    <div className="batch-actions">
                        <button onClick={handleBatchSign} disabled={isSigning}>Sign All ({pendingCertificates.length})</button>
                    </div>
                    <ul className="signing-list">
                        {pendingCertificates.map(cert => (
                            <li key={cert._id} className="signing-item">
                                <div className="cert-info">
                                    <strong>{cert.vaccineType} for {cert.petName}</strong>
                                    <span className="date">Generated: {new Date(cert.generatedAt).toLocaleString()}</span>
                                    {/* Add link to preview certificate? */}
                                </div>
                                <div className="signing-actions">
                                    <button 
                                        onClick={() => handleSignCertificate(cert._id)}
                                        disabled={isSigning}
                                    >
                                        {isSigning && selectedCertId === cert._id ? 'Signing...' : 'Sign Certificate'}
                                    </button>
                                     {/* Add option to reject/review? */}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default VaccinationSigningPortal; 