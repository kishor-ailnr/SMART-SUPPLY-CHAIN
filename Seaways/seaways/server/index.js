import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import db, { initDb } from './utils/db.js';
import { AISAgent } from './agents/AISAgent.js';
import { CargoAgent } from './agents/CargoAgent.js';

dotenv.config();
initDb();

const PORT = process.env.PORT || 6004;
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// Agent Registry
const aisAgent = new AISAgent();
const cargoAgent = new CargoAgent();
const agents = [aisAgent, cargoAgent];

// WebSocket Clients
const clients = new Set();

const broadcast = (data) => {
  const payload = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
};

// --- Telemetry Simulation ---
// Moves vessels along their database routes to simulate real trackers.
const moveVessels = () => {
  const activeVoyages = db.prepare("SELECT * FROM voyages WHERE status = 'ACTIVE'").all();
  
  for (const vyg of activeVoyages) {
    // Current position - find last AIS position or departure if none
    const lastPos = db.prepare('SELECT * FROM ais_positions WHERE vessel_id = ? ORDER BY timestamp DESC LIMIT 1').get(vyg.vessel_id);
    const waypoints = JSON.parse(vyg.route_key);
    
    let nextIdx = 0;
    if (lastPos) {
       // Find nearest waypoint and go to next
       // Simplified: just move along the list
       // In reality, search for coordinates, but here we'll just track index in session or hidden field
    }

    // Update position logic (simplified for demo: just cycling through waypoints)
    // Real implementation would use speed & time to interpolate
    const currentWaypoint = waypoints[Math.floor(Date.now() / 10000) % waypoints.length];
    
    db.prepare(`
      INSERT INTO ais_positions (vessel_id, voyage_id, lat, lng, sog, cog, nav_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(vyg.vessel_id, vyg.id, currentWaypoint[1], currentWaypoint[0], 15.5, 285, 'Underway');

    // Trigger Agents for this vessel
    agents.forEach(agent => agent.process(vyg.vessel_id));
  }

  // Broadcast snapshot
  const snapshot = db.prepare(`
    SELECT v.*, p.lat, p.lng, p.sog, p.cog, p.nav_status 
    FROM vessels v
    LEFT JOIN (
      SELECT * FROM ais_positions 
      WHERE id IN (SELECT MAX(id) FROM ais_positions GROUP BY vessel_id)
    ) p ON v.id = p.vessel_id
  `).all();

  broadcast({ type: 'VESSEL_UPDATE', data: snapshot });
};

// Simulation Loop (every 10 seconds)
setInterval(moveVessels, 10000);

// --- Routes ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

app.get('/api/vessels', (req, res) => {
  const vessels = db.prepare(`
    SELECT v.*, p.lat, p.lng, p.sog, p.cog, p.nav_status 
    FROM vessels v
    LEFT JOIN (
      SELECT * FROM ais_positions 
      WHERE id IN (SELECT MAX(id) FROM ais_positions GROUP BY vessel_id)
    ) p ON v.id = p.vessel_id
  `).all();
  res.json(vessels);
});

app.get('/api/vessel/:id', (req, res) => {
  try {
    const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(req.params.id);
    const voyage = db.prepare("SELECT * FROM voyages WHERE vessel_id = ? AND status = 'ACTIVE'").get(req.params.id);
    const alerts = db.prepare('SELECT * FROM intelligence_events WHERE vessel_id = ? ORDER BY created_at DESC LIMIT 10').all(req.params.id);
    const position = db.prepare('SELECT * FROM ais_positions WHERE vessel_id = ? ORDER BY timestamp DESC LIMIT 1').get(req.params.id);
    
    res.json({ ...vessel, voyage, alerts, position });
  } catch (error) {
    console.error(`Error fetching vessel ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/api/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM intelligence_events ORDER BY created_at DESC LIMIT 50').all();
  res.json(alerts);
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  let reply = "I'm analyzing the maritime data streams. Could you specify which vessel or zone you're inquiring about?";

  if (lowerMsg.includes('vessel') || lowerMsg.includes('fleet')) {
    const count = db.prepare('SELECT COUNT(*) as count FROM vessels').get().count;
    reply = `We currently have ${count} active vessels under monitoring. MUMBAI EXPRESS and KRISHNA SPIRIT are currently reporting optimal parameters.`;
  } else if (lowerMsg.includes('risk') || lowerMsg.includes('alert')) {
    const alerts = db.prepare('SELECT COUNT(*) as count FROM intelligence_events WHERE severity = "CRITICAL"').get().count;
    reply = `System scan complete. Found ${alerts} critical risk factors. Most significant is a weather anomaly near the Arabian Sea affecting southbound routes.`;
  } else if (lowerMsg.includes('eta') || lowerMsg.includes('arrival')) {
    reply = "MV MUMBAI EXPRESS is on schedule for Jebel Ali. ETA is stabilized at 04:30 UTC tomorrow.";
  }

  res.json({ reply });
});

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

server.listen(PORT, () => console.log(`SEAWAYS 2.0 Server Active on Port ${PORT}`));
