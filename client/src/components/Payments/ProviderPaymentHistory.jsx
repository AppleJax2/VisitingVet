import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, Spinner, Alert, Card } from 'react-bootstrap';
import { format } from 'date-fns';

function ProviderPaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data } = await api.get('/payments/provider-history');
                if (data.success) {
                    setPayments(data.data || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch payment history');
                }
            } catch (err) {
                const message = err.response?.data?.error || err.message || 'Error fetching payment history';
                console.error("Fetch Provider History Error:", err);
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
            return format(new Date(dateString), 'PPpp');
        } catch {
            return 'Invalid Date';
        }
    };

    // Calculate summary totals
    const totals = payments.reduce((acc, p) => {
        if (p.status === 'succeeded' || p.status === 'refunded') { // Include refunded in gross, net will reflect refund
            acc.gross += p.totalAmount || 0;
            acc.fees += p.platformFee || 0;
            acc.net += p.netAmount || 0;
        }
        if (p.status === 'succeeded') {
            acc.successfulCount++;
        }
        return acc;
    }, { gross: 0, fees: 0, net: 0, successfulCount: 0 });

    return (
        <div className="payment-history-container">
            <h2>My Earnings History</h2>
            {isLoading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!isLoading && !error && (
                <>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Summary</Card.Title>
                            <p>Total Appointments Paid: {totals.successfulCount}</p>
                            <p>Total Gross Received: ${totals.gross.toFixed(2)}</p>
                            <p>Total Platform Fees: ${totals.fees.toFixed(2)}</p>
                            <p><strong>Total Net Earnings: ${totals.net.toFixed(2)}</strong></p>
                            <small>(Note: This reflects payments processed through the platform. Does not include direct Stripe payouts.)</small>
                        </Card.Body>
                    </Card>

                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>Payment Date</th>
                                <th>Service</th>
                                <th>Pet Owner</th>
                                <th>Gross Amt</th>
                                <th>Fee</th>
                                <th>Net Amt</th>
                                <th>Status</th>
                                <th>Appointment Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">No earnings history found.</td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{formatDate(p.date)}</td>
                                        <td>{p.serviceName || 'N/A'}</td>
                                        <td>{p.petOwnerName || 'N/A'}</td>
                                        <td>${p.totalAmount?.toFixed(2)}</td>
                                        <td>${p.platformFee?.toFixed(2)}</td>
                                        <td><strong>${p.netAmount?.toFixed(2)}</strong></td>
                                        <td>{p.status}</td>
                                        <td>{formatDate(p.appointmentDate)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </>
            )}
        </div>
    );
}

export default ProviderPaymentHistory; 