import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import logger from '../../utils/logger';
import { Container, Card, Spinner, Alert, Table, Pagination, Badge } from 'react-bootstrap'; // Added Table, Pagination, Badge

// Helper to format details object
const formatDetails = (details) => {
  if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
    return 'N/A';
  }
  // Simple JSON string representation, customize as needed
  try {
    return JSON.stringify(details);
  } catch (e) {
    return 'Invalid Details';
  }
};

// Helper to get badge variant based on status
const getStatusBadgeVariant = (status) => {
  return status === 'SUCCESS' ? 'success' : 'danger';
};

function AdminUserDetailPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState('');

  // State for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState('');
  const [logPagination, setLogPagination] = useState({
    page: 1,
    limit: 15, // Logs per page
    total: 0,
    pages: 1,
  });

  // Fetch User Details
  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoadingUser(true);
      setErrorUser('');
      try {
        logger.info(`Fetching details for user: ${userId}`);
        // Ensure role is populated if needed for display
        const response = await apiClient.get(`/admin/users/${userId}`); 
        setUser(response.data.data);
      } catch (err) {
        logger.error(`Failed to fetch user details for ${userId}:`, err);
        setErrorUser(err.response?.data?.error || 'Failed to load user details.');
      }
      setLoadingUser(false);
    };
    fetchUserDetails();
  }, [userId]);

  // Fetch Activity Logs - useCallback to avoid re-creating function on re-renders
  const fetchActivityLogs = useCallback(async (page = 1) => {
    setLoadingLogs(true);
    setErrorLogs('');
    try {
      logger.info(`Fetching activity logs for user: ${userId}, page: ${page}`);
      const response = await apiClient.get(`/admin/users/${userId}/activity`, {
        params: { page, limit: logPagination.limit },
      });
      setActivityLogs(response.data.data || []);
      setLogPagination(response.data.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      logger.error(`Failed to fetch activity logs for ${userId}:`, err);
      setErrorLogs(err.response?.data?.error || 'Failed to load activity logs.');
      setActivityLogs([]); // Clear logs on error
      setLogPagination({ page: 1, limit: 15, total: 0, pages: 1 }); // Reset pagination
    }
    setLoadingLogs(false);
  }, [userId, logPagination.limit]); // Dependency array

  // Initial fetch for logs when component mounts or userId changes
  useEffect(() => {
    fetchActivityLogs(1); // Fetch first page initially
  }, [fetchActivityLogs]); // Depends on the memoized fetchActivityLogs

  // Handler for pagination clicks
  const handlePageChange = (pageNumber) => {
    if (pageNumber !== logPagination.page) {
      fetchActivityLogs(pageNumber);
    }
  };

  // Render pagination items
  const renderPaginationItems = () => {
    let items = [];
    const { page, pages } = logPagination;
    if (pages <= 1) return null; // No pagination if only one page

    // Simple pagination logic (can be enhanced for many pages)
    for (let number = 1; number <= pages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === page} onClick={() => handlePageChange(number)} disabled={loadingLogs}>
          {number}
        </Pagination.Item>,
      );
    }
    return items;
  };


  if (loadingUser) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (errorUser) {
    return <Container className="mt-5"><Alert variant="danger">{errorUser}</Alert></Container>;
  }

  if (!user) {
    return <Container className="mt-5"><Alert variant="warning">User not found.</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      {/* User Details Card */}
      <Card>
        <Card.Header>
          <Card.Title>User Details: {user.name || user.email}</Card.Title>
        </Card.Header>
        <Card.Body>
          <p><strong>ID:</strong> {user._id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name || 'N/A'}</p>
          {/* Display role - Assuming user.role is populated with the role object */}
          <p><strong>Role:</strong> {user.role?.name || 'N/A'}</p> 
          <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'} ({user.verificationStatus})</p>
          <p><strong>Banned:</strong> {user.isBanned ? `Yes (${user.banReason || 'No reason provided'})` : 'No'}</p>
          <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
          <p><strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p><strong>Last Activity:</strong> {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'N/A'}</p>
          {/* Add buttons for actions like Ban/Unban/Verify/Edit Profile here */}
          <Link to={`/admin/edit-profile/${userId}`} className="btn btn-primary me-2">Edit Profile</Link>
          {/* Add Ban/Unban/Verify buttons conditionally */}
        </Card.Body>
      </Card>

      {/* Activity Log Card */}
      <Card className="mt-4">
        <Card.Header>
          <Card.Title>User Activity Log</Card.Title>
        </Card.Header>
        <Card.Body>
          {loadingLogs && <div className="text-center"><Spinner animation="border" size="sm" /> Loading logs...</div>}
          {errorLogs && <Alert variant="danger" className="mt-2">{errorLogs}</Alert>}
          {!loadingLogs && !errorLogs && activityLogs.length === 0 && (
            <Alert variant="info">No activity logs found for this user.</Alert>
          )}
          {!loadingLogs && !errorLogs && activityLogs.length > 0 && (
            <>
              <Table striped bordered hover responsive size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Details</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map(log => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.action}</td>
                      <td><Badge bg={getStatusBadgeVariant(log.status)}>{log.status}</Badge></td>
                      <td>{log.ipAddress || 'N/A'}</td>
                      {/* Be cautious rendering raw details if they can contain complex/unsafe data */}
                      <td><pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontSize: '0.8em'}}>{formatDetails(log.details)}</pre></td>
                      <td>{log.errorMessage || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {logPagination.pages > 1 && (
                <Pagination className="justify-content-center">
                  {renderPaginationItems()}
                </Pagination>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminUserDetailPage; 