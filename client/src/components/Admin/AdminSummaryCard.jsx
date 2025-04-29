import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Spinner from 'react-bootstrap/Spinner';

const AdminSummaryCard = ({ 
  title, 
  value, 
  icon, 
  variant = 'primary', 
  linkTo, 
  isLoading = false 
}) => {
  return (
    <Card 
      className={`shadow-sm h-100 border-${variant}`} 
      style={{ borderLeft: `4px solid var(--bs-${variant})` }}
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <Card.Title className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>{title}</Card.Title>
          {isLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Card.Text className="h3 mb-0 fw-bold">{value}</Card.Text>
          )}
        </div>
        <div className={`display-4 text-${variant}`}>
          {icon}
        </div>
      </Card.Body>
      {linkTo && (
        <Link to={linkTo} className="text-decoration-none">
          <Card.Footer className={`bg-${variant} bg-opacity-10 text-${variant} text-center`}>
            View Details
          </Card.Footer>
        </Link>
      )}
    </Card>
  );
};

AdminSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  variant: PropTypes.string,
  linkTo: PropTypes.string,
  isLoading: PropTypes.bool
};

export default AdminSummaryCard; 