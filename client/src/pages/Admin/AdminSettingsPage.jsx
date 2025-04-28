import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, InputGroup, Badge, ListGroup } from 'react-bootstrap';
import { adminGetSettings, adminUpdateSetting } from '../../services/api';
import { toast } from 'react-toastify';

// Helper to render the correct input type based on setting.type
const SettingInput = ({ setting, value, onChange }) => {
    switch (setting.type) {
        case 'boolean':
            return (
                <Form.Check 
                    type="switch"
                    id={`setting-${setting.key}`}
                    checked={Boolean(value)}
                    onChange={(e) => onChange(e.target.checked)}
                />
            );
        case 'number':
            return (
                <Form.Control 
                    type="number" 
                    value={value} 
                    onChange={(e) => onChange(Number(e.target.value))} 
                    step={setting.key.toLowerCase().includes('percentage') ? '0.01' : '1'} // Smaller step for percentages
                />
            );
        case 'string':
        default:
            // Use textarea for potentially longer strings
            if (setting.description?.toLowerCase().includes('name') || setting.description?.toLowerCase().includes('url')) {
                 return <Form.Control type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
            } 
            return <Form.Control as="textarea" rows={2} value={value} onChange={(e) => onChange(e.target.value)} />;
    }
};

function AdminSettingsPage() {
    const [settings, setSettings] = useState([]);
    const [initialValues, setInitialValues] = useState({}); // Store initial values to track changes
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState({}); // Track saving state per setting { key: boolean }
    const [error, setError] = useState(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminGetSettings();
            if (response.success) {
                setSettings(response.data || []);
                // Store initial values in a map for easy lookup
                const initial = (response.data || []).reduce((acc, setting) => {
                    acc[setting.key] = setting.value;
                    return acc;
                }, {});
                setInitialValues(initial);
            } else {
                throw new Error(response.message || 'Failed to load settings');
            }
        } catch (err) {
            console.error("Fetch Settings Error:", err);
            setError(err.message || 'Could not fetch settings.');
            setSettings([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleValueChange = (key, newValue) => {
        setSettings(currentSettings => 
            currentSettings.map(setting => 
                setting.key === key ? { ...setting, value: newValue } : setting
            )
        );
    };

    const handleSave = async (key) => {
        const settingToSave = settings.find(s => s.key === key);
        if (!settingToSave) return;

        setIsSaving(prev => ({ ...prev, [key]: true }));
        setError(null); // Clear general error on save attempt

        try {
            const response = await adminUpdateSetting(key, settingToSave.value);
            if (response.success) {
                toast.success(`Setting '${key}' updated successfully.`);
                // Update initial value to reflect saved state
                 setInitialValues(prev => ({ ...prev, [key]: settingToSave.value }));
            } else {
                 throw new Error(response.message || `Failed to update setting '${key}'.`);
            }
        } catch (err) {
             console.error(`Save Setting Error (${key}):`, err);
             setError(`Failed to save setting '${key}': ${err.message || 'Unknown error'}`); // Show specific error
             toast.error(`Failed to save setting '${key}'.`);
             // Optionally revert the change in UI
             // handleValueChange(key, initialValues[key]); 
        } finally {
             setIsSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
        const category = setting.category || 'General';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
    }, {});

    return (
        <Container className="mt-4 mb-5">
            <h2>Application Settings</h2>
            <p className="text-muted">Manage core application configurations.</p>
            
            {isLoading && <div className="text-center"><Spinner animation="border" /> Loading settings...</div>}
            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
            
            {!isLoading && Object.keys(groupedSettings).map(category => (
                <Card key={category} className="mb-4 shadow-sm">
                    <Card.Header as="h5">{category}</Card.Header>
                    <ListGroup variant="flush">
                        {groupedSettings[category].map(setting => {
                            const hasChanged = setting.value !== initialValues[setting.key];
                            return (
                                <ListGroup.Item key={setting.key} className="px-3 py-3">
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <strong title={setting.key}>{setting.key}</strong>
                                            {setting.type && <Badge pill bg="light" text="dark" className="ms-2 align-middle">{setting.type}</Badge>}
                                            <p className="text-muted mb-0"><small>{setting.description || 'No description provided.'}</small></p>
                                        </Col>
                                        <Col md={5}>
                                            <SettingInput 
                                                setting={setting} 
                                                value={setting.value} 
                                                onChange={(newValue) => handleValueChange(setting.key, newValue)} 
                                            />
                                        </Col>
                                        <Col md={3} className="text-end">
                                            <Button 
                                                variant="primary"
                                                size="sm" 
                                                onClick={() => handleSave(setting.key)}
                                                disabled={isSaving[setting.key] || !hasChanged}
                                                style={{ minWidth: '80px' }}
                                            >
                                                {isSaving[setting.key] ? <Spinner size="sm" /> : (hasChanged ? 'Save' : 'Saved')}
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                </Card>
            ))}

            {!isLoading && settings.length === 0 && !error && (
                 <Alert variant="warning">No editable settings found.</Alert>
            )}

        </Container>
    );
}

export default AdminSettingsPage; 