import { WebSocketServer } from 'ws';
import db from './db.js';

function moveAircraft(lat, lng, heading, speedKtas, updateIntervalMs) {
  // Rough calculation: speed in KTAS, convert to degrees per second
  const speedNmPerSec = speedKtas / 3600;
  const distThisTick = speedNmPerSec * (updateIntervalMs / 1000);
  
  // 1 degree latitude = 60 nm
  // 1 degree longitude = 60 nm * cos(lat)
  const latChange = (distThisTick * Math.cos(heading * Math.PI / 180)) / 60;
  const lngChange = (distThisTick * Math.sin(heading * Math.PI / 180)) / (60 * Math.cos(lat * Math.PI / 180) || 1);
  
  return { lat: lat + latChange, lng: lng + lngChange };
}

export function startSimulation(server) {
  const wss = new WebSocketServer({ server });
  const UPDATE_INTERVAL = parseInt(process.env.ADSB_UPDATE_INTERVAL_MS || '2000'); // 2 seconds for active demo
  
  const getFlights = db.prepare(`
    SELECT f.id as flight_id, f.aircraft_id, f.filed_speed_ktas, f.status, f.callsign, a.registration
    FROM flights f
    JOIN aircraft a ON f.aircraft_id = a.id
    WHERE f.status != 'ARRIVED'
  `);
  
  const getPos = db.prepare(`SELECT lat, lng, altitude_ft, true_heading, squawk, signal_quality FROM adsb_positions WHERE flight_id = ? ORDER BY id DESC LIMIT 1`);
  
  const insertPosition = db.prepare(`
    INSERT INTO adsb_positions (aircraft_id, flight_id, lat, lng, altitude_ft, true_heading, squawk, signal_quality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  setInterval(() => {
    const flights = getFlights.all();
    const updates = [];
    
    db.transaction(() => {
      for (const flight of flights) {
        const p = getPos.get(flight.flight_id);
        if (p) Object.assign(flight, p);
        
        // Skip moving if it's the gap aircraft
        if (flight.squawk === '1001') continue; 
        
        const newPos = moveAircraft(flight.lat || 0, flight.lng || 0, flight.true_heading || 0, flight.filed_speed_ktas || 450, UPDATE_INTERVAL);
        const newAlt = flight.flight_id === 'fl_7' ? Math.max(0, flight.altitude_ft - 200) : flight.altitude_ft; // Emergency aircraft descends
        
        insertPosition.run(
          flight.aircraft_id, flight.flight_id, newPos.lat, newPos.lng, newAlt, flight.true_heading, flight.squawk, flight.signal_quality
        );
        
        updates.push({
          flight_id: flight.flight_id,
          lat: newPos.lat,
          lng: newPos.lng,
          altitude_ft: newAlt,
          true_heading: flight.true_heading,
          squawk: flight.squawk,
          signal_quality: flight.signal_quality
        });
      }
    })();
    
    // Broadcast to WS clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({ type: 'POSITIONS_UPDATE', data: updates }));
      }
    });

  }, UPDATE_INTERVAL);
  
  return wss;
}
