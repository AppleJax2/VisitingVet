const express = require('express');
const {
  createPet,
  getUserPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware'); // Correctly import protect
const { restrictTo } = require('../controllers/authController'); // Correctly import restrictTo

const router = express.Router();

// Apply authentication middleware to all pet routes
router.use(protect);

// Routes accessible only to PetOwners (assuming 'PetOwner' is the role string)
router.route('/')
  .post(restrictTo('PetOwner'), createPet)
  .get(restrictTo('PetOwner'), getUserPets);

// Routes for specific pet ID
router.route('/:id')
  .get(restrictTo('PetOwner'), getPetById) // Initially restrict to owner, can be expanded
  .put(restrictTo('PetOwner'), updatePet)
  .delete(restrictTo('PetOwner'), deletePet);

module.exports = router; 