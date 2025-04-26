const Appointment = require('../models/Appointment');
const User = require('../models/User');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const mongoose = require('mongoose');
const { startOfDay, endOfDay } = require('date-fns');

// @desc    Get clinic appointments for a specific date
// @route   GET /api/clinics/appointments?date=YYYY-MM-DD
// @access  Private (Clinic Admin/Staff - needs role check)
exports.getClinicAppointments = async (req, res) => {
  const clinicUserId = req.user._id; // Assuming the logged-in user belongs to the clinic
  const requestedDate = req.query.date; // Expecting 'YYYY-MM-DD'

  // TODO: Implement proper authorization check - Ensure user is part of a clinic
  if (req.user.role !== 'Clinic') { // Basic check, needs refinement
       return res.status(403).json({ success: false, error: 'User not authorized for clinic data' });
  }

  if (!requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return res.status(400).json({ success: false, error: 'Valid date (YYYY-MM-DD) query parameter is required' });
  }

  try {
    const targetDate = new Date(requestedDate + 'T00:00:00.000Z'); // Use UTC or consistent timezone
    const start = startOfDay(targetDate);
    const end = endOfDay(targetDate);

    // Find providers associated with the clinic (This logic needs implementation based on how clinics/staff are linked)
    // For now, Placeholder: assume we have a way to get providerProfile IDs linked to the clinic
    // const clinicProviders = await getProvidersForClinic(clinicUserId); 
    // const providerProfileIds = clinicProviders.map(p => p._id);
    
    // --- Placeholder Logic --- 
    // Fetching *all* appointments for the date until clinic/staff link is defined
    // This is NOT secure or correct for multi-clinic setup!
    const appointments = await Appointment.find({
       // providerProfile: { $in: providerProfileIds }, // Correct filtering needed here
        appointmentTime: {
            $gte: start,
            $lte: end
        }
    })
    .populate('petOwner', 'email')
    .populate({ 
        path: 'providerProfile', 
        select: 'user businessName', // Select relevant fields
        populate: { path: 'user', select: 'name email' } // Populate user within profile
    })
    .populate('service', 'name')
    .sort({ appointmentTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });

  } catch (error) {
    console.error('Error fetching clinic appointments:', error);
    res.status(500).json({ success: false, error: 'Server error fetching clinic appointments' });
  }
};

// @desc    Get clinic staff members
// @route   GET /api/clinics/staff
// @access  Private (Clinic Admin/Staff)
exports.getClinicStaff = async (req, res) => {
    const clinicUserId = req.user._id;

    // TODO: Implement proper authorization check - Ensure user is part of a clinic
    if (req.user.role !== 'Clinic') { // Basic check, needs refinement
        return res.status(403).json({ success: false, error: 'User not authorized for clinic data' });
    }

    try {
        // Find users/profiles associated with the clinic (This logic needs implementation)
        // Placeholder: Find all MVSProvider users until linking is defined
        // This is NOT correct for a real implementation
        const staff = await User.find({ role: 'MVSProvider' })
                            .select('name email role specialty status'); // Adjust fields as needed

        res.status(200).json({ success: true, count: staff.length, staff });

    } catch (error) {
        console.error('Error fetching clinic staff:', error);
        res.status(500).json({ success: false, error: 'Server error fetching clinic staff' });
    }
};

// TODO: Add functions for adding/updating/deleting staff, managing clinic profile, inventory, etc. 