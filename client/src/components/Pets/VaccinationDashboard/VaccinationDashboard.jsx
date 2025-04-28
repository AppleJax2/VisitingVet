import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Assuming API service module - Uncommented
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
    const [isLoading, setIsLoading] = useState(true); // Added loading state for dashboard data

    const fetchDashboardData = async () => {
        if (!pet?._id) return;
        setIsLoading(true); // Added loading state for dashboard data
        setError(null);
        try {
            // Fetch summary data
            const summaryResponse = await api.get(`/pets/${pet._id}/vaccination-summary`); // Assumed endpoint
            if (summaryResponse.data) {
                 setSummaryStatus(summaryResponse.data.status || 'Unknown');
                 setHasPending(summaryResponse.data.hasPending || false);
            } else {
                 setSummaryStatus('Unknown');
                 setHasPending(false);
            }

            // Fetch reminders (e.g., upcoming expirations)
            const reminderResponse = await api.get(`/pets/${pet._id}/reminders`); // Assumed endpoint
            setReminders(reminderResponse.data?.reminders || []);

        } catch (err) {
            console.error(`[Pet Dashboard] Error fetching dashboard data for pet ${pet._id}:`, err);
            setError(err.response?.data?.message || 'Failed to load dashboard summary. Please try again.');
            setSummaryStatus('Error');
        } finally {
            setIsLoading(false); // Added loading state update
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
        fetchDashboardData(); // Refetch summary
        // Potentially switch tab or update history component directly
        setActiveTab('history'); 
    };

    return (
        <div className="vaccination-dashboard">
            <h2>{pet?.name || 'Pet'}'s Vaccination Dashboard</h2>

            {error && <div className="error-message">{error}</div>}

            {/* Summary Section - Added loading state check */}
            {isLoading ? (
                <div className="summary-section status-unknown"><p>Loading summary...</p></div>
            ) : (
                 <div className={`summary-section ${getStatusIndicatorClass(summaryStatus)}`}>
                    <h3>Overall Status: <span className="status-text">{summaryStatus}</span></h3>
                    {hasPending && <p className="pending-indicator">One or more records are pending review.</p>}
                    {reminders.length > 0 && (
                        <div className="reminders">
                            <h4>Reminders:</h4>
                            <ul>
                                {reminders.map((r, index) => (
                                    <li key={r._id || index}>{r.message || `Reminder for ${r.type}`}</li> // Adjust based on reminder structure
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

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