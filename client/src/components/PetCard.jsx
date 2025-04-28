import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { PencilSquare, Trash, Eye } from 'react-bootstrap-icons';
import theme from '../utils/theme';

// Define styles within the component or pass via props if more dynamic
const styles = {
  petCard: {
    border: 'none',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    overflow: 'hidden',
    marginBottom: '20px',
    height: '100%',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
       transform: 'translateY(-5px)',
       boxShadow: theme.shadows.md,
    }
  },
  petImage: {
    height: '180px',
    objectFit: 'cover',
  },
  cardTitle: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  actionButton: {
    marginRight: '5px',
    marginLeft: '5px',
  }
};

const PetCard = ({ pet, onEdit, onDelete, onView }) => {
  if (!pet) return null;

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click if button is clicked
    if (onEdit) onEdit(pet);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(pet._id, pet.name);
  };

  const handleCardClick = () => {
    // Default action on card click could be navigating to profile
    // Or triggering onView if provided
    if (onView) {
      onView(pet); // Or navigate(`/pet/${pet._id}`);
    } else {
      // Default navigation if no onView handler
      // Requires importing useNavigate from react-router-dom
      // const navigate = useNavigate(); 
      // navigate(`/pet/${pet._id}`);
      console.log('Card clicked, navigating to profile not implemented by default here.');
    }
  };

  return (
    <Card 
      style={styles.petCard} 
      // onClick={handleCardClick} // Add onClick for card navigation/view
      // className="cursor-pointer" // Add if making the whole card clickable
    >
      <Card.Img 
        variant="top" 
        src={pet.profileImage || 'https://via.placeholder.com/300x200?text=Pet+Photo'} 
        style={styles.petImage}
        className="img-fluid" // Ensure responsiveness
      />
      <Card.Body>
        <Card.Title style={styles.cardTitle}>{pet.name}</Card.Title>
        <Card.Text className="text-muted">
          {pet.breed} ({pet.species}) • {pet.age} years old
        </Card.Text>
        {/* Add more brief details if needed */}
      </Card.Body>
      <Card.Footer className="bg-white text-center">
        {/* Conditionally render buttons based on handlers provided */}
        {onView && (
          <Button variant="outline-secondary" size="sm" style={styles.actionButton} onClick={(e) => { e.stopPropagation(); onView(pet); }} title="View Details"><Eye /></Button>
        )}
        {onEdit && (
           <Button variant="outline-primary" size="sm" style={styles.actionButton} onClick={handleEditClick} title="Edit Pet"><PencilSquare /></Button>
        )}
        {onDelete && (
          <Button variant="outline-danger" size="sm" style={styles.actionButton} onClick={handleDeleteClick} title="Delete Pet"><Trash /></Button>
        )}
      </Card.Footer>
    </Card>
  );
};

export default PetCard; 