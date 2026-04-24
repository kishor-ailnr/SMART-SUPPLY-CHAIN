import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { seedDatabase } from './server/seed.js';
import { startSimulation } from './server/simulation.js';
import db from './server/db.js';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the database with demo data
seedDatabase();

// REST API Endpoints
app.get('/api/flights/active', (req, res) => {
  try {
    const flights = db.prepare(`
      SELECT f.id, f.flight_number_iata as flight_number, f.origin_icao as origin, 
             f.destination_icao as destination, f.peak_risk_level as risk,
             a.registration, a.icao_type, a.airline_name
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      WHERE f.status != 'ARRIVED'
    `).all();

    for (let flight of flights) {
      const p = db.prepare(`SELECT lat, lng, altitude_ft, true_heading, squawk, signal_quality FROM adsb_positions WHERE flight_id = ? ORDER BY id DESC LIMIT 1`).get(flight.id);
      if (p) Object.assign(flight, p);
    }

    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/flights/:id', (req, res) => {
  try {
    const { id } = req.params;
    const flight = db.prepare(`
      SELECT a.*, f.*, f.id as id, f.id as flight_id, a.icao_type as aircraft_type, a.registration
      FROM flights f
      JOIN aircraft a ON f.aircraft_id = a.id
      WHERE f.id = ?
    `).get(id);

    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    
    const p = db.prepare(`SELECT lat, lng, altitude_ft, true_heading, squawk, signal_quality FROM adsb_positions WHERE flight_id = ? ORDER BY id DESC LIMIT 1`).get(id);
    if (p) Object.assign(flight, p);
    
    const positions = db.prepare(`
      SELECT lat, lng, altitude_ft, timestamp 
      FROM adsb_positions 
      WHERE flight_id = ? 
      ORDER BY id ASC
    `).all(id);

    res.json({ ...flight, track: positions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cargo', (req, res) => {
  try {
    const cargo = db.prepare(`SELECT * FROM manual_cargo`).all();
    const checkpoints = db.prepare(`SELECT * FROM cargo_checkpoints ORDER BY sequence_order ASC`).all();
    
    cargo.forEach(c => {
      c.checkpoints = checkpoints.filter(cp => cp.cargo_id === c.id);
    });
    
    res.json(cargo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cargo', (req, res) => {
  try {
    const { id, flight_number, aircraft_name, origin, destination, cargo_type, weight_kg, volume_cbm, sender_details, receiver_details, departure_time, eta, checkpoints } = req.body;
    db.prepare(`
      INSERT INTO manual_cargo (id, flight_number, aircraft_name, origin, destination, cargo_type, weight_kg, volume_cbm, sender_details, receiver_details, departure_time, eta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, flight_number, aircraft_name, origin, destination, cargo_type, weight_kg, volume_cbm, sender_details, receiver_details, departure_time, eta);
    
    if (checkpoints && checkpoints.length > 0) {
      const insertCp = db.prepare(`INSERT INTO cargo_checkpoints (cargo_id, checkpoint_name, sequence_order, lat, lng, status, actual_time) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      checkpoints.forEach(cp => {
        insertCp.run(id, cp.checkpoint_name, cp.sequence_order, cp.lat, cp.lng, cp.status, cp.actual_time || '');
      });
    }

    db.prepare(`INSERT INTO notifications (type, message) VALUES (?, ?)`).run('CARGO', `New cargo ${id} added for ${flight_number}`);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cargo/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { flight_number, aircraft_name, origin, destination, cargo_type, weight_kg, volume_cbm, sender_details, receiver_details, departure_time, eta, checkpoints } = req.body;
    
    db.prepare(`
      UPDATE manual_cargo 
      SET flight_number=?, aircraft_name=?, origin=?, destination=?, cargo_type=?, weight_kg=?, volume_cbm=?, sender_details=?, receiver_details=?, departure_time=?, eta=?
      WHERE id=?
    `).run(flight_number, aircraft_name, origin, destination, cargo_type, weight_kg, volume_cbm, sender_details, receiver_details, departure_time, eta, id);
    
    if (checkpoints && checkpoints.length > 0) {
      db.prepare(`DELETE FROM cargo_checkpoints WHERE cargo_id=?`).run(id);
      const insertCp = db.prepare(`INSERT INTO cargo_checkpoints (cargo_id, checkpoint_name, sequence_order, lat, lng, status, actual_time) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      checkpoints.forEach(cp => {
        insertCp.run(id, cp.checkpoint_name, cp.sequence_order, cp.lat, cp.lng, cp.status, cp.actual_time || '');
      });
    }

    db.prepare(`INSERT INTO notifications (type, message) VALUES (?, ?)`).run('CARGO', `Cargo ${id} updated.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cargo/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`DELETE FROM cargo_checkpoints WHERE cargo_id=?`).run(id);
    db.prepare(`DELETE FROM manual_cargo WHERE id=?`).run(id);
    db.prepare(`INSERT INTO notifications (type, message) VALUES (?, ?)`).run('CARGO', `Cargo ${id} deleted.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notifications', (req, res) => {
  try {
    res.json(db.prepare(`SELECT * FROM notifications ORDER BY id DESC`).all());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chatbot', (req, res) => {
  const { message, flightId } = req.body;
  // Stub for LangChain agent response since we lack API keys
  let reply = "Agentic AI Response: Analyzing request...";
  if (message.toLowerCase().includes("risk")) {
    reply = "Flight presents a HIGH risk due to active SIGMET ahead. Re-routing recommended via waypoint GIVAL.";
  } else if (message.toLowerCase().includes("fuel")) {
    reply = "Current fuel burn is optimal. Estimated minimum fuel requirement met for destination + alternate.";
  } else if (message.toLowerCase().includes("metadata")) {
    reply = "Fetching blockchain integrity metrics... Manifest hash verified.";
  } else {
    reply = `Understood. I have logged '${message}'. System state nominal.`;
  }
  
  setTimeout(() => res.json({ reply }), 1500);
});

const server = http.createServer(app);

// Start Websocket Simulation
startSimulation(server);

const PORT = process.env.PORT || 6002;
server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
