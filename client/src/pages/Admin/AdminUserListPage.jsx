import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Spinner, Alert, Pagination, InputGroup, FormControl, Modal, Form, Row, Col, Card, FormSelect } from 'react-bootstrap';
import { adminGetAllUsers, adminBanUser, adminUnbanUser, adminVerifyUser, adminCreateUser, adminGetRoles } from '../../services/api';
import { PersonDashFill, PersonCheckFill, PersonXFill, CheckCircleFill, XCircleFill, Search, PersonPlusFill, PencilSquare, Sliders, CheckSquareFill } from 'react-bootstrap-icons';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { useNavigate, Link } from 'react-router-dom';
import logger from '../../utils/logger';
import BulkUserActions from '../../components/Admin/BulkUserActions';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';

// Create User Modal Component
const CreateUserModal = ({ show, onHide, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PetOwner'); // Default role
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('PetOwner');
    setIsSubmitting(false);
    setCreateError('');
  };

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    setCreateError('');
    try {
      const response = await adminCreateUser({ name, email, password, role });
      if (response.success) {
        onUserCreated(); // Callback to refresh the list
        resetForm();
        onHide(); // Close modal
      } else {
        setCreateError(response.error || 'Failed to create user.');
      }
    } catch (err) {
      setCreateError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} onExited={resetForm}> // Reset form on modal close transition end
      <Modal.Header closeButton>
        <Modal.Title>Create New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {createError && <Alert variant="danger">{createError}</Alert>}
        <Form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
          <Form.Group className="mb-3" controlId="createUserName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createUserEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createUserPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Add min length validation
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="createUserRole">
            <Form.Label>Role</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="PetOwner">Pet Owner</option>
              <option value="MVSProvider">Mobile Vet Provider</option>
              <option value="Clinic">Clinic</option>
              <option value="Admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreateUser} disabled={isSubmitting || !name || !email || password.length < 6 || !role}>
          {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Create User'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const AdminUserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const [filters, setFilters] = useState({
    search: '',
    roleId: '',
    verificationStatus: '',
    isBanned: '',
  });

  // State for generic confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null); // { type: 'unban' | 'verify', target: userId }

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await adminGetRoles();
        if (response.success) {
          setRoles(response.data || []);
        } else {
          logger.error('Failed to fetch roles:', response.error);
        }
      } catch (err) {
        logger.error('Error fetching roles:', err);
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const fetchUsers = useCallback(async (page = 1, currentFilters) => {
    setLoading(true);
    setError('');
    const activeFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    logger.debug('Fetching users with filters:', activeFilters);

    try {
      const response = await adminGetAllUsers(page, 15, activeFilters);
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
      logger.error('Error fetching users:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred fetching users.');
      setUsers([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, filters);
  }, [currentPage, filters, fetchUsers]);

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setFilters(prevFilters => ({ ...prevFilters, search: searchValue }));
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'search') {
      setFilters(prevFilters => ({ ...prevFilters, search: value }));
      debouncedSearch(value);
    } else {
      setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
      setCurrentPage(1);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  // --- Action Handlers using Confirmation Modal ---

  const handleShowConfirmModal = (type, target, props) => {
      setActionToConfirm({ type, target });
      setConfirmModalProps(props);
      setShowConfirmModal(true);
  };
  
  const handleHideConfirmModal = () => {
      setShowConfirmModal(false);
      setIsConfirmingAction(false); // Reset loading state
      setActionToConfirm(null);
      setConfirmModalProps({});
  };
  
  // This function is passed to the modal and executes the actual API call
  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;

    const { type, target } = actionToConfirm;
    setIsConfirmingAction(true);
    setError(''); // Clear previous errors

    try {
      let responseMessage = '';
      switch (type) {
        case 'unban':
          await adminUnbanUser(target); // target is userId
          responseMessage = 'User unbanned successfully.';
          break;
        case 'verify':
          await adminVerifyUser(target); // target is userId
          responseMessage = 'User verified successfully.';
          break;
        // Add other actions here later if needed
        default:
          logger.warn('Unknown action type in handleConfirmAction:', type);
          throw new Error('Invalid action type.');
      }
      logger.info(responseMessage);
      // Optionally show success toast
      handleHideConfirmModal();
      fetchUsers(currentPage, filters); // Refresh list
    } catch (err) {
      logger.error(`Failed to perform action ${type} on ${target}:`, err);
      const errorMsg = err.response?.data?.error || err.message || `Failed to ${type} user.`;
      // Set error within the modal or globally? For now, log and maybe show global error
      setError(errorMsg); // Show error on the main page for now
      handleHideConfirmModal(); // Close modal even on error
      // Or keep modal open and show error inside? -> Modal closes for now.
    } finally {
      // This might run too early if handleHideConfirmModal is called above
      // setIsConfirmingAction(false); // Moved reset to handleHideConfirmModal
    }
  };

  // Modified handlers to show the modal
  const handleUnban = (userId, userEmail) => {
    handleShowConfirmModal('unban', userId, {
      title: 'Confirm Unban User',
      body: `Are you sure you want to unban the user ${userEmail}?`,
      confirmButtonText: 'Unban',
      confirmButtonVariant: 'warning',
    });
  };

  const handleVerify = (userId, userEmail) => {
    handleShowConfirmModal('verify', userId, {
      title: 'Confirm Manual Verification',
      body: `Are you sure you want to manually verify the user ${userEmail}?`,
      confirmButtonText: 'Verify',
      confirmButtonVariant: 'success',
    });
  };
  
  // Keep Ban modal separate for now due to the reason input
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
    // Could potentially reuse ConfirmActionModal if adapted for input, but keeping separate for now
    try {
      await adminBanUser(userToBan._id, banReason);
      handleCloseBanModal();
      fetchUsers(currentPage, filters); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to ban user.');
    }
  };

  const handleShowCreateModal = () => setShowCreateModal(true);
  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleUserCreated = () => {
    fetchUsers(currentPage, filters);
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentNonAdminIds = users.filter(u => u.role?.name !== 'Admin').map(u => u._id);
      setSelectedUsers(new Set(currentNonAdminIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const isAllSelected = selectedUsers.size > 0 && selectedUsers.size === users.filter(u => u.role?.name !== 'Admin').length;

  const handleBulkActionComplete = () => {
    fetchUsers(currentPage, filters);
    setSelectedUsers(new Set());
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

      <Card className="mb-3">
        <Card.Header>
          <Sliders className="me-2" /> Filters
        </Card.Header>
        <Card.Body>
          <Row className="g-2">
            <Col md={4}>
              <Form.Group controlId="filterSearch">
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <InputGroup.Text><Search /></InputGroup.Text>
                  <FormControl
                    name="search"
                    placeholder="Name or email..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="filterRole">
                <Form.Label>Role</Form.Label>
                <FormSelect name="roleId" value={filters.roleId} onChange={handleFilterChange} disabled={loadingRoles}>
                  <option value="">All Roles</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </FormSelect>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="filterVerificationStatus">
                <Form.Label>Verification Status</Form.Label>
                <FormSelect name="verificationStatus" value={filters.verificationStatus} onChange={handleFilterChange}>
                  <option value="">All Statuses</option>
                  <option value="NotSubmitted">Not Submitted</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </FormSelect>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="filterBannedStatus">
                <Form.Label>Banned Status</Form.Label>
                <FormSelect name="isBanned" value={filters.isBanned} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  <option value="false">Not Banned</option>
                  <option value="true">Banned</option>
                </FormSelect>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-3">
        <Col className="text-end">
          <Button variant="primary" onClick={handleShowCreateModal}>
            <PersonPlusFill className="me-2" /> Create User
          </Button>
        </Col>
      </Row>

      {selectedUsers.size > 0 && (
        <BulkUserActions 
          selectedUserIds={Array.from(selectedUsers)} 
          onActionComplete={handleBulkActionComplete} 
        />
      )}

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>
                  <Form.Check 
                    type="checkbox" 
                    id="selectAllCheckbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    title="Select/Deselect All (Non-Admins)"
                    disabled={users.filter(u => u.role?.name !== 'Admin').length === 0}
                  />
                </th>
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
                  <td colSpan="6" className="text-center">No users found matching filters.</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className={selectedUsers.has(user._id) ? 'table-active' : ''}>
                    <td>
                      <Form.Check 
                        type="checkbox"
                        id={`select-${user._id}`}
                        checked={selectedUsers.has(user._id)}
                        onChange={() => handleSelectUser(user._id)}
                        disabled={user.role?.name === 'Admin'}
                        title={user.role?.name === 'Admin' ? 'Cannot select Admin users' : 'Select user'}
                      />
                    </td>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td><Badge bg="secondary">{user.role?.name || 'N/A'}</Badge></td>
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
                      <Link to={`/admin/users/${user._id}`} className="btn btn-outline-primary btn-sm me-1" title="View Details">
                        <PersonDashFill />
                      </Link>
                      {!user.isBanned && !user.isVerified && user.role?.name !== 'Admin' && (
                        <Button variant="outline-success" size="sm" className="me-1" title="Manually Verify" onClick={() => handleVerify(user._id, user.email)}>
                          <CheckCircleFill />
                        </Button>
                      )}
                      {user.isBanned ? (
                        <Button variant="outline-warning" size="sm" className="me-1" title="Unban User" onClick={() => handleUnban(user._id, user.email)}>
                          <PersonCheckFill />
                        </Button>
                      ) : user.role?.name !== 'Admin' ? (
                        <Button variant="outline-danger" size="sm" className="me-1" title="Ban User" onClick={() => handleShowBanModal(user)}>
                          <PersonXFill />
                        </Button>
                      ) : null}
                      {user.role?.name === 'MVSProvider' && (
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="me-1" 
                          title="Manage Profile" 
                          onClick={() => navigate(`/admin/edit-profile/${user._id}`)}
                        >
                          <PencilSquare />
                        </Button>
                      )}
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

      <CreateUserModal 
        show={showCreateModal} 
        onHide={handleCloseCreateModal} 
        onUserCreated={handleUserCreated}
      />

      {/* Generic Confirmation Modal */}
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

    </Container>
  );
};

export default AdminUserListPage; 