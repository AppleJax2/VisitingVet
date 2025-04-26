import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Pagination, InputGroup, FormControl, Modal, Form } from 'react-bootstrap';
import { adminGetAllUsers, adminBanUser, adminUnbanUser, adminVerifyUser } from '../../services/api';
import { PersonDashFill, PersonCheckFill, PersonXFill, CheckCircleFill, XCircleFill, Search } from 'react-bootstrap-icons';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [banReason, setBanReason] = useState('');

  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    setError('');
    try {
      const filters = {}; // Add role, status filters later
      if (search) filters.search = search;
      const response = await adminGetAllUsers(page, 15, filters); // Fetch 15 per page
      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || {});
        setCurrentPage(page);
      } else {
        setError(response.error || 'Failed to load users.');
        setUsers([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'An error occurred fetching users.');
      setUsers([]);
        setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage]); // Refetch only when page changes

  // Debounced search handler
  const debouncedSearch = debounce((term) => {
    setCurrentPage(1); // Reset to first page on new search
    fetchUsers(1, term);
  }, 500); // 500ms delay

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleShowBanModal = (user) => {
    setUserToBan(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleCloseBanModal = () => {
    setShowBanModal(false);
    setUserToBan(null);
  };

  const handleBanConfirm = async () => {
    if (!userToBan || !banReason) return;
    try {
      await adminBanUser(userToBan._id, banReason);
      handleCloseBanModal();
      fetchUsers(currentPage, searchTerm); // Refresh list
      // Show success toast/message
    } catch (err) {
      setError(err.message || 'Failed to ban user.');
      // Show error toast/message
    }
  };

  const handleUnban = async (userId) => {
    if (!window.confirm('Are you sure you want to unban this user?')) return;
    try {
      await adminUnbanUser(userId);
      fetchUsers(currentPage, searchTerm); // Refresh list
      // Show success toast/message
    } catch (err) {
      setError(err.message || 'Failed to unban user.');
      // Show error toast/message
    }
  };

  const handleVerify = async (userId) => {
     if (!window.confirm('Are you sure you want to manually verify this user?')) return;
    try {
      await adminVerifyUser(userId);
      fetchUsers(currentPage, searchTerm); // Refresh list
      // Show success toast/message
    } catch (err) {
      setError(err.message || 'Failed to verify user.');
      // Show error toast/message
    }
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

    items.push(
      <Pagination.First key="first" onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
    );
    items.push(
      <Pagination.Prev key="prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
    );

    if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
          {number}
        </Pagination.Item>
      );
    }

    if (endPage < pagination.pages) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    items.push(
      <Pagination.Next key="next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.pages} />
    );
    items.push(
      <Pagination.Last key="last" onClick={() => handlePageChange(pagination.pages)} disabled={currentPage === pagination.pages} />
    );

    return items;
  };

  return (
    <Container fluid>
      <h2 className="mb-4">User Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3">
        <InputGroup.Text><Search /></InputGroup.Text>
        <FormControl
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No users found.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td><Badge bg="secondary">{user.role}</Badge></td>
                    <td>{format(new Date(user.createdAt), 'PP')}</td>
                    <td>
                      {user.isBanned ? (
                        <Badge bg="danger">Banned</Badge>
                      ) : user.isVerified ? (
                        <Badge bg="success">Verified</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">{user.verificationStatus}</Badge>
                      )}
                    </td>
                    <td>
                      {/* Add View Details button later */}
                      {!user.isBanned && !user.isVerified && user.role !== 'Admin' && (
                        <Button variant="outline-success" size="sm" className="me-1" title="Manually Verify" onClick={() => handleVerify(user._id)}>
                          <CheckCircleFill />
                        </Button>
                      )}
                      {user.isBanned ? (
                        <Button variant="outline-warning" size="sm" className="me-1" title="Unban User" onClick={() => handleUnban(user._id)}>
                           <PersonCheckFill />
                        </Button>
                      ) : user.role !== 'Admin' ? (
                        <Button variant="outline-danger" size="sm" className="me-1" title="Ban User" onClick={() => handleShowBanModal(user)}>
                          <PersonXFill />
                        </Button>
                      ) : null}
                      {/* Add Edit/Warning buttons later */}
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

      {/* Ban User Modal */}
      <Modal show={showBanModal} onHide={handleCloseBanModal}>
        <Modal.Header closeButton>
          <Modal.Title>Ban User - {userToBan?.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="banReason">
            <Form.Label>Reason for Banning</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              required
              placeholder="Please provide a reason for banning this user..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseBanModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBanConfirm} disabled={!banReason.trim()}>
            Confirm Ban
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AdminUserListPage; 