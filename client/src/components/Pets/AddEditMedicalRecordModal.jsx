import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';

const RECORD_TYPES = [
    'Vaccination', 'Procedure', 'Condition', 'Allergy',
    'Observation', 'LabResult', 'Prescription', 'Note'
];

const VISIBILITY_OPTIONS = [
    { value: 'OwnerOnly', label: 'Owner Only' },
    { value: 'AllSharedProviders', label: 'Owner & All Treating Providers' },
    // { value: 'SpecificProviders', label: 'Owner & Specific Providers Only' }, // Add later if needed
];

// Helper to get default details structure based on type
const getDefaultDetails = (type) => {
    switch (type) {
        case 'Vaccination': return { vaccineName: '', nextDueDate: '' };
        case 'Procedure': return { description: '', outcome: '' };
        case 'Condition': return { diagnosis: '', onsetDate: '', status: 'Active' }; // e.g., status: Active/Inactive/Resolved
        case 'Allergy': return { allergen: '', reaction: '' };
        case 'LabResult': return { testName: '', resultSummary: '', notes: '' };
        case 'Prescription': return { medication: '', dosage: '', frequency: '', duration: '' };
        case 'Observation':
        case 'Note':
        default: return { notes: '' }; // Use a simple notes field for others
    }
};

function AddEditMedicalRecordModal({ show, handleClose, petId, recordData, onRecordSaved, currentUser }) {
    const [recordType, setRecordType] = useState('Note');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState(getDefaultDetails('Note'));
    const [documentUrl, setDocumentUrl] = useState('');
    const [visibility, setVisibility] = useState('AllSharedProviders');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = !!recordData;

    useEffect(() => {
        if (isEditMode && recordData) {
            setRecordType(recordData.recordType || 'Note');
            setDate(recordData.date ? new Date(recordData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setTitle(recordData.title || '');
            // Ensure details is an object, merge with defaults for the type
            const defaultForType = getDefaultDetails(recordData.recordType || 'Note');
            setDetails(typeof recordData.details === 'object' && recordData.details !== null ? { ...defaultForType, ...recordData.details } : defaultForType);
            setDocumentUrl(recordData.documentUrl || '');
            setVisibility(recordData.visibility || 'AllSharedProviders');
        } else {
            // Reset form for adding
            const defaultType = 'Note';
            setRecordType(defaultType);
            setDate(new Date().toISOString().split('T')[0]);
            setTitle('');
            setDetails(getDefaultDetails(defaultType));
            setDocumentUrl('');
            // Default visibility might depend on the user adding
            setVisibility(currentUser?.role === 'PetOwner' ? 'OwnerOnly' : 'AllSharedProviders');
        }
        setError(null); // Clear errors when modal opens or data changes
    }, [recordData, isEditMode, show, currentUser]); // Rerun effect when modal is shown or data changes

    const handleRecordTypeChange = (e) => {
        const newType = e.target.value;
        setRecordType(newType);
        // Reset details to the default for the new type if not editing,
        // or merge existing compatible fields if editing (more complex)
        // For simplicity, just reset details when type changes
        setDetails(getDefaultDetails(newType)); 
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const payload = {
            recordType,
            date,
            title,
            details, // Send the details object
            documentUrl,
            visibility
        };

        try {
            let response;
            if (isEditMode) {
                response = await api.put(`/pets/${petId}/medical-records/${recordData._id}`, payload);
            } else {
                response = await api.post(`/pets/${petId}/medical-records`, payload);
            }

            if (response.data.success) {
                toast.success(`Medical record ${isEditMode ? 'updated' : 'added'} successfully.`);
                onRecordSaved(); // Callback to refresh list
                handleClose(); // Close modal
            } else {
                throw new Error(response.data.message || 'Failed to save record');
            }
        } catch (err) {
            const message = err.response?.data?.error || err.message || 'Error saving medical record';
            console.error("Save Medical Record Error:", err);
            setError(message);
            toast.error(`Save Failed: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Dynamic Form Fields based on recordType ---
    const renderDetailFields = () => {
        switch (recordType) {
            case 'Vaccination':
                return (
                    <>
                        <Form.Group as={Col} md="6" controlId="details.vaccineName" className="mb-3">
                            <Form.Label>Vaccine Name</Form.Label>
                            <Form.Control type="text" name="vaccineName" value={details.vaccineName || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="details.nextDueDate" className="mb-3">
                            <Form.Label>Next Due Date (Optional)</Form.Label>
                            <Form.Control type="date" name="nextDueDate" value={details.nextDueDate || ''} onChange={handleDetailChange} />
                        </Form.Group>
                    </>
                );
            case 'Procedure':
                 return (
                    <>
                        <Form.Group as={Col} md="6" controlId="details.description" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" name="description" value={details.description || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="details.outcome" className="mb-3">
                            <Form.Label>Outcome</Form.Label>
                            <Form.Control type="text" name="outcome" value={details.outcome || ''} onChange={handleDetailChange} />
                        </Form.Group>
                    </>
                );
            case 'Condition':
                 return (
                    <>
                        <Form.Group as={Col} md="4" controlId="details.diagnosis" className="mb-3">
                            <Form.Label>Diagnosis</Form.Label>
                            <Form.Control type="text" name="diagnosis" value={details.diagnosis || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md="4" controlId="details.onsetDate" className="mb-3">
                            <Form.Label>Onset Date (Approx)</Form.Label>
                            <Form.Control type="date" name="onsetDate" value={details.onsetDate || ''} onChange={handleDetailChange} />
                        </Form.Group>
                         <Form.Group as={Col} md="4" controlId="details.status" className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select name="status" value={details.status || 'Active'} onChange={handleDetailChange}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </>
                );
            case 'Allergy':
                 return (
                    <>
                        <Form.Group as={Col} md="6" controlId="details.allergen" className="mb-3">
                            <Form.Label>Allergen</Form.Label>
                            <Form.Control type="text" name="allergen" value={details.allergen || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="details.reaction" className="mb-3">
                            <Form.Label>Reaction (Optional)</Form.Label>
                            <Form.Control type="text" name="reaction" value={details.reaction || ''} onChange={handleDetailChange} />
                        </Form.Group>
                    </>
                );
             case 'LabResult':
                return (
                    <>
                        <Form.Group as={Col} md="6" controlId="details.testName" className="mb-3">
                            <Form.Label>Test Name</Form.Label>
                            <Form.Control type="text" name="testName" value={details.testName || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="details.resultSummary" className="mb-3">
                            <Form.Label>Result Summary</Form.Label>
                            <Form.Control type="text" name="resultSummary" value={details.resultSummary || ''} onChange={handleDetailChange} />
                        </Form.Group>
                        <Form.Group as={Col} md="12" controlId="details.notes" className="mb-3">
                            <Form.Label>Notes (Optional)</Form.Label>
                            <Form.Control as="textarea" rows={2} name="notes" value={details.notes || ''} onChange={handleDetailChange} />
                        </Form.Group>
                    </>
                );
            case 'Prescription':
                return (
                    <>
                        <Form.Group as={Col} md={6} controlId="details.medication" className="mb-3">
                            <Form.Label>Medication</Form.Label>
                            <Form.Control type="text" name="medication" value={details.medication || ''} onChange={handleDetailChange} required />
                        </Form.Group>
                         <Form.Group as={Col} md={6} controlId="details.dosage" className="mb-3">
                            <Form.Label>Dosage</Form.Label>
                            <Form.Control type="text" name="dosage" value={details.dosage || ''} onChange={handleDetailChange} />
                        </Form.Group>
                         <Form.Group as={Col} md={6} controlId="details.frequency" className="mb-3">
                            <Form.Label>Frequency</Form.Label>
                            <Form.Control type="text" name="frequency" value={details.frequency || ''} onChange={handleDetailChange} />
                        </Form.Group>
                         <Form.Group as={Col} md={6} controlId="details.duration" className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control type="text" name="duration" value={details.duration || ''} onChange={handleDetailChange} />
                        </Form.Group>
                    </>
                );
            case 'Observation':
            case 'Note':
            default:
                return (
                    <Form.Group as={Col} md="12" controlId="details.notes" className="mb-3">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control as="textarea" rows={3} name="notes" value={details.notes || ''} onChange={handleDetailChange} required />
                    </Form.Group>
                );
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static"> {/* static backdrop prevents closing on click outside */}
            <Modal.Header closeButton>
                <Modal.Title>{isEditMode ? 'Edit Medical Record' : 'Add New Medical Record'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row>
                        <Form.Group as={Col} md="6" controlId="recordType" className="mb-3">
                            <Form.Label>Record Type *</Form.Label>
                            <Form.Select value={recordType} onChange={handleRecordTypeChange} required>
                                {RECORD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} md="6" controlId="date" className="mb-3">
                            <Form.Label>Date *</Form.Label>
                            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                        </Form.Group>
                    </Row>
                    <Form.Group controlId="title" className="mb-3">
                        <Form.Label>Title / Summary *</Form.Label>
                        <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Annual Wellness Check, Rabies Shot" required />
                    </Form.Group>
                    
                    <hr />
                    <h5>Details</h5>
                    <Row>
                        {renderDetailFields()}
                    </Row>
                    <hr />
                    
                     <Row>
                         <Form.Group as={Col} md="6" controlId="documentUrl" className="mb-3">
                            <Form.Label>Document URL (Optional)</Form.Label>
                            <Form.Control type="url" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} placeholder="https://... link to lab result PDF" />
                        </Form.Group>
                         <Form.Group as={Col} md="6" controlId="visibility" className="mb-3">
                            <Form.Label>Visibility *</Form.Label>
                            <Form.Select value={visibility} onChange={(e) => setVisibility(e.target.value)} required>
                                {VISIBILITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </Form.Select>
                            <Form.Text>Who can see this record?</Form.Text>
                        </Form.Group>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <><Spinner size="sm" /> Saving...</> : (isEditMode ? 'Save Changes' : 'Add Record')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default AddEditMedicalRecordModal; 