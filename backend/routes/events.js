const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getAllEvents);

// Create a new event
router.post('/', eventController.createEvent);

module.exports = router;
