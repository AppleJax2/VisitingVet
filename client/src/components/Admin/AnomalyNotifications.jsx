import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

const AnomalyNotifications = ({ anomalies, onDismiss }) => {
    // We receive an array of detected anomalies
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
            {anomalies.map((anomaly, index) => (
                <Toast 
                    key={index} 
                    onClose={() => onDismiss(index)} 
                    bg="warning"
                    // autohide // Can set autohide or require manual dismissal
                    // delay={10000} 
                >
                    <Toast.Header closeButton>
                        <ExclamationTriangleFill className="me-2 text-danger" />
                        <strong className="me-auto">Anomaly Detected!</strong>
                        <small>{new Date(anomaly.checkTimestamp).toLocaleTimeString()}</small>
                    </Toast.Header>
                    <Toast.Body>
                        {anomaly.message || 'An anomaly was detected in recent metrics.'}
                        <div className="mt-1">
                             <small>
                                 Metric: {anomaly.metricName}, 
                                 Value: {anomaly.latestValue}, 
                                 Expected Range: {anomaly.lowerThreshold} - {anomaly.upperThreshold}
                             </small>
                        </div>
                    </Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default AnomalyNotifications; 