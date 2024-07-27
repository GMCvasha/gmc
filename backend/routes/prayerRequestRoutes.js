const express = require('express');
const router = express.Router();
const prayerRequestController = require('../controllers/prayerRequestController');

// Route to create a new prayer request
router.post('/', prayerRequestController.createPrayerRequest);

module.exports = router;
