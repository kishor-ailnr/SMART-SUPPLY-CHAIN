const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET events for a specific trip/vehicle
router.get('/:id/events', async (req, res) => {
  try {
    const db = getDb();
    // For the demo, we return some mock events if none exist in DB
    // In a real app, these would come from an events table
    const mockEvents = [
      {
        event_type: 'CONGESTION_RISK',
        severity: 'LOW',
        confidence_score: 0.88,
        description: 'Moderate congestion detected on NH48 near Khaniwade. Delay: 12 min.',
        timestamp: new Date().toISOString()
      },
      {
        event_type: 'WEATHER_ALERT',
        severity: 'MODERATE',
        confidence_score: 0.75,
        description: 'Localized precipitation forecast in Patparganj zone. Reduced friction risk.',
        timestamp: new Date().toISOString()
      },
      {
        event_type: 'GEOFENCE_EXIT',
        severity: 'HIGH',
        confidence_score: 0.99,
        description: 'Vehicle successfully cleared Charoti Checkpoint perimeter.',
        timestamp: new Date().toISOString()
      }
    ];
    
    // Check if we have events in DB (optional, but good for growth)
    // For now, return mock for demo consistency
    res.json(mockEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
