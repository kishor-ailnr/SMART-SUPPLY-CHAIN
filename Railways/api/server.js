import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupDB } from './db/setup.js';

dotenv.config({ path: '../.env' });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

// Initialize DB
const db = setupDB();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'RAILWAYS 2.0 SYSTEM ONLINE', time: new Date().toISOString() });
});

app.get('/api/trains/active', (req, res) => {
  try {
    const trains = db.prepare('SELECT * FROM trains WHERE is_active = 1').all();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trains/:id/route', (req, res) => {
  try {
    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(req.params.id);
    if (!train) return res.status(404).json({error: 'Train not found'});

    let stations = [];
    let geometry = [];

    // Route logic based on train number / route type
    if (train.train_number === '12301') { // NDLS - HWH
      stations = [
        { code: 'NDLS', name: 'New Delhi', lat: 28.6139, lng: 77.2090, status: 'PASSED' },
        { code: 'CNB', name: 'Kanpur Central', lat: 26.4499, lng: 80.3319, status: 'PASSED' },
        { code: 'PRYJ', name: 'Prayagraj Jn', lat: 25.4484, lng: 81.8333, status: 'CURRENT' },
        { code: 'HWH', name: 'Howrah Jn', lat: 22.5726, lng: 88.3639, status: 'UPCOMING' }
      ];
      geometry = [[28.61, 77.21], [27.5, 78.5], [26.45, 80.33], [25.45, 81.83], [24.5, 85.5], [22.57, 88.36]];
    } else if (train.train_number === '22119') { // Mumbai - Shirdi
      stations = [
        { code: 'CSTM', name: 'Mumbai CSMT', lat: 18.9400, lng: 72.8354, status: 'PASSED' },
        { code: 'KYN', name: 'Kalyan Jn', lat: 19.2355, lng: 73.1301, status: 'CURRENT' },
        { code: 'NK', name: 'Nashik Road', lat: 19.9615, lng: 73.8213, status: 'UPCOMING' },
        { code: 'SNSI', name: 'Shirdi', lat: 19.7719, lng: 74.4719, status: 'UPCOMING' }
      ];
      geometry = [[18.94, 72.83], [19.23, 73.13], [19.6, 73.5], [19.96, 73.82], [19.77, 74.47]];
    } else if (train.is_metro) { // Bangalore Metro Purple
      stations = [
        { code: 'WHIT', name: 'Whitefield', lat: 12.9961, lng: 77.7616, status: 'PASSED' },
        { code: 'IND', name: 'Indiranagar', lat: 12.9784, lng: 77.6385, status: 'CURRENT' },
        { code: 'CHAL', name: 'Challaghatta', lat: 12.8914, lng: 77.4526, status: 'UPCOMING' }
      ];
      geometry = [[12.99, 77.76], [12.98, 77.68], [12.97, 77.63], [12.94, 77.55], [12.89, 77.45]];
    } else {
      // Default generic route for other demo trains
      stations = [
        { code: 'ORG', name: 'Origin Station', lat: train.zone === 'SR' ? 13.08 : 22.0, lng: train.zone === 'SR' ? 80.27 : 78.0, status: 'PASSED' },
        { code: 'MID', name: 'Mid Point', lat: train.zone === 'SR' ? 11.01 : 21.0, lng: train.zone === 'SR' ? 76.95 : 79.0, status: 'CURRENT' },
        { code: 'DEST', name: 'Destination', lat: train.zone === 'SR' ? 8.48 : 20.0, lng: train.zone === 'SR' ? 76.95 : 80.0, status: 'UPCOMING' }
      ];
      geometry = [
        [stations[0].lat, stations[0].lng],
        [stations[1].lat, stations[1].lng],
        [stations[2].lat, stations[2].lng]
      ];
    }

    res.json({ stations, geometry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trains/:id/status', (req, res) => {
  try {
    // Generate mock realistic live status dynamically
    const trainInfo = db.prepare('SELECT * FROM trains WHERE id = ?').get(req.params.id);
    if (!trainInfo) return res.status(404).json({error: 'Train not found'});
    
    // For demo purposes, we will return a simulated status based on its train type
    const baseLat = 22.0 + Math.random() * 5;
    const baseLng = 78.0 + Math.random() * 5;
    
    const maxSpeed = trainInfo.max_speed_kmh || 110;
    const currentSpeed = Math.floor(Math.random() * (maxSpeed - 20) + 20);

    const positions = {
      train_id: req.params.id,
      timestamp: new Date().toISOString(),
      lat: baseLat,
      lng: baseLng,
      speed_kmh: currentSpeed,
      heading: Math.floor(Math.random() * 360),
      current_section: "Simulation Section",
      status: Math.random() > 0.8 ? "DELAYED_MINOR" : "ON_TIME",
      delay_minutes: Math.random() > 0.8 ? Math.floor(Math.random() * 60) : 0
    };

    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast live train data every few seconds
setInterval(() => {
  const activeTrains = db.prepare('SELECT * FROM trains WHERE is_active = 1').all();
  const simulatedPositions = activeTrains.map(train => ({
    id: train.id,
    train_number: train.train_number,
    lat: 22.0 + (Math.random() * 10 - 5),
    lng: 78.0 + (Math.random() * 10 - 5),
    speed: Math.floor(Math.random() * train.max_speed_kmh),
    heading: Math.floor(Math.random() * 360),
    delay: Math.random() > 0.8 ? Math.floor(Math.random() * 45) : 0,
    timestamp: new Date().toISOString()
  }));

  const data = JSON.stringify({ type: 'TRAIN_POSITIONS', payload: simulatedPositions });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}, 2000);

const PORT = process.env.PORT || 6003;
server.listen(PORT, () => {
  console.log(`RAILWAYS 2.0 Command Center Backend running on port ${PORT}`);
});
