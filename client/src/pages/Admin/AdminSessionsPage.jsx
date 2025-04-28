import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Alert, Spinner, Badge, Card, Form, Row, Col, Pagination } from 'react-bootstrap';
import { ClockHistory, XCircleFill, Search } from 'react-bootstrap-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { adminGetActiveSessions, adminTerminateSession } from '../../services/api';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';
import logger from '../../utils/logger';

const AdminSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [sessionToTerminate, setSessionToTerminate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSessions = useCallback(async (page = 1) => {
        setLoading(true);
        setError('');
        
        try {
            const filters = {};
            if (filter) filters.search = filter;
            if (roleFilter) filters.role = roleFilter;
            
            const response = await adminGetActiveSessions(page, 20, filters);
            if (response.success) {
                setSessions(response.data);
                setPagination(response.pagination || {});
                setCurrentPage(page);
            } else {
                setError(response.error || 'Failed to load active sessions');
            }
        } catch (err) {
            logger.error('Error fetching active sessions:', err);
            setError(err.message || 'An error occurred while fetching the sessions');
        } finally {
            setLoading(false);
        }
    }, [filter, roleFilter]);

    useEffect(() => {
        fetchSessions(1);
    }, [fetchSessions]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchSessions(page);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleRoleFilterChange = (e) => {
        setRoleFilter(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSessions(1);
    };

    const handleConfirmTerminate = (session) => {
        setSessionToTerminate(session);
        setShowConfirmModal(true);
    };

    const handleTerminateSession = async () => {
        if (!sessionToTerminate) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await adminTerminateSession(sessionToTerminate.id);
            
            if (response.success) {
                setSessions(sessions.filter(s => s.id !== sessionToTerminate.id));
                setSuccess(`Session terminated successfully for user ${sessionToTerminate.user.email}`);
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.error || 'Failed to terminate session');
            }
        } catch (err) {
            logger.error('Error terminating session:', err);
            setError(err.message || 'An error occurred while terminating the session');
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
            setSessionToTerminate(null);
        }
    };

    const renderPaginationItems = () => {
        if (!pagination.totalPages || pagination.totalPages <= 1) return null;
        
        const items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        items.push(
            <Pagination.First 
                key="first" 
                onClick={() => handlePageChange(1)} 
                disabled={currentPage === 1} 
            />
        );
        
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
            />
        );
        
        if (startPage > 1) {
            items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
        }
        
        for (let page = startPage; page <= endPage; page++) {
            items.push(
                <Pagination.Item 
                    key={page} 
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </Pagination.Item>
            );
        }
        
        if (endPage < pagination.totalPages) {
            items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
        }
        
        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === pagination.totalPages} 
            />
        );
        
        items.push(
            <Pagination.Last 
                key="last" 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={currentPage === pagination.totalPages} 
            />
        );
        
        return items;
    };

    const getStatusBadge = (session) => {
        if (session.isExpired) {
            return <Badge bg="danger">Expired</Badge>;
        }
        
        const minutesLeft = session.expiresInMinutes;
        
        if (minutesLeft < 5) {
            return <Badge bg="warning">Expires Soon</Badge>;
        }
        
        return <Badge bg="success">Active</Badge>;
    };

    const formatLastActivity = (lastActivity) => {
        return formatDistanceToNow(new Date(lastActivity), { addSuffix: true });
    };

    return (
        <Container fluid>
            <h2 className="mb-4">
                <ClockHistory className="me-2" />
                Active User Sessions
            </h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Card className="mb-4">
                <Card.Header>
                    <h5 className="mb-0">Filters</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row>
                            <Col md={5}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Search</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        placeholder="Search by name, email, or IP"
                                        value={filter}
                                        onChange={handleFilterChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Filter by Role</Form.Label>
                                    <Form.Select
                                        value={roleFilter}
                                        onChange={handleRoleFilterChange}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="Admin">Admin</option>
                                        <option value="PetOwner">Pet Owner</option>
                                        <option value="MVSProvider">MVS Provider</option>
                                        <option value="Clinic">Clinic</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end">
                                <Form.Group className="mb-3 w-100">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="w-100"
                                        disabled={loading}
                                    >
                                        <Search className="me-1" />
                                        Search
                                    </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading sessions...</p>
                </div>
            ) : (
                <>
                    {sessions.length === 0 ? (
                        <Alert variant="info">
                            No active sessions found matching your criteria.
                        </Alert>
                    ) : (
                        <>
                            <Table responsive striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>IP Address</th>
                                        <th>Last Activity</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map(session => (
                                        <tr key={session.id}>
                                            <td>
                                                <div>{session.user.name}</div>
                                                <div className="text-muted small">{session.user.email}</div>
                                            </td>
                                            <td>
                                                <Badge 
                                                    bg={
                                                        session.user.role === 'Admin' ? 'danger' : 
                                                        session.user.role === 'MVSProvider' ? 'primary' :
                                                        session.user.role === 'Clinic' ? 'info' : 'secondary'
                                                    }
                                                >
                                                    {session.user.role}
                                                </Badge>
                                            </td>
                                            <td>
                                                {session.ipAddress}
                                                {session.location && (
                                                    <div className="text-muted small">
                                                        {session.location}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>
                                                    {format(new Date(session.lastActivity), 'MMM d, yyyy h:mm a')}
                                                </div>
                                                <div className="text-muted small">
                                                    {formatLastActivity(session.lastActivity)}
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(session)}
                                                {!session.isExpired && (
                                                    <div className="text-muted small">
                                                        Expires in {session.expiresInMinutes} minutes
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleConfirmTerminate(session)}
                                                    disabled={session.isExpired}
                                                >
                                                    <XCircleFill className="me-1" />
                                                    Terminate
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination>
                                        {renderPaginationItems()}
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
            
            <ConfirmActionModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={handleTerminateSession}
                title="Confirm Session Termination"
                body={
                    sessionToTerminate ? 
                    `Are you sure you want to terminate the session for ${sessionToTerminate.user.email}? They will be logged out immediately.` :
                    'Are you sure you want to terminate this session?'
                }
                confirmButtonText="Terminate Session"
                confirmButtonVariant="danger"
                isConfirming={isSubmitting}
            />
        </Container>
    );
};

export default AdminSessionsPage; 