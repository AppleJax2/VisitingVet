import React, { useState, useEffect } from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminGetActionLogs } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

function RecentActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch only the first 5 logs for the dashboard view
                const response = await adminGetActionLogs(1, 5); // Page 1, Limit 5
                if (response.success) {
                    setLogs(response.data || []);
                } else {
                    throw new Error(response.message || 'Failed to fetch recent logs');
                }
            } catch (err) {
                console.error("Fetch Recent Logs Error:", err);
                setError(err.message || 'Could not fetch recent activity.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecentLogs();
    }, []);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="recent-activity-logs">
            {isLoading && <div className="text-center p-3"><Spinner size="sm" /> Loading...</div>}
            {error && <Alert variant="warning" size="sm">{error}</Alert>}
            {!isLoading && !error && (
                <ListGroup variant="flush">
                    {logs.length === 0 ? (
                        <ListGroup.Item className="text-muted">No recent activity recorded.</ListGroup.Item>
                    ) : (
                        logs.map(log => (
                            <ListGroup.Item key={log._id} className="d-flex justify-content-between align-items-start">
                                <div className="ms-2 me-auto">
                                    <div className="fw-bold">{log.action}</div>
                                    <small>
                                        By: {log.adminUser?.name || 'System'} 
                                        {log.targetUser ? ` | Target: ${log.targetUser.name}` : ''}
                                    </small>
                                </div>
                                <small className="text-muted">{formatRelativeTime(log.createdAt)}</small>
                            </ListGroup.Item>
                        ))
                    )}
                    {logs.length > 0 && (
                         <ListGroup.Item className="text-center">
                             <Link to="/admin/logs">View All Logs</Link>
                         </ListGroup.Item>
                    )}
                </ListGroup>
            )}
        </div>
    );
}

export default RecentActivityLogs; 