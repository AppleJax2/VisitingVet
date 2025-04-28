const Pet = require('../models/Pet');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const ServiceRequest = require('../models/ServiceRequest');
const { ROLES } = require('../config/constants');

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Private (PetOwner)
exports.createPet = async (req, res) => {
  const {
    name,
    species,
    breed,
    age,
    gender,
    weight,
    weightUnit,
    profileImage,
    microchipId,
    medicalHistory
  } = req.body;

  const ownerId = req.user._id; // Assuming auth middleware adds user to req

  // Basic validation
  if (!name || !species || !breed || age === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields: name, species, breed, age' });
  }
  
  if (typeof age !== 'number' || age < 0) {
       return res.status(400).json({ success: false, error: 'Age must be a non-negative number.' });
  }

  try {
    const newPet = new Pet({
      owner: ownerId,
      name,
      species,
      breed,
      age,
      gender, 
      weight,
      weightUnit,
      profileImage,
      microchipId,
      medicalHistory
    });

    const savedPet = await newPet.save();

    res.status(201).json({ 
      success: true, 
      message: 'Pet created successfully', 
      pet: savedPet 
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    // Handle potential validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server error creating pet' });
  }
};

// @desc    Get all pets for the logged-in user
// @route   GET /api/pets
// @access  Private (PetOwner)
exports.getUserPets = async (req, res) => {
  const ownerId = req.user._id; // Assuming auth middleware adds user to req

  try {
    const pets = await Pet.find({ owner: ownerId }).sort({ createdAt: -1 }); // Sort by creation date
    res.status(200).json({ 
      success: true, 
      count: pets.length,
      pets 
    });
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({ success: false, error: 'Server error fetching pets' });
  }
};

// @desc    Get a single pet by ID
// @route   GET /api/pets/:id
// @access  Private (Owner, related Vet/Clinic, Admin)
exports.getPetById = async (req, res) => {
  const petId = req.params.id;
  const userId = req.user._id; // Assuming auth middleware adds user to req
  const userRole = req.user.role.name; // Get role name from populated user object

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ success: false, error: 'Invalid pet ID format' });
  }

  try {
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Authorization check
    let isAuthorized = false;

    // 1. Check if the user is the owner
    if (pet.owner.toString() === userId.toString()) {
      isAuthorized = true;
    } 
    // 2. Check if the user is an Admin
    else if (userRole === ROLES.Admin) {
        isAuthorized = true;
    }
    // 3. Check if user is MVSProvider or Clinic and has a related active/recent record
    else if (userRole === ROLES.MVSProvider || userRole === ROLES.Clinic) {
        // Define criteria for "related" - e.g., active or recent appointments/requests
        const lookbackDate = new Date();
        lookbackDate.setDate(lookbackDate.getDate() - 90); // Example: check records within the last 90 days

        const query = {
            pet: petId,
            status: { $in: ['Scheduled', 'Confirmed', 'InProgress', 'Completed'] }, // Include relevant statuses
            // Check if the provider or clinic matches the requesting user
            $or: [
                { provider: userId }, 
                { clinic: userId } 
            ],
            // Optionally filter by date
            // updatedAt: { $gte: lookbackDate } 
        };

        const relatedAppointment = await Appointment.findOne(query).lean();
        const relatedServiceRequest = await ServiceRequest.findOne(query).lean();

        if (relatedAppointment || relatedServiceRequest) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        // Log unauthorized access attempt? Maybe not necessary here unless debugging.
        return res.status(403).json({ success: false, error: 'Not authorized to access this pet' });
    }

    res.status(200).json({ success: true, pet });
  } catch (error) {
    console.error(`Error fetching pet ${petId}:`, error);
    res.status(500).json({ success: false, error: 'Server error fetching pet details' });
  }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Private (Owner)
exports.updatePet = async (req, res) => {
  const petId = req.params.id;
  const userId = req.user._id;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ success: false, error: 'Invalid pet ID format' });
  }

  try {
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Authorization check: Ensure the user is the owner
    if (pet.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this pet' });
    }

    // Prevent owner field from being updated directly
    delete updateData.owner;
    // Allow profileImage to be updated (it will contain the URL from upload)
    // delete updateData.profileImage; // No longer needed

    const updatedPet = await Pet.findByIdAndUpdate(petId, updateData, {
      new: true, // Return the updated document
      runValidators: true // Run schema validators on update
    });

    res.status(200).json({ 
      success: true, 
      message: 'Pet updated successfully', 
      pet: updatedPet 
    });
  } catch (error) {
    console.error(`Error updating pet ${petId}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server error updating pet' });
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private (Owner)
exports.deletePet = async (req, res) => {
  const petId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ success: false, error: 'Invalid pet ID format' });
  }

  try {
    const pet = await Pet.findById(petId);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Authorization check: Ensure the user is the owner
    if (pet.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this pet' });
    }

    await pet.deleteOne(); // Use deleteOne() for Mongoose v6+

    res.status(200).json({ 
      success: true, 
      message: 'Pet deleted successfully', 
      petId: petId // Optionally return the ID of the deleted pet
    });
  } catch (error) {
    console.error(`Error deleting pet ${petId}:`, error);
    res.status(500).json({ success: false, error: 'Server error deleting pet' });
  }
}; 