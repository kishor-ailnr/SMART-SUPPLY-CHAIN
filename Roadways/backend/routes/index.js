const express = require('express');
const router = express.Router();

// Import individual route modules
const vehicleRoutes = require('./vehicles');
// Placeholder for other route modules (routes, trips, etc.)

router.use('/vehicles', vehicleRoutes);

module.exports = router;
