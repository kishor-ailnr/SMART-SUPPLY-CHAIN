import { seedDatabase } from '../server/seed.js';
import db from '../server/db.js';

try {
  seedDatabase();
  console.log("Seeded database");
  const flights = db.prepare(`
      SELECT f.id, f.flight_number_iata as flight_number, f.origin_icao as origin, 
             f.destination_icao as destination, f.peak_risk_level as risk,
             a.registration, a.icao_type, a.airline_name,
             p.lat, p.lng, p.altitude_ft, p.true_heading, p.squawk, p.signal_quality
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      JOIN (
        SELECT flight_id, lat, lng, altitude_ft, true_heading, squawk, signal_quality
        FROM adsb_positions
        WHERE id IN (SELECT MAX(id) FROM adsb_positions GROUP BY flight_id)
      ) p ON f.id = p.flight_id
      WHERE f.status != 'ARRIVED'
    `).all();
  console.log("Success items:", flights.length);
} catch (e) {
  console.error("Failed:", e.message);
}
