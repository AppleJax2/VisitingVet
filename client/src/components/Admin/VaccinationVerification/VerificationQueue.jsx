import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import './VerificationQueue.css'; // Optional: Add specific styles

const VerificationQueue = ({ records, onSelectRecord, selectedRecordId, isLoading }) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPp'); // e.g., Feb 27, 2024, 5:01:34 PM
        } catch {
            return 'Invalid Date';
        }
    };

    if (isLoading && records.length === 0) {
        return <div className="text-center p-3"><Spinner animation="border" size="sm" /> Loading Queue...</div>;
    }

    if (!isLoading && records.length === 0) {
        return <Alert variant="info" className="m-2 text-center">No records currently pending review.</Alert>;
    }

    return (
        <ListGroup variant="flush" className="verification-queue-list">
            {records.map(record => (
                <ListGroup.Item
                    key={record._id}
                    action
                    onClick={() => onSelectRecord(record)}
                    active={selectedRecordId === record._id}
                    className="d-flex justify-content-between align-items-start"
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Pet: {record.pet?.name || 'Unknown'} ({record.vaccineType})</div>
                        <small className="text-muted">
                            Owner: {record.owner?.name || record.owner?.email || 'N/A'} <br/>
                            Submitted: {formatDate(record.createdAt)}
                        </small>
                    </div>
                    {/* Optionally add a badge or icon based on record properties */}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
};

VerificationQueue.propTypes = {
    records: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectRecord: PropTypes.func.isRequired,
    selectedRecordId: PropTypes.string,
    isLoading: PropTypes.bool,
};

export default VerificationQueue; 