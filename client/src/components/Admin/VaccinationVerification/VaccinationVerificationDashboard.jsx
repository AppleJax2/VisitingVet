import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; // Assuming API service module
import VerificationQueue from './VerificationQueue'; // Import the new component
import RecordReview from './RecordReview'; // Import the new component
import './VaccinationVerificationDashboard.css'; // Add basic styling

const VaccinationVerificationDashboard = () => {
    const [pendingRecords, setPendingRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPendingRecords = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/verifications/pending'); // Use actual endpoint
            if (response.data.success) {
                setPendingRecords(response.data.data || []); // Adjust based on actual API response
            } else {
                 throw new Error(response.data.message || 'Failed to fetch pending records');
            }
            setSelectedRecord(null); // Deselect any previously selected record on refresh
        } catch (err) {
            console.error('[Admin Dashboard] Error fetching pending records:', err);
            setError(err.response?.data?.message || 'Failed to load pending records.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingRecords();
    }, [fetchPendingRecords]);

    const handleRecordSelect = (record) => {
        setSelectedRecord(record);
    };

    const handleVerificationComplete = (recordId, newStatus) => {
        // Remove the completed record from the list and deselect
        setPendingRecords(prev => prev.filter(rec => rec._id !== recordId));
        setSelectedRecord(null);
        // Optionally show a success message (handled by toast in RecordReview)
    };

    return (
        <div className="vaccination-verification-dashboard">
            <h2>Vaccination Verification Queue</h2>
            {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
            
            <div className="dashboard-layout">
                <div className="queue-panel shadow-sm">
                    {/* Use VerificationQueue component */} 
                    <VerificationQueue 
                        records={pendingRecords} 
                        onSelectRecord={handleRecordSelect}
                        selectedRecordId={selectedRecord?._id}
                        isLoading={isLoading}
                    /> 
                </div>
                
                <div className="review-panel shadow-sm">
                    {/* Use RecordReview component */} 
                     <RecordReview 
                        record={selectedRecord} 
                        onVerificationComplete={handleVerificationComplete} 
                    />
                </div>
            </div>
        </div>
    );
};

export default VaccinationVerificationDashboard; 