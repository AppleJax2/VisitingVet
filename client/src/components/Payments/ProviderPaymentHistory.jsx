import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Spinner, Alert, Pagination, Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const ITEMS_PER_PAGE = 10;
const PAYMENT_STATUSES = ['succeeded', 'pending', 'failed', 'requires_action', 'canceled', 'refunded'];

function ProviderPaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Filters state
    const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
    const [activeFilters, setActiveFilters] = useState({});

    const fetchHistory = useCallback(async (page = 1, currentFilters = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { page, limit: ITEMS_PER_PAGE, ...currentFilters };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            // Use the correct API endpoint
            const { data } = await api.get('/payments/provider-history', { params });

            if (data.success) {
                setPayments(data.data || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalRecords(data.pagination?.total || 0);
                setCurrentPage(data.pagination?.page || 1);
            } else {
                throw new Error(data.message || 'Failed to fetch payment history');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error fetching payment history';
            console.error("Fetch Provider History Error:", err);
            setError(message);
            setPayments([]);
            setTotalPages(1);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory(currentPage, activeFilters);
    }, [currentPage, activeFilters, fetchHistory]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), 'yyyy-MM-dd HH:mm');
        } catch {
            return 'Invalid Date';
        }
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== currentPage) setCurrentPage(pageNumber);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ status: '', startDate: '', endDate: '' });
        setActiveFilters({});
        if (currentPage !== 1) setCurrentPage(1);
        else if (Object.keys(activeFilters).length > 0) fetchHistory(1, {});
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        let items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        startPage = Math.max(1, endPage - maxPagesToShow + 1);

        items.push(
            <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />,
            <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        );
        if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        for (let number = startPage; number <= endPage; number++) {
            items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</Pagination.Item>);
        }
        if (endPage < totalPages) items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        items.push(
            <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />,
            <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        );
        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    return (
        <Card className="mt-4 shadow-sm">
            <Card.Header as="h5">My Earnings History</Card.Header>
            <Card.Body>
                {/* Filters */}
                <Form className="mb-3 p-3 bg-light border rounded">
                    <Row className="g-2 align-items-end">
                        <Col md={3}>
                            <Form.Group controlId="providerFilterStatus">
                                <Form.Label><small>Status</small></Form.Label>
                                <Form.Select size="sm" name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">All</option>
                                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="providerFilterStartDate">
                                <Form.Label><small>Start Date</small></Form.Label>
                                <Form.Control size="sm" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="providerFilterEndDate">
                                <Form.Label><small>End Date</small></Form.Label>
                                <Form.Control size="sm" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button variant="primary" size="sm" onClick={applyFilters} className="me-2">Filter</Button>
                            <Button variant="outline-secondary" size="sm" onClick={clearFilters}>Clear</Button>
                        </Col>
                    </Row>
                </Form>

                {isLoading && <div className="text-center"><Spinner animation="border" /> Loading history...</div>}
                {error && <Alert variant="danger">{error}</Alert>}
                {!isLoading && !error && (
                    <>
                        <div className="mb-2 text-muted">
                            <small>Showing {payments.length} of {totalRecords} records.</small>
                        </div>
                        <Table striped bordered hover responsive size="sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Payment Date</th>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Gross</th>
                                    <th>Fee</th>
                                    <th>Net Payout</th>
                                    <th>Status</th>
                                    <th>Appt Date</th>
                                    <th>Intent ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center">No payment history found{Object.keys(activeFilters).length > 0 ? ' matching filters' : ''}.</td>
                                    </tr>
                                ) : (
                                    payments.map(p => (
                                        <tr key={p.id}>
                                            <td>{formatDate(p.date)}</td>
                                            <td>{p.petOwnerName || 'N/A'}<br/><small>{p.petOwnerEmail}</small></td>
                                            <td>{p.serviceName || 'N/A'}</td>
                                            <td>${p.totalAmount?.toFixed(2)}</td>
                                            <td>${p.platformFee?.toFixed(2)}</td>
                                            <td>${p.netAmount?.toFixed(2)}</td>
                                            <td><Badge bg={p.status === 'succeeded' ? 'success' : (p.status === 'refunded' ? 'warning' : 'secondary')}>{p.status}</Badge></td>
                                            <td>{formatDate(p.appointmentDate)}</td>
                                            <td><small title={p.paymentIntentId}>{p.paymentIntentId?.substring(0, 10)}...</small></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                        {renderPagination()}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default ProviderPaymentHistory; 