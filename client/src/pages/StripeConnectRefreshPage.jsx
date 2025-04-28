import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button } from 'react-bootstrap';
import api from '../services/api'; // Assuming api service exists
import { toast } from 'react-toastify';

function StripeConnectRefreshPage() {
    const navigate = useNavigate();

    const handleRetry = async () => {
        // Re-try creating the account link
        try {
            const { data } = await api.post('/payments/create-connect-account-link');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Failed to retrieve new onboarding URL.');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Failed to restart Stripe onboarding';
            console.error("Retry Connect Link Error:", err);
            toast.error(message);
            // Optionally navigate back to dashboard on failure to retry
            // navigate('/dashboard/provider'); 
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <Alert variant="warning">
                <h4>Stripe Link Expired or Invalid</h4>
                <p>The link to connect your Stripe account may have expired. Please try again.</p>
                <hr />
                <div className="d-flex justify-content-end">
                    <Button variant="primary" onClick={handleRetry} className="me-2">
                        Retry Connection
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/dashboard/provider')}> {/* Adjust route */}
                        Back to Dashboard
                    </Button>
                </div>
            </Alert>
        </div>
    );
}

export default StripeConnectRefreshPage; 