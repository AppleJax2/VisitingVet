import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Pagination, Modal, Form, Card, ListGroup, Row, Col, FormSelect, Toast, ToastContainer } from 'react-bootstrap';
import { adminGetPendingVerifications, adminApproveVerification, adminRejectVerification, adminSaveDocumentAnnotations } from '../../services/apiClient';
import { CheckCircleFill, XCircleFill, FileEarmarkTextFill } from 'react-bootstrap-icons';
import { format } from 'date-fns';
import logger from '../../utils/logger';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';
import DocumentViewer from '../../components/Admin/DocumentViewer';

const AdminVerificationListPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt_asc');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [viewingDocument, setViewingDocument] = useState({ url: null, type: null, id: null, annotations: [] });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ variant: 'success', message: '' });

  const fetchRequests = useCallback(async (page = 1, sort = 'createdAt_asc') => {
    setLoading(true);
    setError('');
    try {
      logger.info(`Fetching pending verifications. Page: ${page}, SortBy: ${sort}`);
      const response = await adminGetPendingVerifications(page, 10, { sortBy: sort });
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
      logger.error('Error fetching verification requests:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred fetching requests.');
      setRequests([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage, sortBy);
  }, [currentPage, sortBy, fetchRequests]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

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
    setViewingDocument({ url: null, type: null, id: null, annotations: [] });
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
    setViewingDocument({ url: null, type: null, id: null, annotations: [] });
  };

  const handleViewDocumentClick = (doc) => {
    if (doc.signedUrl) {
        setViewingDocument({ 
            url: doc.signedUrl, 
            type: doc.contentType,
            id: doc._id || doc.fileKey,
            annotations: doc.annotations || []
        });
    } else {
        logger.warn('Attempted to view document with no URL.');
    }
  };

  const handleSaveAnnotations = async (annotations) => {
    if (!selectedRequest || !viewingDocument.id) {
        setToastMessage({ 
            variant: 'danger', 
            message: 'Cannot save annotations: missing document reference' 
        });
        setShowToast(true);
        return;
    }
    
    try {
        const response = await adminSaveDocumentAnnotations(
            selectedRequest._id,
            viewingDocument.id,
            annotations
        );
        
        if (response.success) {
            // Update the document annotations in the local state
            if (selectedRequest && selectedRequest.documents) {
                const updatedDocuments = selectedRequest.documents.map(doc => {
                    if ((doc._id || doc.fileKey) === viewingDocument.id) {
                        return { ...doc, annotations };
                    }
                    return doc;
                });
                
                setSelectedRequest({
                    ...selectedRequest,
                    documents: updatedDocuments
                });
            }
            
            setToastMessage({ 
                variant: 'success', 
                message: 'Annotations saved successfully' 
            });
        } else {
            setToastMessage({ 
                variant: 'danger', 
                message: response.error || 'Failed to save annotations' 
            });
        }
    } catch (err) {
        logger.error('Error saving document annotations:', err);
        setToastMessage({ 
            variant: 'danger', 
            message: err.message || 'An error occurred saving annotations' 
        });
    }
    
    setShowToast(true);
  };

  const handleRejectConfirm = async () => {
    if (!requestToReject || !rejectReason) return;
    try {
      await adminRejectVerification(requestToReject._id, rejectReason);
      handleCloseRejectModal();
      fetchRequests(1, sortBy);
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
    }
  };

  const handleShowConfirmModal = (type, target, props) => {
    setActionToConfirm({ type, target });
    setConfirmModalProps(props);
    setShowConfirmModal(true);
  };
  
  const handleHideConfirmModal = () => {
    setShowConfirmModal(false);
    setIsConfirmingAction(false);
    setActionToConfirm(null);
    setConfirmModalProps({});
  };
  
  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;
    const { type, target } = actionToConfirm;
    setIsConfirmingAction(true);
    setError('');
    try {
      let responseMessage = '';
      switch (type) {
        case 'approve':
          await adminApproveVerification(target);
          responseMessage = 'Verification request approved successfully.';
          break;
        default:
          logger.warn('Unknown action type in handleConfirmAction:', type);
          throw new Error('Invalid action type.');
      }
      logger.info(responseMessage);
      handleHideConfirmModal();
      fetchRequests(1, sortBy);
    } catch (err) {
      logger.error(`Failed to perform action ${type} on ${target}:`, err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to approve request.';
      setError(errorMsg);
      handleHideConfirmModal();
    }
  };

  const handleApprove = (requestId, userEmail) => {
    handleShowConfirmModal('approve', requestId, {
      title: 'Confirm Approval',
      body: `Are you sure you want to approve the verification request for ${userEmail}?`,
      confirmButtonText: 'Approve',
      confirmButtonVariant: 'success',
    });
  };

  const renderPaginationItems = () => {
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

      <Row className="mb-3">
          <Col md={3}>
              <Form.Group controlId="sortVerifications">
                  <Form.Label>Sort By</Form.Label>
                  <FormSelect value={sortBy} onChange={handleSortChange} disabled={loading}>
                      <option value="createdAt_asc">Oldest First</option>
                      <option value="createdAt_desc">Newest First</option>
                  </FormSelect>
              </Form.Group>
          </Col>
      </Row>

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
                      <Button variant="outline-success" size="sm" className="me-1" title="Approve Request" onClick={() => handleApprove(request._id, request.user?.email)}>
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

      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title>Verification Details - {selectedRequest?.user?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedRequest ? (
            <Row style={{ height: '100%' }}>
              <Col xs={12} md={4} style={{ height: '100%', overflowY: 'auto', borderRight: '1px solid #dee2e6' }}>
                  <h5>Request Info</h5>
                  <p><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
                  <p><strong>Role:</strong> {selectedRequest.user?.role?.name || selectedRequest.user?.role || 'N/A'}</p>
                  <p><strong>Submitted At:</strong> {format(new Date(selectedRequest.createdAt), 'PPpp')}</p>
                  {selectedRequest.notes && <p><strong>Admin Notes:</strong> {selectedRequest.notes}</p>}
                  <hr />
                  <h5>Submitted Documents</h5>
                  {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                      <ListGroup variant="flush">
                          {selectedRequest.documents.map((doc, index) => (
                              <ListGroup.Item key={doc.fileKey || index} 
                                action 
                                onClick={() => handleViewDocumentClick(doc)} 
                                style={{ cursor: doc.signedUrl ? 'pointer' : 'default' }}
                                active={(doc._id || doc.fileKey) === viewingDocument.id}
                              >
                                  <FileEarmarkTextFill className="me-2" />
                                  {doc.documentType || 'Document'}
                                  {doc.annotations && doc.annotations.length > 0 && (
                                    <Badge bg="info" className="ms-2">{doc.annotations.length} notes</Badge>
                                  )}
                                  {!doc.signedUrl && doc.error && <Badge bg="danger" className="ms-2">Error</Badge>}
                                  {!doc.signedUrl && !doc.error && <Badge bg="secondary" className="ms-2">No URL</Badge>}
                              </ListGroup.Item>
                          ))}
                      </ListGroup>
                  ) : (
                      <p>No documents submitted or available.</p>
                  )}
              </Col>
              <Col xs={12} md={8} style={{ height: '100%', overflow: 'hidden', display:'flex', flexDirection:'column'}}>
                {viewingDocument.url ? (
                    <DocumentViewer 
                        documentUrl={viewingDocument.url} 
                        contentType={viewingDocument.type}
                        initialAnnotations={viewingDocument.annotations}
                        onSaveAnnotations={handleSaveAnnotations}
                    />
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <p>Select a document from the list to view it here.</p>
                    </div>
                )}
              </Col>
            </Row>
          ) : (
            <p>Loading details...</p>
          )}
        </Modal.Body>
      </Modal>

      <ConfirmActionModal 
          show={showConfirmModal}
          onHide={handleHideConfirmModal}
          onConfirm={handleConfirmAction}
          title={confirmModalProps.title || 'Confirm Action'}
          body={confirmModalProps.body || 'Are you sure?'}
          confirmButtonText={confirmModalProps.confirmButtonText}
          confirmButtonVariant={confirmModalProps.confirmButtonVariant}
          isConfirming={isConfirmingAction}
      />

      <ToastContainer position="bottom-end" className="p-3">
        <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide 
            bg={toastMessage.variant}
        >
            <Toast.Header closeButton>
                <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className={toastMessage.variant === 'danger' ? 'text-white' : ''}>
                {toastMessage.message}
            </Toast.Body>
        </Toast>
      </ToastContainer>

    </Container>
  );
};

export default AdminVerificationListPage; 