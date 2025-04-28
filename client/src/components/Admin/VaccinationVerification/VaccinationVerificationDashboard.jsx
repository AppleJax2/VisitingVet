import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; // Assuming API service module
// import VerificationQueue from './VerificationQueue'; // TODO: Implement VerificationQueue component
// import RecordReview from './RecordReview'; // TODO: Implement RecordReview component
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
            // Removed log
            const response = await api.get('/admin/verifications/pending'); // Use actual endpoint
            if (response.data.success) {
                setPendingRecords(response.data.data || []); // Adjust based on actual API response
            } else {
                 throw new Error(response.data.message || 'Failed to fetch pending records');
            }
            // Removed simulation logic and logs
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
        // Removed log
        setSelectedRecord(record);
    };

    const handleVerificationComplete = (recordId, newStatus) => {
        // Removed log
        // Remove the completed record from the list and deselect
        setPendingRecords(prev => prev.filter(rec => rec._id !== recordId));
        setSelectedRecord(null);
        // Optionally show a success message
    };

    return (
        <div className="vaccination-verification-dashboard">
            <h2>Vaccination Verification Queue</h2>
            {error && <div className="error-message">{error}</div>}
            {isLoading && <div>Loading pending records...</div>}

            <div className="dashboard-layout">
                <div className="queue-panel">
                    <h3>Pending Review ({pendingRecords.length})</h3>
                    {/* TODO: Replace placeholder with VerificationQueue component */} 
                    {/* <VerificationQueue 
                        records={pendingRecords} 
                        onSelectRecord={handleRecordSelect}
                        selectedRecordId={selectedRecord?._id}
                        isLoading={isLoading}
                    /> */} 
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '60vh', overflowY: 'auto' }}>
                        {pendingRecords.map(rec => (
                            <li key={rec._id} onClick={() => handleRecordSelect(rec)} style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee', backgroundColor: selectedRecord?._id === rec._id ? '#e0e0e0' : 'transparent' }}>
                                Pet: {rec.pet?.name || 'Unknown'} - Vaccine: {rec.vaccineType} ({new Date(rec.administrationDate).toLocaleDateString()})
                            </li>
                        ))}
                         {pendingRecords.length === 0 && !isLoading && <p>No records pending review.</p>}
                    </ul>
                </div>
                
                <div className="review-panel">
                    <h3>Record Details</h3>
                     {/* TODO: Replace placeholder with RecordReview component */} 
                    {/* <RecordReview 
                        record={selectedRecord} 
                        onVerificationComplete={handleVerificationComplete} 
                    /> */}
                     {selectedRecord ? (
                         <div>
                             <p><strong>Selected Record ID:</strong> {selectedRecord._id}</p>
                             <p>Review details and actions placeholder...</p>
                             {/* Simulate actions */}
                             <button onClick={() => handleVerificationComplete(selectedRecord._id, 'Verified')} style={{ marginRight: '10px' }}>Approve</button>
                             <button onClick={() => handleVerificationComplete(selectedRecord._id, 'Rejected')}>Reject</button>
                         </div>
                     ) : (
                         <p>Select a record from the queue to review.</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default VaccinationVerificationDashboard; 