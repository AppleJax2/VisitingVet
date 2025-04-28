const express = require('express');
const { getSettings, updateSetting } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

const router = express.Router();

// All settings routes require admin access
router.use(protect, authorize(ROLES.Admin));

// GET all editable settings
router.get('/', getSettings);

// PUT update a single setting by key
router.put('/:key', updateSetting);

module.exports = router; 