import React from 'react';
import ServiceRequestDetail from '../components/Dashboard/ServiceRequestDetail';

const ServiceRequestDetailPage = () => {
  // This page component simply wraps the detail component.
  // The detail component itself now handles fetching data and displaying breadcrumbs.
  return (
    <ServiceRequestDetail />
  );
};

export default ServiceRequestDetailPage; 