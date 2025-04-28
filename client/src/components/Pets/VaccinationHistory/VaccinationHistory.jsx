import React, { useState, useEffect } from 'react';
// import api from '../../../services/api'; // Assuming API service module
import './VaccinationHistory.css'; // Add basic styling

// Assume petId is passed as a prop
const VaccinationHistory = ({ petId }) => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        if (!petId) return;
        setIsLoading(true);
        setError(null);
        try {
            console.log(`[Pet History] Fetching vaccination history for pet: ${petId}`);
            // const response = await api.get(`/vaccinations/pet/${petId}`);
            // setRecords(response.data.records || []);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 400));
            const simulatedHistory = [
                { _id: 'rec1', vaccineType: 'Rabies', administrationDate: new Date(2023, 9, 26), expirationDate: new Date(2024, 9, 26), verificationStatus: 'verified' },
                { _id: 'rec3', vaccineType: 'Bordetella', administrationDate: new Date(2024, 0, 15), expirationDate: new Date(2025, 0, 15), verificationStatus: 'verified' },
                { _id: 'rec4', vaccineType: 'Leptospirosis', administrationDate: new Date(2024, 4, 1), expirationDate: null, verificationStatus: 'pending' },
                { _id: 'rec2', vaccineType: 'Distemper', administrationDate: new Date(2023, 5, 10), expirationDate: new Date(2024, 5, 10), verificationStatus: 'rejected', rejectionReason: 'Document unclear' },
            ].sort((a, b) => b.administrationDate - a.administrationDate); // Sort descending
            setRecords(simulatedHistory);
            console.log(`[Pet History] Fetched simulated history for pet: ${petId}`);

        } catch (err) {
            console.error(`[Pet History] Error fetching history for pet ${petId}:`, err);
            setError('Failed to load vaccination history. Please try again.');
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [petId]); // Refetch if petId changes

    const getStatusClass = (status) => {
        switch (status) {
            case 'verified': return 'status-verified';
            case 'pending': return 'status-pending';
            case 'rejected': return 'status-rejected';
            default: return '';
        }
    };

    const isUpcomingOrExpired = (record) => {
        if (!record.expirationDate) return { type: null, days: 0 }; // No expiration
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(record.expirationDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { type: 'expired', days: Math.abs(diffDays) };
        } else if (diffDays <= 30) { // Alert if expiring within 30 days
            return { type: 'upcoming', days: diffDays };
        }
        return { type: null, days: 0 };
    };

    return (
        <div className="vaccination-history">
            <h3>Vaccination History</h3>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-spinner">Loading history...</div>}

            {!isLoading && records.length === 0 && !error && (
                <p>No vaccination records found for this pet.</p>
            )}

            {!isLoading && records.length > 0 && (
                <ul className="history-list">
                    {records.map(record => {
                        const expiryInfo = isUpcomingOrExpired(record);
                        return (
                            <li key={record._id} className={`history-item ${getStatusClass(record.verificationStatus)}`}>
                                <div className="item-details">
                                    <strong>{record.vaccineType}</strong>
                                    <span className="date">Administered: {new Date(record.administrationDate).toLocaleDateString()}</span>
                                    {record.expirationDate && (
                                        <span className="date">Expires: {new Date(record.expirationDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <div className="item-status">
                                    <span className={`status-badge ${getStatusClass(record.verificationStatus)}`}>{record.verificationStatus}</span>
                                    {record.verificationStatus === 'rejected' && record.rejectionReason &&
                                        <span className="rejection-reason">Reason: {record.rejectionReason}</span>
                                    }
                                    {expiryInfo.type === 'expired' &&
                                        <span className="alert alert-expired">Expired {expiryInfo.days} days ago</span>
                                    }
                                    {expiryInfo.type === 'upcoming' && record.verificationStatus !== 'rejected' &&
                                        <span className="alert alert-upcoming">Expires in {expiryInfo.days} days</span>
                                    }
                                </div>
                                {/* Add link/button to view details/certificate? */}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default VaccinationHistory; 