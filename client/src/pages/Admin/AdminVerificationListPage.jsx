import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Pagination, Modal, Form, Card, ListGroup } from 'react-bootstrap';
import { adminGetPendingVerifications, adminApproveVerification, adminRejectVerification } from '../../services/api';
import { CheckCircleFill, XCircleFill, FileEarmarkTextFill } from 'react-bootstrap-icons';
import { format } from 'date-fns';

const AdminVerificationListPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminGetPendingVerifications(page, 10); // Fetch 10 per page
      if (response.success) {
        setRequests(response.data || []);
        setPagination(response.pagination || {});
        setCurrentPage(page);
      } else {
        setError(response.error || 'Failed to load verification requests.');
        setRequests([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError(err.message || 'An error occurred fetching requests.');
      setRequests([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleShowRejectModal = (request) => {
    setRequestToReject(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRequestToReject(null);
  };

  const handleShowDetailsModal = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const handleRejectConfirm = async () => {
    if (!requestToReject || !rejectReason) return;
    try {
      await adminRejectVerification(requestToReject._id, rejectReason);
      handleCloseRejectModal();
      fetchRequests(1); // Refresh list from page 1
      // Show success toast/message
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
      // Show error toast/message
    }
  };

  const handleApprove = async (requestId) => {
    if (!window.confirm('Are you sure you want to approve this verification request?')) return;
    try {
      await adminApproveVerification(requestId);
      fetchRequests(1); // Refresh list from page 1
      // Show success toast/message
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
      // Show error toast/message
    }
  };

  const renderPaginationItems = () => {
    // (Same pagination logic as AdminUserListPage)
    if (!pagination.pages || pagination.pages <= 1) return null;
    let items = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.pages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    items.push(<Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />);
    items.push(<Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />);
    if (startPage > 1) items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    for (let number = startPage; number <= endPage; number++) {
      items.push(<Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>{number}</Pagination.Item>);
    }
    if (endPage < pagination.pages) items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    items.push(<Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.pages} />);
    items.push(<Pagination.Last key="last" onClick={() => handlePageChange(pagination.pages)} disabled={currentPage === pagination.pages} />);
    return items;
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Pending Verification Requests</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Submitted</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No pending verification requests found.</td>
                </tr>
              ) : (
                requests.map(request => (
                  <tr key={request._id}>
                    <td>{request.user?.name || 'N/A'} ({request.user?.email})</td>
                    <td><Badge bg="secondary">{request.user?.role}</Badge></td>
                    <td>{format(new Date(request.createdAt), 'PPpp')}</td>
                    <td>
                      {request.submittedDocuments?.length || 0} document(s)
                      <Button variant="link" size="sm" onClick={() => handleShowDetailsModal(request)}>View</Button>
                    </td>
                    <td>
                       <Button variant="outline-success" size="sm" className="me-1" title="Approve Request" onClick={() => handleApprove(request._id)}>
                          <CheckCircleFill /> Approve
                        </Button>
                         <Button variant="outline-danger" size="sm" className="me-1" title="Reject Request" onClick={() => handleShowRejectModal(request)}>
                          <XCircleFill /> Reject
                        </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {pagination.pages > 1 && (
            <Pagination className="justify-content-center">
              {renderPaginationItems()}
            </Pagination>
          )}
        </>
      )}

      {/* Reject Request Modal */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Verification - {requestToReject?.user?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="rejectReason">
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              placeholder="Please provide a reason for rejecting this verification request..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRejectModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRejectConfirm} disabled={!rejectReason.trim()}>
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>

       {/* View Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Verification Details - {selectedRequest?.user?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest ? (
            <>
              <p><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
              <p><strong>Role:</strong> {selectedRequest.user?.role}</p>
              <p><strong>Submitted At:</strong> {format(new Date(selectedRequest.createdAt), 'PPpp')}</p>
              <Card>
                <Card.Header>Submitted Documents</Card.Header>
                <ListGroup variant="flush">
                  {selectedRequest.submittedDocuments.map((doc, index) => (
                    <ListGroup.Item key={index}>
                      <FileEarmarkTextFill className="me-2" />
                      <strong>{doc.documentType}</strong>: 
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="ms-2">View Document</a> 
                      <span className="text-muted ms-3">({format(new Date(doc.submittedAt), 'Pp')})</span>
                    </ListGroup.Item>
                  ))}
                  {selectedRequest.submittedDocuments.length === 0 && (
                    <ListGroup.Item>No documents submitted.</ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
              {selectedRequest.notes && <p className="mt-3"><strong>Notes:</strong> {selectedRequest.notes}</p>}
            </>
          ) : (
            <p>Loading details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AdminVerificationListPage; 