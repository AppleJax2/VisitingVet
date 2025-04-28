import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import StripeCheckoutWrapper from '../components/Payments/StripeCheckoutForm';

function PaymentPage() {
    // Get appointmentId from URL parameters
    const { appointmentId } = useParams(); 
    
    // Optional: Get amount/service details from location state if passed during navigation
    const location = useLocation();
    const appointmentDetails = location.state?.appointmentDetails;

    console.log("Rendering Payment Page for Appointment:", appointmentId);
    console.log("Appointment Details from state:", appointmentDetails);


    return (
        <div className="payment-page-container">
            <h1>Complete Your Payment</h1>
            
            {appointmentDetails && (
                <div className="appointment-summary">
                    <h2>Appointment Summary</h2>
                    <p><strong>Service:</strong> {appointmentDetails.serviceName || 'N/A'}</p>
                    <p><strong>Provider:</strong> {appointmentDetails.providerName || 'N/A'}</p>
                    <p><strong>Date:</strong> {appointmentDetails.date ? new Date(appointmentDetails.date).toLocaleString() : 'N/A'}</p>
                    <p><strong>Amount:</strong> ${appointmentDetails.amount ? appointmentDetails.amount.toFixed(2) : 'N/A'}</p>
                </div>
            )}

            <p>Please enter your payment details below:</p>

            {appointmentId ? (
                <StripeCheckoutWrapper appointmentId={appointmentId} />
            ) : (
                <p style={{color: 'red'}}>Error: No Appointment ID provided.</p>
            )}

            <style jsx>{`
                .payment-page-container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    background-color: #fff;
                }
                h1 {
                    text-align: center;
                    margin-bottom: 30px;
                    color: #333;
                }
                 .appointment-summary {
                    background-color: #f9f9f9;
                    border: 1px solid #eee;
                    border-radius: 4px;
                    padding: 15px;
                    margin-bottom: 20px;
                }
                .appointment-summary h2 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 1.1em;
                    color: #555;
                }
                 .appointment-summary p {
                     margin: 5px 0;
                     color: #444;
                 }
            `}</style>
        </div>
    );
}

export default PaymentPage; 