import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../services/api'; // Assuming API service

function PaymentSuccessPage() {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [paymentIntentId, setPaymentIntentId] = useState(null);
    const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const paymentIntent = searchParams.get('payment_intent');
        const clientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        setPaymentIntentId(paymentIntent);
        setPaymentIntentClientSecret(clientSecret);

        if (!paymentIntent || !clientSecret) {
            setError('Missing payment information in redirect.');
            setStatus('error');
            return;
        }

        // You might want to verify the payment status with your backend here
        // for extra security, though the webhook should handle the actual fulfillment.
        // This page mainly confirms the redirect was successful.

        if (redirectStatus === 'succeeded') {
            setStatus('succeeded');
            // Optionally fetch payment details from backend using paymentIntentId
            // E.g., fetch(`/api/payments/${paymentIntentId}`)
        } else if (redirectStatus === 'processing') {
            setStatus('processing');
        } else {
            setStatus('failed');
            // You could fetch the PaymentIntent from Stripe using the clientSecret
            // or your backend to get more details about the failure.
            setError(`Payment status: ${redirectStatus}`);
        }

    }, [searchParams]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <p>Verifying payment status...</p>;
            case 'succeeded':
                return (
                    <div>
                        <h2>Payment Successful!</h2>
                        <p>Your payment for appointment {appointmentId} has been confirmed.</p>
                        <p>Payment Intent ID: {paymentIntentId}</p>
                        <p>Thank you!</p>
                        <Link to={`/my-appointments`}>View My Appointments</Link> {/* Adjust link as needed */}
                    </div>
                );
            case 'processing':
                return (
                    <div>
                        <h2>Payment Processing</h2>
                        <p>Your payment is processing. We will update you when it's complete.</p>
                        <p>Payment Intent ID: {paymentIntentId}</p>
                        <Link to={`/my-appointments`}>View My Appointments</Link>
                    </div>
                );
            case 'failed':
                return (
                    <div>
                        <h2>Payment Failed</h2>
                        <p>Unfortunately, your payment could not be processed.</p>
                        {error && <p>Reason: {error}</p>}
                        <p>Please try again or contact support.</p>
                        <p>Payment Intent ID: {paymentIntentId}</p>
                        <Link to={`/pay/appointment/${appointmentId}`}>Try Payment Again</Link>
                        {' | '} 
                        <Link to="/contact-support">Contact Support</Link> {/* Adjust link */}
                    </div>
                );
            case 'error':
                 return (
                    <div>
                        <h2>Error</h2>
                        <p>There was an error processing your payment redirect.</p>
                        {error && <p>Details: {error}</p>}
                        <Link to="/dashboard">Go to Dashboard</Link>
                    </div>
                );
            default:
                return <p>Unknown payment status.</p>;
        }
    };

    return (
        <div className="payment-status-container">
            {renderContent()}
            <style jsx>{`
                .payment-status-container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 30px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    background-color: #fff;
                    text-align: center;
                }
                h2 {
                    color: #333;
                    margin-bottom: 20px;
                }
                p {
                    color: #555;
                    margin-bottom: 10px;
                    line-height: 1.6;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    margin: 0 10px;
                }
                a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}

export default PaymentSuccessPage; 