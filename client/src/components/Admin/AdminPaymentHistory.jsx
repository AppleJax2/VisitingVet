import React, { useState, useEffect } from 'react';
import api from '../../../services/api'; // Adjust path as needed
import { Table, Spinner, Alert, Pagination, Form, Row, Col, Button } from 'react-bootstrap';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 15;

function AdminPaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // TODO: Add state for filters (user, provider, status, date range)
    // const [filters, setFilters] = useState({ status: '', userId: '', providerId: '', startDate: '', endDate: '' });

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // TODO: Add filters and pagination to API call
                // const params = { page: currentPage, limit: ITEMS_PER_PAGE, ...filters };
                const params = { page: currentPage, limit: ITEMS_PER_PAGE }; // Basic pagination for now
                const { data } = await api.get('/payments/admin-history', { params });
                
                if (data.success) {
                    setPayments(data.data || []);
                    // TODO: Update totalPages based on API response (e.g., data.pagination.totalPages)
                    // For now, assuming the backend sends all data until pagination is added
                    setTotalPages(Math.ceil((data.count || data.data.length) / ITEMS_PER_PAGE));
                } else {
                    throw new Error(data.message || 'Failed to fetch payment history');
                }
            } catch (err) {
                const message = err.response?.data?.error || err.message || 'Error fetching payment history';
                console.error("Fetch Admin History Error:", err);
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [currentPage]); // TODO: Add filters to dependency array when implemented

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
        } catch {
            return 'Invalid Date';
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Placeholder for filter change handlers
    // const handleFilterChange = (e) => { ... }
    // const applyFilters = () => { setCurrentPage(1); fetchHistory(); }

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return <Pagination>{items}</Pagination>;
    };

    return (
        <div className="admin-payment-history">
            <h2>Platform Payment History</h2>
            
            {/* TODO: Add Filter UI */}
            {/* <Form> ... filters ... <Button onClick={applyFilters}>Filter</Button> </Form> */}

            {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!isLoading && !error && (
                <>
                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>Payment Date</th>
                                <th>Payer</th>
                                <th>Provider</th>
                                <th>Gross Amt</th>
                                <th>Fee</th>
                                <th>Net Amt</th>
                                <th>Status</th>
                                <th>Appt Date</th>
                                <th>Service</th>
                                <th>Intent ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center">No payment history found.</td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p.id}>
                                        <td>{formatDate(p.paymentDate)}</td>
                                        <td>{p.payerName || 'N/A'}<br/><small>{p.payerEmail}</small></td>
                                        <td>{p.providerName || 'N/A'}<br/><small>{p.providerEmail}</small></td>
                                        <td>${p.totalAmount?.toFixed(2)}</td>
                                        <td>${p.platformFee?.toFixed(2)}</td>
                                        <td>${p.netAmount?.toFixed(2)}</td>
                                        <td>{p.status}</td>
                                        <td>{formatDate(p.appointmentDate)}</td>
                                        <td>{p.serviceName || 'N/A'}</td>
                                        <td><small>{p.paymentIntentId}</small></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}
        </div>
    );
}

export default AdminPaymentHistory; 