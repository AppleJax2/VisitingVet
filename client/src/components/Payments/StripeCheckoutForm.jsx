import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api'; // Assuming an axios instance
import { toast } from 'react-toastify';
import config from '../../config'; // Assuming config file with Stripe publishable key

// Ensure you load Stripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(config.stripePublishableKey);

// The actual checkout form, wrapped by Elements provider
const CheckoutForm = ({ appointmentId, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            setMessage("Stripe is not ready yet.");
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/appointment/${appointmentId}/payment-success`, // Adjust URL as needed
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
                console.error("Stripe confirmation error:", error);
            }
            setIsLoading(false);
        } else {
             // This block might not be reached if redirect occurs
            setMessage("Payment processing...");
        }


    };

    const paymentElementOptions = {
        layout: "tabs"
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={isLoading || !stripe || !elements} id="submit" className="stripe-button">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
                </span>
            </button>
            {/* Show any error or success messages */} 
            {message && <div id="payment-message">{message}</div>}

            <style jsx>{`
                .stripe-button {
                    background: #5469d4;
                    color: #ffffff;
                    border-radius: 4px;
                    border: 0;
                    padding: 12px 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: block;
                    transition: all 0.2s ease;
                    box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
                    width: 100%;
                    margin-top: 20px;
                }
                .stripe-button:hover {
                    filter: contrast(115%);
                }
                .stripe-button:disabled {
                    opacity: 0.5;
                    cursor: default;
                }
                #payment-message {
                    color: rgb(105, 115, 134);
                    font-size: 16px;
                    line-height: 20px;
                    padding-top: 12px;
                    text-align: center;
                }
                .spinner, .spinner:before, .spinner:after {
                    border-radius: 50%;
                }
                .spinner {
                    color: #ffffff;
                    font-size: 22px;
                    text-indent: -99999px;
                    margin: 0px auto;
                    position: relative;
                    width: 20px;
                    height: 20px;
                    box-shadow: inset 0 0 0 2px;
                    transform: translateZ(0);
                }
                .spinner:before, .spinner:after {
                    position: absolute;
                    content: "";
                }
                .spinner:before {
                    width: 10.4px;
                    height: 20.4px;
                    background: #5469d4;
                    border-radius: 20.4px 0 0 20.4px;
                    top: -0.2px;
                    left: -0.2px;
                    transform-origin: 10.4px 10.2px;
                    animation: loading 2s infinite ease 1.5s;
                }
                .spinner:after {
                    width: 10.4px;
                    height: 10.2px;
                    background: #5469d4;
                    border-radius: 0 10.2px 10.2px 0;
                    top: -0.1px;
                    left: 10.2px;
                    transform-origin: 0px 10.2px;
                    animation: loading 2s infinite ease;
                }
                @keyframes loading {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </form>
    );
}

// Wrapper component to fetch clientSecret and provide Elements context
const StripeCheckoutWrapper = ({ appointmentId }) => {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClientSecret = async () => {
            if (!appointmentId) {
                setError("Appointment ID is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const { data } = await api.post('/payments/create-intent', { appointmentId });
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Error fetching client secret:", err);
                const errorMessage = err.response?.data?.error || err.message || "Failed to initialize payment.";
                setError(errorMessage);
                toast.error(`Payment Initialization Failed: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchClientSecret();
    }, [appointmentId]);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    if (loading) {
        return <div>Loading payment options...</div>; 
    }

    if (error) {
        return <div style={{color: 'red'}}>Error: {error}</div>;
    }

    if (!clientSecret) {
        return <div>Could not load payment information.</div>;
    }

    return (
        <Elements options={options} stripe={stripePromise}>
            <CheckoutForm appointmentId={appointmentId} clientSecret={clientSecret} />
        </Elements>
    );
};

export default StripeCheckoutWrapper; 