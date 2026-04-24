const cron = require('node-cron');

function startSimulation(db, broadcast) {
  console.log('Starting Roadways Simulation Engine...');

  cron.schedule('*/10 * * * * *', () => {
    db.all('SELECT * FROM vehicles WHERE is_active = 1', (err, vehicles) => {
      if (err) return console.error('Sim error:', err);
      
      for (const v of vehicles) {
        const deltaLat = (Math.random() - 0.5) * 0.005;
        const deltaLng = (Math.random() - 0.5) * 0.005;
        
        const newLat = v.last_lat + deltaLat;
        const newLng = v.last_lng + deltaLng;
        const newSpeed = v.last_speed + (Math.random() - 0.5) * 5;
        const newHeading = (v.last_heading + (Math.random() - 0.5) * 20) % 360;

        db.run(`
          UPDATE vehicles 
          SET last_lat = ?, last_lng = ?, last_speed = ?, last_heading = ?, last_update = datetime('now')
          WHERE id = ?
        `, [newLat, newLng, Math.max(0, newSpeed), newHeading, v.id]);

        if (Math.random() < 0.05) {
          generateRandomEvent(db, v, broadcast);
        }
      }

      db.all('SELECT * FROM vehicles', (err, updatedVehicles) => {
        if (!err) broadcast({ type: 'VEHICLE_UPDATES', data: updatedVehicles });
      });
    });
  });
}

function generateRandomEvent(db, vehicle, broadcast) {
  const eventTypes = ['WEATHER', 'ROAD', 'SECURITY', 'COMPLIANCE', 'DRIVER'];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const severities = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  
  const event = {
    vehicle_id: vehicle.id,
    event_type: type,
    source: 'SIMULATION_AGENT',
    title: `${type} Alert for ${vehicle.registration_number}`,
    description: `System detected ${severity.toLowerCase()} ${type.toLowerCase()} risk near current location.`,
    severity,
    lat: vehicle.last_lat,
    lng: vehicle.last_lng,
    confidence_score: 0.8 + Math.random() * 0.2
  };

  db.run(`
    INSERT INTO intelligence_events (vehicle_id, event_type, source, title, description, severity, lat, lng, confidence_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [event.vehicle_id, event.event_type, event.source, event.title, event.description, event.severity, event.lat, event.lng, event.confidence_score]);

  broadcast({ type: 'NEW_EVENT', data: event });
}

module.exports = { startSimulation };
