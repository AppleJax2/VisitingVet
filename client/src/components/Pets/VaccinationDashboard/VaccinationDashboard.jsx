import React, { useState, useEffect } from 'react';
// import api from '../../../services/api'; // Assuming API service module
import './VaccinationDashboard.css'; // Add basic styling

// Placeholder components (or integrate directly)
import VaccinationHistory from '../VaccinationHistory/VaccinationHistory';
import VaccinationUpload from '../VaccinationUpload/VaccinationUpload';
import CertificateManager from '../CertificateManager/CertificateManager';

// Assume pet object (or petId) is passed as a prop
const VaccinationDashboard = ({ pet }) => {
    const [summaryStatus, setSummaryStatus] = useState('Loading...');
    const [hasPending, setHasPending] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'upload', 'certificates'

    const fetchDashboardData = async () => {
        if (!pet?._id) return;
        setError(null);
        try {
            console.log(`[Pet Dashboard] Fetching summary data for pet: ${pet._id}`);
            // Example: Fetch summary status directly from Pet model 
            // const petResponse = await api.get(`/pets/${pet._id}/summary`);
            // setSummaryStatus(petResponse.data.latestVerificationStatusSummary || 'Unknown');
            // setHasPending(petResponse.data.hasPendingVerification || false);

            // Or calculate based on fetched records (more work client-side)

            // Simulate fetching summary
            await new Promise(resolve => setTimeout(resolve, 200));
            const simulatedSummary = 'Up-to-date'; // or 'Needs Attention', 'Pending'
            const simulatedPending = false;
            setSummaryStatus(simulatedSummary);
            setHasPending(simulatedPending);

            // Fetch reminders (e.g., upcoming expirations)
            // const reminderResponse = await api.get(`/pets/${pet._id}/reminders`); 
            // setReminders(reminderResponse.data.reminders || []);
            const simulatedReminders = [
                { type: 'upcoming_expiry', vaccine: 'Rabies', daysLeft: 25, date: new Date(2024, 9, 26) },
            ];
            setReminders(simulatedReminders);
            console.log(`[Pet Dashboard] Fetched simulated summary for pet: ${pet._id}`);

        } catch (err) {
            console.error(`[Pet Dashboard] Error fetching dashboard data for pet ${pet._id}:`, err);
            setError('Failed to load dashboard summary. Please try again.');
            setSummaryStatus('Error');
        } 
    };

    useEffect(() => {
        fetchDashboardData();
    }, [pet?._id]);

    const getStatusIndicatorClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'up-to-date': return 'status-good';
            case 'needs attention': return 'status-warning';
            case 'pending': return 'status-pending';
            case 'error': return 'status-error';
            default: return 'status-unknown';
        }
    };

    // Callback for when upload is successful to potentially refresh history/summary
    const handleUploadSuccess = () => {
        console.log('[Pet Dashboard] Upload successful, refreshing data...');
        fetchDashboardData(); // Refetch summary
        // Potentially switch tab or update history component directly
        setActiveTab('history'); 
    };

    return (
        <div className="vaccination-dashboard">
            <h2>{pet?.name || 'Pet'}'s Vaccination Dashboard</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Summary Section */} 
            <div className={`summary-section ${getStatusIndicatorClass(summaryStatus)}`}>
                <h3>Overall Status: <span className="status-text">{summaryStatus}</span></h3>
                {hasPending && <p className="pending-indicator">One or more records are pending review.</p>}
                {reminders.length > 0 && (
                    <div className="reminders">
                        <h4>Reminders:</h4>
                        <ul>
                            {reminders.map((r, index) => (
                                <li key={index}>{r.vaccine} expires in {r.daysLeft} days ({new Date(r.date).toLocaleDateString()})</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Tab Navigation */} 
            <div className="dashboard-tabs">
                <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>History</button>
                <button onClick={() => setActiveTab('upload')} className={activeTab === 'upload' ? 'active' : ''}>Add Record</button>
                <button onClick={() => setActiveTab('certificates')} className={activeTab === 'certificates' ? 'active' : ''}>Certificates</button>
            </div>

            {/* Tab Content */} 
            <div className="dashboard-content">
                {activeTab === 'history' && (
                    <VaccinationHistory petId={pet?._id} />
                )}
                {activeTab === 'upload' && (
                    <VaccinationUpload petId={pet?._id} onUploadSuccess={handleUploadSuccess} />
                )}
                {activeTab === 'certificates' && (
                    <CertificateManager petId={pet?._id} />
                )}
            </div>

        </div>
    );
};

export default VaccinationDashboard; 