import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { initiateRefund } from '../../services/api';
import { toast } from 'react-toastify';

const RefundModal = ({ show, onHide, payment, onRefundSuccess }) => {
    const [refundAmount, setRefundAmount] = useState(''); // Amount in dollars
    const [reason, setReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const maxRefundable = payment ? (payment.totalAmount - (payment.netAmount - payment.platformFee)).toFixed(2) : '0.00';
    // Correction: Max refundable is total amount minus already refunded (if tracked, otherwise full amount)
    // Assuming payment object has totalAmount (dollars). Need refundedAmount if available.
    const actualMaxRefundable = payment ? (payment.totalAmount - (payment.refundedAmount || 0)).toFixed(2) : '0.00';

    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Allow empty string or valid number format
        if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
             setRefundAmount(value);
             setError(''); // Clear error on change
        } 
    };

    const handleReasonChange = (e) => {
        setReason(e.target.value);
    };

    const handleFullRefund = () => {
        setRefundAmount(actualMaxRefundable);
    };

    const handleSubmitRefund = async () => {
        setError('');
        const requestedAmount = parseFloat(refundAmount);
        
        if (refundAmount !== '' && (isNaN(requestedAmount) || requestedAmount <= 0)) {
            setError('Invalid refund amount entered.');
            return;
        }
        if (refundAmount !== '' && requestedAmount > parseFloat(actualMaxRefundable)) {
             setError(`Amount cannot exceed the refundable amount of $${actualMaxRefundable}.`);
            return;
        }

        setIsProcessing(true);
        try {
            const refundData = {
                reason: reason || undefined,
                amount: refundAmount ? requestedAmount : undefined // Send amount only if specified (for partial)
            };
            const response = await initiateRefund(payment.paymentIntentId, refundData);
            if (response.success) {
                toast.success(response.message || 'Refund initiated successfully!');
                if(onRefundSuccess) onRefundSuccess(); // Callback to refresh history
                onHide(); // Close modal
            } else {
                 throw new Error(response.message || 'Failed to initiate refund.');
            }
        } catch (err) {
            console.error("Refund initiation error:", err);
            setError(err.message || 'An unexpected error occurred.');
            toast.error(`Refund Failed: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset state when modal is hidden
    const handleExited = () => {
        setRefundAmount('');
        setReason('');
        setError('');
        setIsProcessing(false);
    };

    if (!payment) return null;

    return (
        <Modal show={show} onHide={onHide} centered onExited={handleExited}>
            <Modal.Header closeButton>
                <Modal.Title>Initiate Refund</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                <p><strong>Payment Intent ID:</strong> <small>{payment.paymentIntentId}</small></p>
                <p><strong>Payer:</strong> {payment.payerName} ({payment.payerEmail})</p>
                <p><strong>Provider:</strong> {payment.providerName} ({payment.providerEmail})</p>
                <p><strong>Gross Amount:</strong> ${payment.totalAmount?.toFixed(2)}</p>
                 <p><strong>Refundable Amount:</strong> <Badge bg="warning" text="dark">${actualMaxRefundable}</Badge></p>
                 
                <Form>
                    <Form.Group className="mb-3" controlId="refundAmount">
                        <Form.Label>Refund Amount (Optional - leave blank for full)</Form.Label>
                        <InputGroup>
                             <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                                type="text" // Use text to better control decimal input
                                value={refundAmount}
                                onChange={handleAmountChange}
                                placeholder={`Max $${actualMaxRefundable}`}
                                isInvalid={!!error && error.includes('amount')}
                            />
                            <Button variant="outline-secondary" onClick={handleFullRefund}>
                                Max
                            </Button>
                             <Form.Control.Feedback type="invalid">
                                 {error}
                             </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="refundReason">
                        <Form.Label>Reason (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={reason}
                            onChange={handleReasonChange}
                            placeholder="e.g., Service cancelled, duplicate charge"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isProcessing}>
                    Cancel
                </Button>
                <Button variant="warning" onClick={handleSubmitRefund} disabled={isProcessing}>
                    {isProcessing ? <><Spinner size="sm"/> Processing...</> : 'Initiate Refund'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

RefundModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    payment: PropTypes.object, // The payment object from history
    onRefundSuccess: PropTypes.func, // Callback after successful initiation
};

export default RefundModal; 