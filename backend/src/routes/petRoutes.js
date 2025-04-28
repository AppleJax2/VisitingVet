const express = require('express');
const {
  createPet,
  getUserPets,
  getPetById,
  updatePet,
  deletePet
} = require('../controllers/petController');
const {
    addMedicalRecord,
    getMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// Apply authentication middleware to all routes below
router.use(protect);

// --- Pet CRUD --- 
// Routes accessible only to PetOwners for creating/listing their pets
router.route('/')
  .post(authorize(ROLES.PetOwner), createPet)
  .get(authorize(ROLES.PetOwner), getUserPets);

// Routes for specific pet ID (accessible by Owner and potentially others)
// TODO: Refine authorization for GET/PUT/DELETE pet details based on provider relationships if needed
router.route('/:id')
  .get(authorize(ROLES.PetOwner, ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin), getPetById)
  .put(authorize(ROLES.PetOwner, ROLES.Admin), updatePet)
  .delete(authorize(ROLES.PetOwner, ROLES.Admin), deletePet);

// --- Medical Records --- 
// Nested routes under /:petId/medical-records
router.route('/:petId/medical-records')
  .post(authorize(ROLES.PetOwner, ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin), addMedicalRecord)
  .get(authorize(ROLES.PetOwner, ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin), getMedicalRecords);

router.route('/:petId/medical-records/:recordId')
  .put(authorize(ROLES.PetOwner, ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin), updateMedicalRecord)
  .delete(authorize(ROLES.PetOwner, ROLES.MVSProvider, ROLES.Clinic, ROLES.Admin), deleteMedicalRecord);

module.exports = router; 