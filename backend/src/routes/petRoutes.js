const express = require('express');
const {
  createPet,
  getUserPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all pet routes
router.use(protect);

// Routes accessible only to PetOwners
router.route('/')
  .post(authorize('PetOwner'), createPet)
  .get(authorize('PetOwner'), getUserPets);

// Routes for specific pet ID
router.route('/:id')
  .get(authorize('PetOwner'), getPetById)
  .put(authorize('PetOwner'), updatePet)
  .delete(authorize('PetOwner'), deletePet);

module.exports = router; 