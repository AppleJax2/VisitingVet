import React, { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Pagination, Card, Accordion } from 'react-bootstrap';
import { adminGetActionLogs } from '../../services/api';
import { format } from 'date-fns';

const AdminLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminGetActionLogs(page, 20); // Fetch 20 per page
      if (response.success) {
        setLogs(response.data || []);
        setPagination(response.pagination || {});
        setCurrentPage(page);
      } else {
        setError(response.error || 'Failed to load action logs.');
        setLogs([]);
        setPagination({});
      }
    } catch (err) {
      console.error('Error fetching action logs:', err);
      setError(err.message || 'An error occurred fetching logs.');
      setLogs([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
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
    <Container fluid>
      <h2 className="mb-4">Admin Action Logs</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {/* Add search/filter inputs later */}

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <>
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action Type</th>
                <th>Target User</th>
                <th>Reason/Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No action logs found.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id}>
                    <td>{format(new Date(log.createdAt), 'Pp')}</td>
                    <td>{log.adminUser?.name || 'N/A'} ({log.adminUser?.email})</td>
                    <td>{log.actionType}</td>
                    <td>{log.targetUser ? `${log.targetUser.name || 'N/A'} (${log.targetUser.email})` : 'N/A'}</td>
                    <td>
                        {log.reason}
                        {log.details && Object.keys(log.details).length > 0 && (
                            <Accordion flush style={{ fontSize: '0.8rem' }}>
                                <Accordion.Item eventKey="0">
                                <Accordion.Header>Details</Accordion.Header>
                                <Accordion.Body>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {pagination.totalPages > 1 && (
            <Pagination className="justify-content-center">
              {renderPaginationItems()}
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminLogPage; 