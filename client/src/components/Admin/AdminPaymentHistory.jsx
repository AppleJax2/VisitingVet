import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api'; // Adjust path as needed
import { Table, Spinner, Alert, Pagination, Form, Row, Col, Button, InputGroup, Card } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

const ITEMS_PER_PAGE = 15;
const PAYMENT_STATUSES = ['succeeded', 'pending', 'failed', 'requires_action', 'canceled', 'refunded'];

function AdminPaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // State for filters
    const [filters, setFilters] = useState({
        status: '',
        userId: '',
        providerId: '',
        startDate: '',
        endDate: ''
    });
    const [activeFilters, setActiveFilters] = useState({});

    const fetchHistory = useCallback(async (page = 1, currentFilters = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { 
                page: page, 
                limit: ITEMS_PER_PAGE, 
                ...currentFilters // Include active filters
            };
            // Remove empty filter values
            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });
            
            const { data } = await api.get('/payments/admin-history', { params });
            
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
            console.error("Fetch Admin History Error:", err);
            setError(message);
            setPayments([]);
            setTotalPages(1);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array, fetch triggered by page change or filter apply

    useEffect(() => {
        fetchHistory(currentPage, activeFilters);
    }, [currentPage, activeFilters, fetchHistory]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
             // Parse ISO string before formatting
            return format(parseISO(dateString), 'yyyy-MM-dd HH:mm');
        } catch {
            return 'Invalid Date';
        }
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber !== currentPage) {
            setCurrentPage(pageNumber);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setActiveFilters(filters);
        setCurrentPage(1); // Reset to page 1 when filters change
        // useEffect will trigger fetchHistory
    };

    const clearFilters = () => {
        const clearedFilters = {
            status: '',
            userId: '',
            providerId: '',
            startDate: '',
            endDate: ''
        };
        setFilters(clearedFilters);
        setActiveFilters({});
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
             // If already on page 1, manually trigger fetch if activeFilters was not empty
            if(Object.keys(activeFilters).length > 0) {
                 fetchHistory(1, {});
            }
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        
        // Basic pagination - consider a more advanced component for large number of pages
        let items = [];
        const maxPagesToShow = 5; // Max number of page links shown
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // Adjust startPage if endPage reaches the limit
        startPage = Math.max(1, endPage - maxPagesToShow + 1);

        items.push(
            <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />,
            <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
        );

        if (startPage > 1) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                    {number}
                </Pagination.Item>,
            );
        }

        if (endPage < totalPages) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
        }

         items.push(
            <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />,
            <Pagination.Last key="last" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
        );

        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    return (
        <div className="admin-payment-history mt-3">
            <Card className="mb-3">
                <Card.Header>Filter Payment History</Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="g-2">
                            <Col md={3}>
                                <Form.Group controlId="filterStatus">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={filters.status} onChange={handleFilterChange}>
                                        <option value="">All Statuses</option>
                                        {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="filterUserId">
                                    <Form.Label>Payer User ID</Form.Label>
                                    <Form.Control type="text" name="userId" value={filters.userId} onChange={handleFilterChange} placeholder="Enter Payer User ID" />
                                </Form.Group>
                            </Col>
                             <Col md={3}>
                                <Form.Group controlId="filterProviderId">
                                    <Form.Label>Provider User ID</Form.Label>
                                    <Form.Control type="text" name="providerId" value={filters.providerId} onChange={handleFilterChange} placeholder="Enter Provider User ID" />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="filterStartDate">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                                </Form.Group>
                            </Col>
                             <Col md={3}>
                                <Form.Group controlId="filterEndDate">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                                </Form.Group>
                            </Col>
                            <Col md={3} className="d-flex align-items-end">
                                <Button variant="primary" onClick={applyFilters} className="me-2">Filter</Button>
                                <Button variant="outline-secondary" onClick={clearFilters}>Clear</Button>
                            </Col>
                        </Row>
                    </Form>
                 </Card.Body>
            </Card>

            {isLoading && <div className="text-center"><Spinner animation="border" /> Loading History...</div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!isLoading && !error && (
                <>
                    <div className="mb-2 text-muted">
                        Showing {payments.length} of {totalRecords} records.
                    </div>
                    <Table striped bordered hover responsive size="sm" className="shadow-sm">
                        <thead className="table-light">
                            <tr>
                                <th>Payment Date</th>
                                <th>Payer</th>
                                <th>Provider</th>
                                <th>Gross</th>
                                <th>Fee</th>
                                <th>Net</th>
                                <th>Status</th>
                                <th>Appt Date</th>
                                <th>Service</th>
                                <th>Intent ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="text-center">No payment history found matching filters.</td>
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
                                        <td><Badge bg={p.status === 'succeeded' ? 'success' : (p.status === 'refunded' ? 'warning' : 'secondary')}>{p.status}</Badge></td>
                                        <td>{formatDate(p.appointmentDate)}</td>
                                        <td>{p.serviceName || 'N/A'}</td>
                                        <td><small title={p.paymentIntentId}>{p.paymentIntentId?.substring(0, 10)}...</small></td>
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