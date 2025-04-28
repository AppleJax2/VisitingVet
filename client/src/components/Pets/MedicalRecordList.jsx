import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button, Form, InputGroup, Card, Badge } from 'react-bootstrap';
import api from '../../services/api'; // Adjust path as needed
import { format } from 'date-fns';
import { FaEdit, FaTrashAlt, FaFileAlt, FaPlusCircle } from 'react-icons/fa'; // Add icons
import AddEditMedicalRecordModal from './AddEditMedicalRecordModal'; // Import the modal
import { toast } from 'react-toastify';

const RECORD_TYPES = [
    'Vaccination', 'Procedure', 'Condition', 'Allergy',
    'Observation', 'LabResult', 'Prescription', 'Note'
];

function MedicalRecordList({ petId, petOwnerId, currentUser }) {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ recordType: '', searchTerm: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); // Record to edit, null for add
    const [isDeleting, setIsDeleting] = useState(null); // Track deleting record ID

    const fetchRecords = async () => {
        if (!petId) return;
        setIsLoading(true);
        setError(null);
        try {
            // Pass filters as query parameters
            const params = {};
            if (filters.recordType) params.recordType = filters.recordType;
            if (filters.searchTerm) params.searchTerm = filters.searchTerm;
            
            const { data } = await api.get(`/pets/${petId}/medical-records`, { params }); // Pass params here
            
            if (data.success) {
                // Assuming backend now returns filtered and sorted data if needed
                setRecords(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch medical records');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error fetching records';
            console.error("Fetch Medical Records Error:", err);
            setError(message);
            setRecords([]); // Clear records on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (petId) fetchRecords();
        // Re-fetch when filters change, add debounce later if needed for searchTerm
    }, [petId, filters.recordType, filters.searchTerm]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch {
            return 'Invalid Date';
        }
    };

    const handleAddRecord = () => {
        setEditingRecord(null); // Ensure we are adding
        setShowModal(true);
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setShowModal(true);
    };

    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm('Are you sure you want to delete this medical record?')) {
            return;
        }
        setIsDeleting(recordId);
        try {
            await api.delete(`/pets/${petId}/medical-records/${recordId}`);
            toast.success('Medical record deleted successfully.');
            fetchRecords(); // Refresh list
        } catch (err) {
             const message = err.response?.data?.error || err.message || 'Error deleting record';
            console.error("Delete Medical Record Error:", err);
            toast.error(`Delete Failed: ${message}`);
        } finally {
            setIsDeleting(null);
        }
    };

    const canEditDelete = (record) => {
        if (!currentUser) return false;
        if (currentUser.role === 'Admin') return true;
        if (currentUser._id === petOwnerId) return true; // Pet Owner can edit/delete all?
        if (currentUser._id === record.enteredBy?._id) return true; // User who entered can edit/delete
        return false;
    };

    return (
        <Card className="medical-record-list mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h4>Medical History</h4>
                {currentUser && (currentUser._id === petOwnerId || currentUser.role !== 'PetOwner') && (
                    <Button variant="primary" size="sm" onClick={handleAddRecord}>
                        <FaPlusCircle className="me-1" /> Add Record
                    </Button>
                )}
            </Card.Header>
            <Card.Body>
                {/* Filters */}
                <Form className="mb-3">
                    <Row>
                        <Col md={5}>
                            <Form.Group controlId="filterRecordType">
                                <Form.Label>Filter by Type</Form.Label>
                                <Form.Select name="recordType" value={filters.recordType} onChange={handleFilterChange}>
                                    <option value="">All Types</option>
                                    {RECORD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={7}>
                             <Form.Group controlId="filterSearchTerm">
                                <Form.Label>Search Records</Form.Label>
                                <InputGroup>
                                    <Form.Control 
                                        type="search"
                                        placeholder="Search title or details..."
                                        name="searchTerm"
                                        value={filters.searchTerm}
                                        onChange={handleFilterChange}
                                    />
                                </InputGroup>
                             </Form.Group>
                        </Col>
                    </Row>
                </Form>

                {/* Record Table/List */}
                {isLoading && <Spinner animation="border" />}
                {error && <Alert variant="danger">{error}</Alert>}
                {!isLoading && !error && (
                    <Table striped bordered hover responsive size="sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Title/Summary</th>
                                <th>Entered By</th>
                                <th>Visibility</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Use records directly, as filtering is done backend */}
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">No matching medical records found.</td>
                                </tr>
                            ) : (
                                records.map(record => (
                                    <tr key={record._id}>
                                        <td>{formatDate(record.date)}</td>
                                        <td><Badge bg="secondary">{record.recordType}</Badge></td>
                                        <td>
                                            {record.title}
                                            {/* Add logic here to display snippet/link for complex details */}
                                            {record.documentUrl && 
                                                <a href={record.documentUrl} target="_blank" rel="noopener noreferrer" className="ms-2" title="View Document">
                                                    <FaFileAlt />
                                                </a>
                                            }
                                        </td>
                                        <td>{record.enteredBy?.name || 'N/A'} <Badge pill bg="info" text="dark">{record.enteredBy?.role}</Badge></td>
                                        <td>{record.visibility}</td>
                                        <td>
                                            {canEditDelete(record) && (
                                                <>
                                                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditRecord(record)} title="Edit Record">
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm" 
                                                        onClick={() => handleDeleteRecord(record._id)} 
                                                        disabled={isDeleting === record._id}
                                                        title="Delete Record"
                                                    >
                                                        {isDeleting === record._id ? <Spinner size="sm" /> : <FaTrashAlt />}
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </Card.Body>

            {/* Add/Edit Modal */}
            <AddEditMedicalRecordModal 
                show={showModal}
                handleClose={() => setShowModal(false)}
                petId={petId}
                recordData={editingRecord}
                onRecordSaved={fetchRecords} // Refresh list after save
                currentUser={currentUser}
            />
        </Card>
    );
}

export default MedicalRecordList; 