import React, { useState, useEffect } from 'react';
// import api from '../../../services/api'; // Assuming an API service module
import './VaccinationVerification.css'; // Add basic styling

// Placeholder components (to be created)
// import VerificationQueue from './VerificationQueue';
// import RecordReview from './RecordReview';

const VaccinationVerificationDashboard = () => {
    const [pendingRecords, setPendingRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPendingRecords = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[Admin Dashboard] Fetching pending verification records...');
            // const response = await api.get('/admin/vaccinations/pending'); // Example endpoint
            // setPendingRecords(response.data.records);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const simulatedRecords = [
                { _id: 'rec1', petName: 'Buddy', ownerName: 'Alice', vaccineType: 'Rabies', submittedAt: new Date(Date.now() - 86400000), status: 'pending' },
                { _id: 'rec2', petName: 'Lucy', ownerName: 'Bob', vaccineType: 'Distemper', submittedAt: new Date(Date.now() - 172800000), status: 'pending' },
            ];
            setPendingRecords(simulatedRecords);
            console.log('[Admin Dashboard] Fetched simulated records.');

        } catch (err) {
            console.error('[Admin Dashboard] Error fetching pending records:', err);
            setError('Failed to load records. Please try again.');
            setPendingRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRecords();
    }, []);

    const handleSelectRecord = (record) => {
        console.log(`[Admin Dashboard] Record selected for review: ${record._id}`);
        setSelectedRecord(record);
    };

    const handleVerificationComplete = (recordId, newStatus) => {
        console.log(`[Admin Dashboard] Verification complete for ${recordId}. New status: ${newStatus}`);
        // Refetch the list or remove the item locally
        setPendingRecords(prevRecords => prevRecords.filter(r => r._id !== recordId));
        setSelectedRecord(null); // Close the review panel
        // Optionally trigger a notification/feedback to the user
    };

    return (
        <div className="vaccination-verification-dashboard">
            <h2>Vaccination Verification Queue</h2>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-spinner">Loading records...</div>} 

            <div className="dashboard-layout">
                <div className="queue-list-panel">
                    {/* Placeholder for VerificationQueue component */} 
                    <h3>Pending Review ({pendingRecords.length})</h3>
                    {pendingRecords.length > 0 ? (
                        <ul>
                            {pendingRecords.map(record => (
                                <li key={record._id} onClick={() => handleSelectRecord(record)} className={selectedRecord?._id === record._id ? 'selected' : ''}>
                                    Pet: {record.petName} ({record.vaccineType}) - Submitted: {new Date(record.submittedAt).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{!isLoading ? 'No records currently require verification.' : ''}</p>
                    )}
                    {/* <VerificationQueue 
                        records={pendingRecords}
                        onSelectRecord={handleSelectRecord}
                        selectedRecordId={selectedRecord?._id}
                        isLoading={isLoading}
                    /> */} 
                </div>

                <div className="record-review-panel">
                    {/* Placeholder for RecordReview component */} 
                    {selectedRecord ? (
                        <div>
                            <h3>Reviewing Record: {selectedRecord._id}</h3>
                            <p>Pet: {selectedRecord.petName}</p>
                            <p>Vaccine: {selectedRecord.vaccineType}</p>
                            {/* Add document viewer, comparison tools etc here */}
                            <div className="review-actions">
                                <button onClick={() => handleVerificationComplete(selectedRecord._id, 'verified')}>Approve</button>
                                <button onClick={() => handleVerificationComplete(selectedRecord._id, 'rejected')}>Reject</button>
                                <button onClick={() => setSelectedRecord(null)}>Close</button>
                            </div>
                        </div>
                        /*
                        <RecordReview 
                            recordId={selectedRecord._id}
                            onComplete={handleVerificationComplete}
                            onClose={() => setSelectedRecord(null)}
                        />
                        */
                    ) : (
                        <p>Select a record from the queue to review details.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaccinationVerificationDashboard; 