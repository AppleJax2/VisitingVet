import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../Shared/Button'; // Assuming a shared Button component exists
import ConfirmActionModal from '../Shared/ConfirmActionModal'; // Assuming a shared Modal exists
// Assume an API service exists for verification actions
// import { bulkApproveVerifications, bulkRejectVerifications } from '../../services/adminVerificationApi';
import { toast } from 'react-hot-toast'; // Assuming toast notifications are set up

/**
 * Component to render buttons for performing bulk actions on selected verification requests.
 */
const BulkVerificationActions = ({ selectedIds, onActionComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState(null); // 'approve' or 'reject'

    const hasSelection = selectedIds.length > 0;

    const handleBulkAction = async (actionType) => {
        setActionToConfirm(actionType);
        setShowConfirmModal(true);
    };

    const confirmAction = async () => {
        if (!actionToConfirm) return;

        setShowConfirmModal(false);
        setIsLoading(true);
        const actionVerb = actionToConfirm === 'approve' ? 'Approving' : 'Rejecting';
        const actionApi = actionToConfirm === 'approve' ? bulkApproveVerifications : bulkRejectVerifications;

        // Replace with actual API call
        const bulkApproveVerifications = async (ids) => { /* ... implementation ... */ };
        const bulkRejectVerifications = async (ids) => { /* ... implementation ... */ };

        toast.promise(
            // Simulate API call
            new Promise(async (resolve, reject) => {
                try {
                    console.log(`${actionVerb} ${selectedIds.length} verifications:`, selectedIds);
                    // const response = await actionApi(selectedIds);
                    // Simulate success/failure
                    await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
                    const success = Math.random() > 0.1; // Simulate 90% success rate

                    if (success) {
                        // if (response.success) {
                        resolve(`Successfully ${actionToConfirm}ed ${selectedIds.length} items.`);
                        if (onActionComplete) {
                            onActionComplete(); // Callback to refresh list or clear selection
                        }
                    } else {
                        // } else {
                        reject(new Error('Failed to perform bulk action. Please try again.'));
                        // reject(new Error(response.message || `Failed to ${actionToConfirm} items.`));
                    }
                } catch (error) {
                    console.error(`Error during bulk ${actionToConfirm}:`, error);
                    reject(error);
                }
            }),
            {
                loading: `${actionVerb} ${selectedIds.length} items...`,
                success: (message) => message,
                error: (err) => err.message || `An error occurred while ${actionToConfirm}ing items.`,
            }
        ).finally(() => {
            setIsLoading(false);
            setActionToConfirm(null);
        });
    };

    const cancelAction = () => {
        setShowConfirmModal(false);
        setActionToConfirm(null);
    };

    const modalMessage = `Are you sure you want to ${actionToConfirm} the selected ${selectedIds.length} verification request(s)? This action cannot be undone.`;

    return (
        <div className="flex items-center space-x-2 my-4 p-2 bg-gray-100 rounded border border-gray-200">
            <span className="text-sm font-medium text-gray-700 mr-2">
                {selectedIds.length} selected
            </span>
            <Button
                variant="success"
                onClick={() => handleBulkAction('approve')}
                disabled={!hasSelection || isLoading}
                loading={isLoading && actionToConfirm === 'approve'}
            >
                Approve Selected
            </Button>
            <Button
                variant="danger"
                onClick={() => handleBulkAction('reject')}
                disabled={!hasSelection || isLoading}
                loading={isLoading && actionToConfirm === 'reject'}
            >
                Reject Selected
            </Button>

            {showConfirmModal && (
                <ConfirmActionModal
                    isOpen={showConfirmModal}
                    onClose={cancelAction}
                    onConfirm={confirmAction}
                    title={`Confirm Bulk ${actionToConfirm?.charAt(0).toUpperCase() + actionToConfirm?.slice(1)}`}
                    confirmText={actionToConfirm?.charAt(0).toUpperCase() + actionToConfirm?.slice(1)}
                    cancelText="Cancel"
                    variant={actionToConfirm === 'approve' ? 'success' : 'danger'}
                >
                    <p className="text-sm text-gray-600">{modalMessage}</p>
                </ConfirmActionModal>
            )}
        </div>
    );
};

BulkVerificationActions.propTypes = {
    /** Array of IDs for the selected verification requests */
    selectedIds: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
    /** Callback function executed after a bulk action is successfully completed (e.g., to refresh data) */
    onActionComplete: PropTypes.func,
};

BulkVerificationActions.defaultProps = {
    onActionComplete: () => {},
};

export default BulkVerificationActions; 