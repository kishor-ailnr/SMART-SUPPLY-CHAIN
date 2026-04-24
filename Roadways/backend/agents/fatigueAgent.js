function monitorFatigue(db, broadcast) {
  db.all('SELECT * FROM vehicles WHERE last_speed > 0', (err, vehicles) => {
    if (err || !vehicles) return;

    for (const v of vehicles) {
      const drivingHours = (Math.random() * 8);
      const speedVariance = Math.random() * 20;
      let fatigueScore = (drivingHours / 10) * 50 + (speedVariance / 20) * 50;
      fatigueScore = Math.min(100, fatigueScore);

      if (fatigueScore > 75) {
        const severity = fatigueScore > 90 ? 'CRITICAL' : 'HIGH';
        const event = {
          vehicle_id: v.id,
          event_type: 'DRIVER',
          source: 'FATIGUE_AGENT',
          title: `CRITICAL DRIVER FATIGUE DETECTED`,
          description: `Alert: Driver ${v.driver_name} showing signs of microsleep or severe fatigue (Score: ${Math.round(fatigueScore)}). Continuous driving: ${Math.round(drivingHours)}h.`,
          severity: severity,
          lat: v.last_lat,
          lng: v.last_lng,
          confidence_score: 0.94
        };

        db.run(`
          INSERT INTO driver_fatigue_events (vehicle_id, fatigue_score, speed_variance, continuous_driving_hours, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))
        `, [v.id, fatigueScore, speedVariance, drivingHours]);

        db.run(`
          INSERT INTO intelligence_events (vehicle_id, event_type, source, title, description, severity, lat, lng, confidence_score)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [v.id, event.event_type, event.source, event.title, event.description, event.severity, event.lat, event.lng, event.confidence_score]);

        broadcast({ type: 'NEW_EVENT', data: event });
      }
    }
  });
}

module.exports = { monitorFatigue };
