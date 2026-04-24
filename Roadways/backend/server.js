require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db/init');
const { handleChat } = require('./ai/chatController');
const { generateTripReport } = require('./utils/reportGenerator');
const fs = require('fs');

// Initialize App
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let db; // Global DB instance

async function startServer() {
  try {
    db = await initializeDatabase();
    console.log('Database Connected Successfully.');

    // Import and Start Agents
    const { initAgents } = require('./agents/agentManager');
    initAgents(db, broadcast);

    const PORT = process.env.PORT || 6001;
    server.listen(PORT, () => {
      console.log(`ROADWAYS 2.0 Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

// WebSocket Management
const clients = new Set();
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New WebSocket connection');
  
  // Send initial data (Async query)
  db.all('SELECT * FROM vehicles', (err, vehicles) => {
    if (!err) ws.send(JSON.stringify({ type: 'INITIAL_STATE', data: { vehicles } }));
  });

  ws.on('close', () => clients.delete(ws));
});

function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API Routes
app.get('/api/vehicles', (req, res) => {
  db.all('SELECT * FROM vehicles', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.get('/api/vehicles/:id', (req, res) => {
  db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, vehicle) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM trips WHERE vehicle_id = ? AND status = "ACTIVE"', [req.params.id], (err, trip) => {
      res.json({ vehicle, trip });
    });
  });
});

app.get('/api/trips/:id/events', (req, res) => {
  db.all('SELECT * FROM intelligence_events WHERE vehicle_id = ? OR trip_id = ?', [req.params.id, req.params.id], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/chat', (req, res) => handleChat(req, res, db));

app.get('/api/vehicles/:id/report', (req, res) => {
  db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, vehicle) => {
    if (err || !vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    db.get('SELECT * FROM trips WHERE vehicle_id = ? AND status = "ACTIVE"', [req.params.id], (err, trip) => {
      db.all('SELECT * FROM intelligence_events WHERE vehicle_id = ?', [req.params.id], (err, events) => {
        const filename = generateTripReport(vehicle, trip, events || []);
        const filePath = path.join(__dirname, '../public/reports', filename);
        res.download(filePath);
      });
    });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

startServer();
