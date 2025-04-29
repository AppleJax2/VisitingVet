import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Table, Spinner, Alert, Pagination, Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const ITEMS_PER_PAGE = 10;
const PAYMENT_STATUSES = ['succeeded', 'pending', 'failed', 'requires_action', 'canceled', 'refunded'];

function PetOwnerPaymentHistory() {
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
            
            // Assuming API function exists: getPetOwnerPaymentHistory
            const { data } = await api.get('/payments/my-history', { params });
            
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
            console.error("Fetch Pet Owner History Error:", err);
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

    const renderPaginationItems = () => {
        if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
            return null;
        }

        let items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // Handle missing Pagination properties gracefully
        if (!Pagination) return [];

        if (Pagination.First) {
            items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
        }
        
        if (Pagination.Prev) {
            items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);
        }

        if (startPage > 1 && Pagination.Ellipsis) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }

        for (let number = startPage; number <= endPage; number++) {
            if (Pagination.Item) {
                items.push(
                    <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                        {number}
                    </Pagination.Item>
                );
            }
        }

        if (endPage < pagination.totalPages && Pagination.Ellipsis) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }

        if (Pagination.Next) {
            items.push(
                <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} />
            );
        }
        
        if (Pagination.Last) {
            items.push(
                <Pagination.Last key="last" onClick={() => handlePageChange(pagination.totalPages)} disabled={currentPage === pagination.totalPages} />
            );
        }

        return items;
    };

    return (
        <Card className="mt-4 shadow-sm">
            <Card.Header as="h5">My Payment History</Card.Header>
            <Card.Body>
                 {/* Filters */}
                <Form className="mb-3 p-3 bg-light border rounded">
                    <Row className="g-2 align-items-end">
                         <Col md={3}>
                            <Form.Group controlId="petOwnerFilterStatus">
                                <Form.Label><small>Status</small></Form.Label>
                                <Form.Select size="sm" name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">All</option>
                                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="petOwnerFilterStartDate">
                                <Form.Label><small>Start Date</small></Form.Label>
                                <Form.Control size="sm" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                            </Form.Group>
                        </Col>
                         <Col md={3}>
                            <Form.Group controlId="petOwnerFilterEndDate">
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
                                    <th>Provider</th>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Appt Date</th>
                                    <th>Intent ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No payment history found{Object.keys(activeFilters).length > 0 ? ' matching filters' : ''}.</td>
                                    </tr>
                                ) : (
                                    payments.map(p => (
                                        <tr key={p.id}>
                                            <td>{formatDate(p.date)}</td>
                                            <td>{p.providerName || 'N/A'}</td>
                                            <td>{p.serviceName || 'N/A'}</td>
                                            <td>${p.amount?.toFixed(2)} {p.currency?.toUpperCase()}</td>
                                            <td><Badge bg={p.status === 'succeeded' ? 'success' : (p.status === 'refunded' ? 'warning' : 'secondary')}>{p.status}</Badge></td>
                                            <td>{formatDate(p.appointmentDate)}</td>
                                            <td><small title={p.paymentIntentId}>{p.paymentIntentId?.substring(0, 10)}...</small></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                        {renderPaginationItems()}
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default PetOwnerPaymentHistory; 