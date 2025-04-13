// File: src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get user profile
router.get('/profile', auth, authController.getUserProfile);

module.exports = router;