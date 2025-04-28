import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Button, Spinner, Alert, Card } from 'react-bootstrap'; // Using react-bootstrap

function StripeConnectManager() {
    const [accountStatus, setAccountStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [onboardingUrl, setOnboardingUrl] = useState(null);
    const [isCreatingLink, setIsCreatingLink] = useState(false);

    const fetchAccountStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/payments/stripe-account');
            setAccountStatus(data);
            setError(null); // Clear previous errors on success
        } catch (err) {
            if (err.response && err.response.status === 404) {
                // 404 means account not created yet, which is normal before onboarding
                setAccountStatus(null); 
            } else {
                const message = err.response?.data?.error || err.message || 'Failed to fetch Stripe account status';
                console.error("Fetch Stripe Account Error:", err);
                setError(message);
                toast.error(message);
                setAccountStatus(null); // Reset status on error
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountStatus();
    }, [fetchAccountStatus]);

    const handleConnectClick = async () => {
        setIsCreatingLink(true);
        setError(null);
        try {
            const { data } = await api.post('/payments/create-connect-account-link');
            if (data.url) {
                // Redirect the user to Stripe for onboarding
                window.location.href = data.url;
            } else {
                throw new Error('Failed to retrieve onboarding URL.');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Failed to start Stripe onboarding';
            console.error("Create Connect Link Error:", err);
            setError(message);
            toast.error(message);
            setIsCreatingLink(false);
        }
        // No finally block for setIsCreatingLink(false) because successful navigation away will stop execution
    };

    const renderStatus = () => {
        if (isLoading) {
            return <Spinner animation="border" size="sm" />; 
        }
        if (error && !accountStatus) { // Show error only if we couldn't fetch any status
            return <Alert variant="danger">Error loading Stripe status: {error}</Alert>;
        }
        if (!accountStatus) {
            // Account not found or initial state before onboarding attempt
            return (
                <Card body>
                    <p>Connect your bank account via Stripe to receive payments directly.</p>
                    <Button onClick={handleConnectClick} disabled={isCreatingLink}>
                        {isCreatingLink ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...</> : 'Connect with Stripe'}
                    </Button>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>} 
                </Card>
            );
        }

        // Account exists, display status
        let statusMessage = 'Unknown Status';
        let statusVariant = 'secondary';
        let needsAction = false;

        switch (accountStatus.status) {
            case 'verified':
                statusMessage = 'Your Stripe account is connected and verified. Payouts are enabled.';
                statusVariant = 'success';
                break;
            case 'pending_verification':
                statusMessage = 'Stripe account connected, but pending verification. Please check Stripe for required actions.';
                statusVariant = 'warning';
                needsAction = true;
                break;
            case 'onboarding_incomplete':
                statusMessage = 'Stripe onboarding is incomplete. Please complete the process to enable payouts.';
                statusVariant = 'info';
                needsAction = true;
                break;
            case 'restricted':
                 statusMessage = 'Your Stripe account is restricted. Payouts may be disabled. Please check Stripe for required actions.';
                statusVariant = 'warning';
                needsAction = true;
                break;
            case 'disabled':
                statusMessage = 'Your Stripe account is disabled. Payouts are not possible. Please contact support.';
                statusVariant = 'danger';
                break;
            default:
                statusMessage = `Status: ${accountStatus.status}. Charges: ${accountStatus.chargesEnabled}, Payouts: ${accountStatus.payoutsEnabled}`;
        }

        return (
            <Card>
                 <Card.Header>Stripe Account Status</Card.Header>
                 <Card.Body>
                    <Alert variant={statusVariant}>{statusMessage}</Alert>
                    <p><strong>Account ID:</strong> {accountStatus.accountId}</p>
                    <p><strong>Charges Enabled:</strong> {accountStatus.chargesEnabled ? 'Yes' : 'No'}</p>
                    <p><strong>Payouts Enabled:</strong> {accountStatus.payoutsEnabled ? 'Yes' : 'No'}</p>
                    
                    {needsAction && (
                         <Button onClick={handleConnectClick} disabled={isCreatingLink} variant="primary" className="mt-2">
                            {isCreatingLink ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Loading...</> : 'Continue Onboarding / Update Account'}
                        </Button>
                    )}
                     {error && <Alert variant="danger" className="mt-3">{error}</Alert>} 
                 </Card.Body>
            </Card>
        );
    };

    return (
        <div className="stripe-connect-manager">
            <h2>Manage Payout Account</h2>
            {renderStatus()}
        </div>
    );
}

export default StripeConnectManager; 