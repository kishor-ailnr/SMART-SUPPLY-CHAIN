const express = require('express');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const { db, seedDatabase } = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Run seed
seedDatabase();

const server = http.createServer(app);

// Simple WebSocket Setup placeholder
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  // Send initial data
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    version: '2.0',
    flights: db.prepare('SELECT * FROM flights').all(),
    vehicles: db.prepare('SELECT * FROM vehicles').all(),
    cargo: db.prepare('SELECT * FROM cargo_shipments').all()
  }));
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
