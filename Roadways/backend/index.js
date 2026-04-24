const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const { initDatabase, getDb } = require('./db/database');
const vehicleRoutes = require('./routes/vehicles');
const tripRoutes = require('./routes/trips');
const gpsAgent = require('./agents/gpsAgent');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In‑memory vehicle map (populated from DB on start)
const vehicles = new Map();

// Load DB and seed vehicles
(async () => {
  try {
    await initDatabase();
    const db = getDb();
    const rows = await db.all('SELECT *, license_plate AS registration_number, speedKmh AS last_speed, lat AS last_lat, lng AS last_lng, heading AS last_heading FROM vehicles');
    rows.forEach(v => {
      // Ensure all fields are present for initial Map population
      if (typeof v.confirmedRoute === 'string') {
        try { v.confirmedRoute = JSON.parse(v.confirmedRoute); } catch(e) { v.confirmedRoute = []; }
      }
      vehicles.set(v.id, v);
    });
    console.log(`Loaded ${vehicles.size} vehicles from DB`);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
})();

// Broadcast helper
function broadcast(type, data) {
  const message = JSON.stringify({ type, data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// WebSocket connection handling
wss.on('connection', ws => {
  console.log('WebSocket client connected');
  ws.send(JSON.stringify({ 
    type: 'INITIAL_STATE', 
    data: { vehicles: Array.from(vehicles.values()) } 
  }));
});

// Start GPS simulation (every 10 s)
setInterval(() => {
  gpsAgent.updateVehicles(vehicles);
  // Ensure we keep registration_number and last_speed aliases in memory map
  vehicles.forEach(v => {
    v.registration_number = v.license_plate;
    v.last_speed = v.speedKmh;
    v.last_lat = v.lat;
    v.last_lng = v.lng;
    v.last_heading = v.heading;
  });
  broadcast('VEHICLE_UPDATES', Array.from(vehicles.values()));
}, parseInt(process.env.GPS_UPDATE_INTERVAL_MS) || 10000);

const PORT = process.env.PORT || 6001;
server.listen(PORT, () => console.log(`🚚 ROADWAYS backend listening on http://localhost:${PORT}`));
