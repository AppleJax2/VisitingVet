import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns'; // For formatting dates

function PetOwnerPaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data } = await api.get('/payments/my-history');
                if (data.success) {
                    setPayments(data.data || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch payment history');
                }
            } catch (err) {
                const message = err.response?.data?.error || err.message || 'Error fetching payment history';
                console.error("Fetch Pet Owner History Error:", err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPpp'); // Format: Sep 09, 2024, 1:30:00 PM
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="payment-history-container">
            <h2>My Payment History</h2>
            {isLoading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!isLoading && !error && (
                <Table striped bordered hover responsive size="sm">
                    <thead>
                        <tr>
                            <th>Payment Date</th>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Appointment Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No payment history found.</td>
                            </tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id}>
                                    <td>{formatDate(p.date)}</td>
                                    <td>{p.serviceName || 'N/A'}</td>
                                    <td>{p.providerName || 'N/A'}</td>
                                    <td>${p.amount?.toFixed(2)} {p.currency?.toUpperCase()}</td>
                                    <td>{p.status}</td>
                                    <td>{formatDate(p.appointmentDate)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}
        </div>
    );
}

export default PetOwnerPaymentHistory; 