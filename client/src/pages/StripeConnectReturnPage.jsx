import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

function StripeConnectReturnPage() {
    const navigate = useNavigate();

    useEffect(() => {
        // Optionally, trigger a refresh of provider status in the background
        // Or simply redirect back to the dashboard/settings page after a delay
        const timer = setTimeout(() => {
            // Redirect to provider dashboard or settings page where connect status is shown
            navigate('/dashboard/provider'); // Adjust target route as needed
        }, 3000); // 3 second delay

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <Alert variant="success">
                <h4>Stripe Onboarding Completed</h4>
                <p>You are being returned to your dashboard. Your account status may take a few moments to update.</p>
            </Alert>
        </div>
    );
}

export default StripeConnectReturnPage; 