// File: routes/emissions.js
const express = require('express');
const router = express.Router();
const emissionsController = require('../controllers/emissionController');
const auth = require('../middleware/auth');

// Calculate emissions
router.post('/calculate', auth, emissionsController.calculateEmissions);

// Get user emissions
router.get('/', auth, emissionsController.getUserEmissions);

module.exports = router;