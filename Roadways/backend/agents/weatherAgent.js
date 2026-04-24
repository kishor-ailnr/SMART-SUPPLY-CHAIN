const axios = require('axios');

async function checkWeather(db, broadcast) {
  db.all('SELECT * FROM vehicles WHERE is_active = 1', async (err, vehicles) => {
    if (err || !vehicles) return;
    
    for (const v of vehicles) {
      const risk = Math.random() < 0.1 ? 'HIGH' : 'LOW';
      if (risk === 'HIGH') {
        const event = {
          vehicle_id: v.id,
          event_type: 'WEATHER',
          source: 'WEATHER_AGENT',
          title: `Monsoon Alert - NH48`,
          description: `Heavy rainfall predicted in the next 2 hours near ${v.registration_number}'s current corridor. Visibility expected < 500m.`,
          severity: 'HIGH',
          lat: v.last_lat,
          lng: v.last_lng,
          confidence_score: 0.89
        };
        
        db.run(`
          INSERT INTO intelligence_events (vehicle_id, event_type, source, title, description, severity, lat, lng, confidence_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [event.vehicle_id, event.event_type, event.source, event.title, event.description, event.severity, event.lat, event.lng, event.confidence_score]);
        
        broadcast({ type: 'NEW_EVENT', data: event });
      }
    }
  });
}

module.exports = { checkWeather };
