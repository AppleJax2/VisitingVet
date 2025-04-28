import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Form, Row, Col, Button, Pagination, Badge, Card, Collapse } from 'react-bootstrap';
import { format } from 'date-fns';
import { adminGetVerificationHistory, adminGetActionLogs } from '../../services/api';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import ErrorMessage from '../../components/Shared/ErrorMessage';
import DocumentViewer from '../../components/Admin/DocumentViewer';

/**
 * AdminVerificationHistoryPage
 *
 * Displays a full audit trail and history of all verification requests and related admin actions.
 * Features:
 *  - Filterable, paginated verification request history
 *  - Filterable, paginated admin action logs (verification-related)
 *  - Document viewing with secure links
 *  - Robust error handling and loading states
 *  - Clean, accessible, production-grade UI
 *
 * Usage:
 *   <AdminVerificationHistoryPage />
 */
function AdminVerificationHistoryPage() {
  // State for verification history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyFilters, setHistoryFilters] = useState({ status: '', userId: '', reviewerId: '', startDate: '', endDate: '', search: '' });

  // State for admin action logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsFilters, setLogsFilters] = useState({ actionType: 'VerifyUser', search: '' });

  // State for document viewer
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docToView, setDocToView] = useState(null);

  // Fetch verification history
  const fetchHistory = useCallback(async (page = 1, filters = {}) => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const { data, pagination } = await adminGetVerificationHistory(page, 15, filters);
      setHistory(data || []);
      setHistoryPage(pagination.page);
      setHistoryTotalPages(pagination.pages);
    } catch (err) {
      setHistoryError(err.error || err.message || 'Failed to fetch verification history');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch admin action logs (verification-related)
  const fetchLogs = useCallback(async (page = 1, filters = {}) => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const { data, pagination } = await adminGetActionLogs(page, 15, { ...filters, actionType: 'VerifyUser' });
      setLogs(data || []);
      setLogsPage(pagination.page);
      setLogsTotalPages(pagination.pages);
    } catch (err) {
      setLogsError(err.error || err.message || 'Failed to fetch admin action logs');
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // Initial and filter-triggered fetches
  useEffect(() => {
    fetchHistory(historyPage, historyFilters);
  }, [fetchHistory, historyPage, historyFilters]);

  useEffect(() => {
    fetchLogs(logsPage, logsFilters);
  }, [fetchLogs, logsPage, logsFilters]);

  // Handlers for filters
  const handleHistoryFilterChange = (e) => {
    const { name, value } = e.target;
    setHistoryFilters((prev) => ({ ...prev, [name]: value }));
    setHistoryPage(1);
  };
  const handleLogsFilterChange = (e) => {
    const { name, value } = e.target;
    setLogsFilters((prev) => ({ ...prev, [name]: value }));
    setLogsPage(1);
  };

  // Document viewing
  const handleViewDocument = (doc) => {
    setDocToView(doc);
    setShowDocViewer(true);
  };
  const handleCloseDocViewer = () => {
    setShowDocViewer(false);
    setDocToView(null);
  };

  // Render pagination
  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => onPageChange(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  // Main render
  return (
    <Container className="admin-verification-history-page py-4">
      <h2>Verification History & Audit Trail</h2>
      <Card className="mb-4">
        <Card.Header>Verification Request History</Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={2}>
                <Form.Group controlId="filterStatus">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={historyFilters.status} onChange={handleHistoryFilterChange}>
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="filterUserId">
                  <Form.Label>User ID</Form.Label>
                  <Form.Control name="userId" value={historyFilters.userId} onChange={handleHistoryFilterChange} placeholder="User ID" />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="filterReviewerId">
                  <Form.Label>Reviewer ID</Form.Label>
                  <Form.Control name="reviewerId" value={historyFilters.reviewerId} onChange={handleHistoryFilterChange} placeholder="Reviewer ID" />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="filterStartDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control type="date" name="startDate" value={historyFilters.startDate} onChange={handleHistoryFilterChange} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="filterEndDate">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control type="date" name="endDate" value={historyFilters.endDate} onChange={handleHistoryFilterChange} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="filterSearch">
                  <Form.Label>Search</Form.Label>
                  <Form.Control name="search" value={historyFilters.search} onChange={handleHistoryFilterChange} placeholder="Notes or keywords" />
                </Form.Group>
              </Col>
            </Row>
          </Form>
          {historyLoading ? (
            <LoadingSpinner message="Loading verification history..." />
          ) : historyError ? (
            <ErrorMessage message={historyError} />
          ) : (
            <>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Reviewed By</th>
                    <th>Reviewed At</th>
                    <th>Notes</th>
                    <th>Documents</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr><td colSpan="7" className="text-center">No verification history found.</td></tr>
                  ) : history.map((req) => (
                    <tr key={req._id}>
                      <td>{formatDate(req.createdAt)}</td>
                      <td>
                        {req.user?.name || req.user?.email || req.user?._id || 'N/A'}<br />
                        <small>{req.user?.email}</small>
                      </td>
                      <td>
                        <Badge bg={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}>{req.status}</Badge>
                      </td>
                      <td>{req.reviewedBy?.name || req.reviewedBy?.email || req.reviewedBy?._id || 'N/A'}</td>
                      <td>{formatDate(req.reviewedAt)}</td>
                      <td>{req.notes || '-'}</td>
                      <td>
                        {Array.isArray(req.submittedDocuments) && req.submittedDocuments.length > 0 ? (
                          req.submittedDocuments.map((doc, idx) => (
                            <div key={idx} className="mb-1">
                              <Button size="sm" variant="outline-primary" onClick={() => handleViewDocument(doc)} disabled={!doc.signedUrl}>
                                View {doc.documentType}
                              </Button>
                              {doc.signedUrl && (
                                <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" className="ms-2">Download</a>
                              )}
                            </div>
                          ))
                        ) : (
                          <span>No documents</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {renderPagination(historyPage, historyTotalPages, setHistoryPage)}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Verification Audit Trail (Admin Actions)</Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Row>
              <Col md={3}>
                <Form.Group controlId="logActionType">
                  <Form.Label>Action Type</Form.Label>
                  <Form.Select name="actionType" value={logsFilters.actionType} onChange={handleLogsFilterChange}>
                    <option value="">All</option>
                    <option value="VerifyUser">VerifyUser</option>
                    <option value="RejectVerification">RejectVerification</option>
                    <option value="BulkVerifyUser">BulkVerifyUser</option>
                    <option value="BulkBanUser">BulkBanUser</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="logSearch">
                  <Form.Label>Search</Form.Label>
                  <Form.Control name="search" value={logsFilters.search} onChange={handleLogsFilterChange} placeholder="Reason, user, etc." />
                </Form.Group>
              </Col>
            </Row>
          </Form>
          {logsLoading ? (
            <LoadingSpinner message="Loading admin action logs..." />
          ) : logsError ? (
            <ErrorMessage message={logsError} />
          ) : (
            <>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Admin</th>
                    <th>Target User</th>
                    <th>Action</th>
                    <th>Reason</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="6" className="text-center">No admin actions found.</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDate(log.createdAt)}</td>
                      <td>{log.adminUser?.name || log.adminUser?.email || log.adminUser?._id || 'N/A'}</td>
                      <td>{log.targetUser?.name || log.targetUser?.email || log.targetUser?._id || 'N/A'}</td>
                      <td><Badge bg="info">{log.actionType}</Badge></td>
                      <td>{log.reason || '-'}</td>
                      <td><pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{JSON.stringify(log.details, null, 2)}</pre></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {renderPagination(logsPage, logsTotalPages, setLogsPage)}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Document Viewer Modal */}
      <Collapse in={showDocViewer} dimension="height">
        <div>
          {showDocViewer && docToView && (
            <DocumentViewer
              show={showDocViewer}
              onHide={handleCloseDocViewer}
              document={docToView}
            />
          )}
        </div>
      </Collapse>
    </Container>
  );
}

export default AdminVerificationHistoryPage; 