import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Alert, Spinner, Card, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { Shield, PeopleFill, CheckCircleFill, XCircleFill, PencilFill, PlusCircleFill } from 'react-bootstrap-icons';
import { adminGetRoles, adminUpdateRole, adminCreateRole } from '../../services/api';
import ConfirmActionModal from '../../components/Admin/ConfirmActionModal';
import logger from '../../utils/logger';

const AdminPermissionsPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    
    // List of all available permissions in the system
    const availablePermissions = [
        // User Management
        { id: 'users:read', name: 'View Users', category: 'User Management' },
        { id: 'users:create', name: 'Create Users', category: 'User Management' },
        { id: 'users:update', name: 'Edit Users', category: 'User Management' },
        { id: 'users:delete', name: 'Delete Users', category: 'User Management' },
        { id: 'users:ban', name: 'Ban Users', category: 'User Management' },
        
        // Role Management
        { id: 'roles:read', name: 'View Roles', category: 'Role Management' },
        { id: 'roles:create', name: 'Create Roles', category: 'Role Management' },
        { id: 'roles:update', name: 'Edit Roles', category: 'Role Management' },
        { id: 'roles:delete', name: 'Delete Roles', category: 'Role Management' },
        
        // Verification Management
        { id: 'verifications:read', name: 'View Verifications', category: 'Verification' },
        { id: 'verifications:approve', name: 'Approve Verifications', category: 'Verification' },
        { id: 'verifications:reject', name: 'Reject Verifications', category: 'Verification' },
        
        // Session Management
        { id: 'sessions:read', name: 'View Sessions', category: 'Session Management' },
        { id: 'sessions:terminate', name: 'Terminate Sessions', category: 'Session Management' },
        
        // System Settings
        { id: 'settings:read', name: 'View Settings', category: 'System' },
        { id: 'settings:update', name: 'Update Settings', category: 'System' },
        
        // Activity Logs
        { id: 'logs:read', name: 'View Logs', category: 'Logs' },
        
        // Profiles Management
        { id: 'profiles:read', name: 'View Profiles', category: 'Profiles' },
        { id: 'profiles:update', name: 'Edit Profiles', category: 'Profiles' },
        
        // Payment Management
        { id: 'payments:read', name: 'View Payments', category: 'Payments' },
        { id: 'payments:process', name: 'Process Payments', category: 'Payments' },
        { id: 'payments:refund', name: 'Issue Refunds', category: 'Payments' },
    ];
    
    // Group permissions by category
    const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
        if (!acc[permission.category]) {
            acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
    }, {});
    
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await adminGetRoles();
            if (response.success) {
                setRoles(response.data);
            } else {
                setError(response.error || 'Failed to load roles');
            }
        } catch (err) {
            logger.error('Error fetching roles:', err);
            setError(err.message || 'An error occurred while fetching roles');
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);
    
    const handleEditRole = (role) => {
        setSelectedRole(role);
        setEditForm({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setShowEditModal(true);
    };
    
    const handleCreateRole = () => {
        setEditForm({
            name: '',
            description: '',
            permissions: []
        });
        setShowCreateModal(true);
    };
    
    const handlePermissionChange = (permissionId, checked) => {
        setEditForm(prevForm => {
            if (checked) {
                return {
                    ...prevForm,
                    permissions: [...prevForm.permissions, permissionId]
                };
            } else {
                return {
                    ...prevForm,
                    permissions: prevForm.permissions.filter(id => id !== permissionId)
                };
            }
        });
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };
    
    const handleSaveRole = async (isNew = false) => {
        if (isSubmitting) return;
        
        // Validate form
        if (!editForm.name.trim()) {
            setError('Role name is required');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            let response;
            if (isNew) {
                response = await adminCreateRole(editForm);
            } else {
                response = await adminUpdateRole(selectedRole._id, editForm);
            }
            
            if (response.success) {
                setSuccess(`Role ${isNew ? 'created' : 'updated'} successfully`);
                fetchRoles();
                if (isNew) {
                    setShowCreateModal(false);
                } else {
                    setShowEditModal(false);
                }
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.error || `Failed to ${isNew ? 'create' : 'update'} role`);
            }
        } catch (err) {
            logger.error(`Error ${isNew ? 'creating' : 'updating'} role:`, err);
            setError(err.message || `An error occurred while ${isNew ? 'creating' : 'updating'} the role`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const confirmDeleteRole = (role) => {
        setSelectedRole(role);
        setConfirmAction('delete');
        setShowConfirmModal(true);
    };
    
    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await adminUpdateRole(selectedRole._id, { isDeleted: true });
            
            if (response.success) {
                setSuccess('Role deleted successfully');
                fetchRoles();
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.error || 'Failed to delete role');
            }
        } catch (err) {
            logger.error('Error deleting role:', err);
            setError(err.message || 'An error occurred while deleting the role');
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
            setSelectedRole(null);
            setConfirmAction(null);
        }
    };
    
    return (
        <Container fluid>
            <h2 className="mb-4">
                <Shield className="me-2" />
                Role & Permission Management
            </h2>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">System Roles</h5>
                    <Button 
                        variant="primary" 
                        size="sm"
                        onClick={handleCreateRole}
                    >
                        <PlusCircleFill className="me-1" />
                        Create New Role
                    </Button>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading roles...</p>
                        </div>
                    ) : roles.length === 0 ? (
                        <Alert variant="info">No roles found in the system.</Alert>
                    ) : (
                        <Table responsive striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Role Name</th>
                                    <th>Description</th>
                                    <th>Permissions</th>
                                    <th>Users Count</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role._id}>
                                        <td>
                                            <strong>{role.name}</strong>
                                            {role.isDefault && (
                                                <Badge bg="info" className="ms-2">Default</Badge>
                                            )}
                                            {role.isSystem && (
                                                <Badge bg="secondary" className="ms-2">System</Badge>
                                            )}
                                        </td>
                                        <td>{role.description || '-'}</td>
                                        <td>
                                            {role.permissions && role.permissions.length > 0 ? (
                                                <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                                    {role.permissions.map(permission => {
                                                        const permInfo = availablePermissions.find(p => p.id === permission);
                                                        return (
                                                            <Badge 
                                                                key={permission} 
                                                                bg="light" 
                                                                text="dark" 
                                                                className="me-1 mb-1"
                                                            >
                                                                {permInfo ? permInfo.name : permission}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-muted">No permissions</span>
                                            )}
                                        </td>
                                        <td>
                                            {role.usersCount !== undefined ? (
                                                <Badge bg="secondary">{role.usersCount} users</Badge>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleEditRole(role)}
                                                disabled={role.isSystem}
                                            >
                                                <PencilFill className="me-1" />
                                                Edit
                                            </Button>
                                            {!role.isSystem && !role.isDefault && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => confirmDeleteRole(role)}
                                                    disabled={role.usersCount > 0}
                                                >
                                                    <XCircleFill className="me-1" />
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
            
            {/* Edit Role Modal */}
            <Modal 
                show={showEditModal || showCreateModal} 
                onHide={() => showEditModal ? setShowEditModal(false) : setShowCreateModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {showEditModal ? 'Edit Role' : 'Create New Role'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Role Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="description"
                                value={editForm.description}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                            />
                        </Form.Group>
                        
                        <h5 className="mb-3">Permissions</h5>
                        
                        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                            <Card className="mb-3" key={category}>
                                <Card.Header>{category}</Card.Header>
                                <Card.Body>
                                    <Row>
                                        {permissions.map(permission => (
                                            <Col md={6} key={permission.id}>
                                                <Form.Check
                                                    type="checkbox"
                                                    id={`permission-${permission.id}`}
                                                    label={permission.name}
                                                    checked={editForm.permissions.includes(permission.id)}
                                                    onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                                                    disabled={isSubmitting}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => showEditModal ? setShowEditModal(false) : setShowCreateModal(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => handleSaveRole(showCreateModal)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner 
                                    as="span" 
                                    animation="border" 
                                    size="sm" 
                                    role="status" 
                                    aria-hidden="true" 
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Confirm Delete Modal */}
            <ConfirmActionModal
                show={showConfirmModal}
                onHide={() => {
                    setShowConfirmModal(false);
                    setSelectedRole(null);
                    setConfirmAction(null);
                }}
                onConfirm={handleDeleteRole}
                title="Confirm Role Deletion"
                body={
                    selectedRole ? 
                    `Are you sure you want to delete the role "${selectedRole.name}"? This action cannot be undone.` :
                    'Are you sure you want to delete this role?'
                }
                confirmButtonText="Delete Role"
                confirmButtonVariant="danger"
                isConfirming={isSubmitting}
            />
        </Container>
    );
};

export default AdminPermissionsPage; 