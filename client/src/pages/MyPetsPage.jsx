import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PlusCircle, PencilSquare, Trash, Eye } from 'react-bootstrap-icons';
import { fetchUserPets, deletePet } from '../services/api'; // Assuming deletePet exists
import theme from '../utils/theme';
import PetEditModal from '../components/PetEditModal'; // Import the modal
import PetCard from '../components/PetCard'; // Import the new PetCard component
// import PetDetailModal from '../components/PetDetailModal'; // Future component for viewing details

function MyPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const navigate = useNavigate();

  // State for Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  // TODO: State for Detail Modal
  // const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchUserPets();
        if (response.success) {
          setPets(response.pets || []);
        } else {
          setError(response.error || 'Failed to load pets.');
        }
      } catch (err) {
        console.error('Error loading pets:', err);
        setError(err.message || 'An error occurred while fetching pets.');
        // Handle potential 401 Unauthorized errors - redirect to login?
      } finally {
        setLoading(false);
      }
    };
    loadPets();
  }, []);

  const handleDelete = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete ${petName}? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const response = await deletePet(petId);
      if (response.success) {
        setPets(pets.filter(pet => pet._id !== petId));
        setDeleteSuccess(`Successfully deleted ${petName}.`);
      } else {
        setDeleteError(response.error || 'Failed to delete pet.');
      }
    } catch (err) {
      console.error('Error deleting pet:', err);
      setDeleteError(err.message || 'An error occurred during deletion.');
    }
  };

  // Handlers for showing modals
  const handleShowEditModal = (pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleHideEditModal = () => {
    setShowEditModal(false);
    setSelectedPet(null);
  };

  const handlePetUpdate = (updatedPet) => {
    setPets(pets.map(p => p._id === updatedPet._id ? updatedPet : p));
    // Optionally show a success message here
  };

  // Handler for viewing pet profile (navigation)
  const handleViewPet = (pet) => {
    navigate(`/pet/${pet._id}`);
  };

  // TODO: Handlers for Detail Modal
  // const handleViewDetails = (pet) => {
  //   setSelectedPet(pet);
  //   setShowDetailModal(true);
  // };

  const styles = {
    pageTitle: {
      color: theme.colors.primary.dark,
      marginBottom: '30px',
    },
    addButtonCard: {
      border: `2px dashed ${theme.colors.background.medium}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      backgroundColor: theme.colors.background.light,
      '&:hover': {
        backgroundColor: theme.colors.background.medium,
      },
      height: '100%',
    },
    addButtonIcon: {
      color: theme.colors.primary.main,
      fontSize: '2.5rem',
      marginBottom: '10px',
    },
    actionButton: {
      marginRight: '5px',
      marginLeft: '5px',
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 style={styles.pageTitle}>My Pets</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => navigate('/add-pet')} style={{backgroundColor: theme.colors.primary.main}}>
            <PlusCircle className="me-2" /> Add New Pet
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>{deleteError}</Alert>}
      {deleteSuccess && <Alert variant="success" dismissible onClose={() => setDeleteSuccess('')}>{deleteSuccess}</Alert>}

      {loading ? (
        <div className="text-center"><Spinner animation="border" style={{color: theme.colors.primary.main}} /></div>
      ) : (
        <Row>
          {pets.length === 0 && !loading ? (
            <Col xs={12}>
               <Alert variant="info" className="text-center">
                 You haven't added any pets yet. 
                 <Link to="/add-pet" className="alert-link"> Add your first pet now!</Link>
               </Alert>
            </Col>
          ) : (
             pets.map((pet) => (
              <Col md={6} lg={4} key={pet._id} className="mb-4 d-flex align-items-stretch">
                <PetCard 
                  pet={pet} 
                  onEdit={handleShowEditModal} 
                  onDelete={handleDelete} 
                  onView={handleViewPet} // Pass the view handler
                />
              </Col>
             ))
          )}
        </Row>
      )}

      {/* Render Edit Modal */}
      {selectedPet && (
        <PetEditModal 
          show={showEditModal} 
          onHide={handleHideEditModal} 
          pet={selectedPet} 
          onUpdate={handlePetUpdate}
        />
      )}

      {/* TODO: Render Detail Modal */}
      {/* {selectedPet && showDetailModal && (
        <PetDetailModal 
          show={showDetailModal} 
          onHide={() => setShowDetailModal(false)} 
          pet={selectedPet} 
        />
      )} */}
    </Container>
  );
}

export default MyPetsPage; 